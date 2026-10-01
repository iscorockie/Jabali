'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookingRecord } from '@/lib/pricing';
import {
  fetchBookingUniversal,
  triggerWebhookUniversal,
  saveLocalBooking,
} from '@/lib/client-booking-engine';
import {
  CheckCircle2,
  ShieldCheck,
  Printer,
  Calendar,
  Mail,
  ArrowRight,
  Webhook,
  Loader2,
  XCircle,
  Lock,
  Download,
  Users,
  Hourglass,
} from 'lucide-react';
import { buildIcs, copyText, downloadFile, formatDateLong } from '@/lib/format';
import { useSite } from '@/components/providers/SiteProvider';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { pushToast, money } = useSite();
  const ref = searchParams.get('ref') || '';
  const sessionId = searchParams.get('session_id') || '';
  const paymentIntent = searchParams.get('payment_intent') || '';
  const mode = searchParams.get('mode') || '';

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  // Reschedule / Manage Booking State
  const [newDepartureDate, setNewDepartureDate] = useState('');
  const [managing, setManaging] = useState(false);
  const [manageMessage, setManageMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingUniversal({ ref, sessionId, paymentIntent })
      .then((found) => {
        if (found) {
          setBooking(found);
          setNewDepartureDate(found.departureDate);
        }
      })
      .finally(() => setLoading(false));
  }, [ref, sessionId, paymentIntent]);

  const daysToDeparture = (() => {
    const target = booking?.departureDate || searchParams.get('date');
    if (!target) return null;
    const ms = new Date(`${target}T00:00:00Z`).getTime() - Date.now();
    return Math.ceil(ms / 86_400_000);
  })();

  const handleDownloadIcs = () => {
    if (!booking) return;
    const ics = buildIcs({
      uid: booking.bookingReference,
      title: `Jabali Trails — ${booking.expeditionTitle}`,
      description: [
        `Booking reference: ${booking.bookingReference}`,
        `UWA permit docket: ${booking.uwaPermitDocketNumber || 'Pending issue'}`,
        `Party: ${booking.guests} traveler(s) · ${booking.safariStyle === 'private' ? 'Private charter' : 'Small group (max 6)'}`,
        `Due now: ${money(booking.pricing.payableNowUsd)} · Balance: ${money(booking.pricing.remainingBalanceUsd)}`,
        'Trailhead briefing is at 07:30 with your UWA ranger — bring your passport and permit receipt.',
      ].join('\n'),
      startDate: booking.departureDate,
      endDate: booking.endDate || booking.departureDate,
      location: booking.expeditionTitle,
    });
    downloadFile(`${booking.bookingReference}-departure.ics`, ics, 'text/calendar');
    pushToast({
      tone: 'success',
      title: 'Calendar invite downloaded',
      message: 'Import it to keep your trek window and briefing time in sync.',
    });
  };

  const handleCopyReference = async () => {
    const ok = await copyText(booking?.bookingReference || ref);
    pushToast({
      tone: ok ? 'success' : 'error',
      title: ok ? 'Booking reference copied' : 'Copy failed',
      message: ok ? 'Use it at the trailhead desk or in the lookup tool.' : ref,
    });
  };

  const handleTriggerWebhookTest = async () => {
    setTestingWebhook(true);
    setWebhookResult(null);
    try {
      const bookingRef = booking?.bookingReference || ref || 'JBL-2026-8419';
      const json = await triggerWebhookUniversal({
        bookingReference: bookingRef,
        sessionId: sessionId || booking?.stripeSessionId || 'cs_test_verified',
        eventType: 'checkout.session.completed',
      });
      setWebhookResult(
        `Webhook 200 OK (${json.eventType}) processed at ${new Date(
          json.processedAt
        ).toLocaleTimeString()}`
      );
      const refreshed = await fetchBookingUniversal({ ref: bookingRef });
      if (refreshed) setBooking(refreshed);
    } catch {
      setWebhookResult('Webhook verification failed');
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleRescheduleDate = async () => {
    if (!booking || !newDepartureDate || newDepartureDate === booking.departureDate) return;
    setManaging(true);
    setManageMessage(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: booking.bookingReference,
          departureDate: newDepartureDate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          saveLocalBooking(data.booking);
          setBooking(data.booking);
          setManageMessage(
            `Departure date transferred to ${data.booking.departureDate} (${data.booking.pricing.seasonName}).`
          );
        }
      }
    } catch {
      setManageMessage('Unable to reschedule date right now.');
    } finally {
      setManaging(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setManaging(true);
    setManageMessage(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: booking.bookingReference,
          status: 'cancelled',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          saveLocalBooking(data.booking);
          setBooking(data.booking);
          setManageMessage(
            `Reservation ${data.booking.bookingReference} cancelled and ${data.booking.guests} UWA permits released back to the sector pool.`
          );
        }
      }
    } finally {
      setManaging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-heading">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="font-display text-lg">Verifying Expedition Dossier &amp; Permit Allocation...</span>
      </div>
    );
  }

  const isCancelled = booking?.status === 'cancelled';
  const isInquiry =
    !isCancelled && (mode === 'inquiry' || booking?.status === 'inquiry_hold');
  const displayRef = booking?.bookingReference || ref || 'JBL-2026-8419';
  const displayDocket = booking?.uwaPermitDocketNumber || 'UWA-BW-2026-594820';

  return (
    <div className="min-h-screen bg-surface bg-topographic py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Confirmation Header Card */}
        <div className="bg-canopy text-parchment rounded-3xl p-8 sm:p-12 shadow-elevated border border-acacia/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/15">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isCancelled
                    ? 'bg-neg/20 border border-neg/35'
                    : 'bg-pos-soft/20 border border-pos/30'
                }`}
              >
                {isCancelled ? (
                  <XCircle className="w-8 h-8 text-neg" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                )}
              </div>
              <div>
                <span className="font-label text-xs uppercase tracking-widest text-acacia">
                  {isCancelled
                    ? 'RESERVATION CANCELLED · PERMITS RELEASED'
                    : isInquiry
                    ? '48-HOUR PERMIT INQUIRY HOLD REGISTERED'
                    : 'STRIPE PAYMENT VERIFIED · UWA PERMIT LOCKED'}
                </span>
                <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white mt-1">
                  {isCancelled
                    ? 'Reservation Cancelled'
                    : isInquiry
                    ? 'Your Expedition Dates Are Held!'
                    : 'See You in the Equatorial Mist.'}
                </h1>
                <p className="text-sm text-parchment/80 mt-1">
                  Confirmation &amp; field dossier dispatched to{' '}
                  <strong className="text-white">
                    {booking?.leadGuest?.email || 'clara.reynolds@example.com'}
                  </strong>
                </p>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2 self-start">
              <button type="button" onClick={handleCopyReference} className="btn btn-onPanel !py-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-acacia" />
                Copy reference
              </button>
              <button type="button" onClick={handleDownloadIcs} className="btn btn-onPanel !py-2 text-xs">
                <Download className="h-3.5 w-3.5 text-acacia" />
                Add to calendar
              </button>
              <button type="button" onClick={() => window.print()} className="btn btn-onPanel !py-2 text-xs">
                <Printer className="h-3.5 w-3.5 text-acacia" />
                Print dossier
              </button>
            </div>
          </div>

          {/* Key Reference Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-label uppercase text-parchment/60">
                JABALI BOOKING REFERENCE
              </span>
              <span className="font-label text-xl font-bold text-acacia mt-1 block">
                {displayRef}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-label uppercase text-parchment/60">
                UWA PERMIT DOCKET ID
              </span>
              <span className="font-label text-lg font-bold text-emerald-400 mt-1 block">
                {displayDocket}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-label uppercase text-parchment/60">
                PAYMENT STATUS
              </span>
              <span className="font-label text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isCancelled
                  ? 'CANCELLED'
                  : isInquiry
                  ? '48h Hold ($0 Charged)'
                  : `PAID ($${(booking?.pricing?.payableNowUsd || 4250).toLocaleString()} USD)`}
              </span>
            </div>
          </div>
        </div>

        {/* Expedition & Receipt Breakdown */}
        {booking && (
          <div className="bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-10 shadow-card space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/10 pb-4">
              <div>
                <span className="font-label text-xs uppercase text-terracotta font-semibold">
                  Official Safari Manifest
                </span>
                <h2 className="font-display text-2xl font-semibold text-heading mt-0.5">
                  {booking.expeditionTitle}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-sunk font-label text-xs text-heading">
                {booking.pricing.seasonName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface border border-line/10">
                <span className="text-ink-muted block">Departure date</span>
                <strong className="font-display text-heading text-sm mt-0.5 block">
                  {formatDateLong(booking.departureDate)}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-line/10">
                <span className="text-ink-muted block">Return date</span>
                <strong className="font-display text-heading text-sm mt-0.5 block">
                  {formatDateLong(booking.endDate)}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-line/10">
                <span className="text-ink-muted block">Party</span>
                <strong className="font-display text-heading text-sm mt-0.5 block">
                  {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'} ·{' '}
                  {booking.safariStyle === 'private' ? 'Private charter' : 'Small group'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-line/10">
                <span className="text-ink-muted block">Lead Traveler</span>
                <strong className="text-heading text-sm mt-0.5 block truncate">
                  {booking.leadGuest.fullName}
                </strong>
              </div>
            </div>

            {daysToDeparture != null && daysToDeparture > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-acacia/40 bg-acacia-light/70 px-4 py-3">
                <p className="inline-flex items-center gap-2 text-sm text-heading">
                  <Hourglass className="h-4 w-4 text-terracotta" />
                  <span>
                    <strong className="font-display">{daysToDeparture} days</strong> until your
                    trailhead briefing at 07:30.
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip chip-pos">Permit docket {displayDocket}</span>
                  <a
                    href={`mailto:expeditions@jabalitrails.africa?subject=${encodeURIComponent(
                      `Pre-trek briefing · ${booking.bookingReference}`
                    )}`}
                    className="btn btn-sm btn-outline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email the field desk
                  </a>
                </div>
              </div>
            ) : null}

            {booking.leadGuest?.companions && booking.leadGuest.companions.length > 0 ? (
              <div className="rounded-2xl border border-line/12 bg-surface p-4 sm:p-5">
                <p className="flex items-center gap-1.5 font-label text-terracotta">
                  <Users className="h-3.5 w-3.5" />
                  Registered travelling party · UWA permit roster
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-surface-raised px-3 py-2 text-xs">
                    <span className="font-display font-semibold text-heading">
                      {booking.leadGuest.fullName}{' '}
                      <span className="font-label text-ink-subtle">lead traveler</span>
                    </span>
                    <span className="font-label text-ink-muted">
                      {booking.leadGuest.passportNumber ? `Passport ${booking.leadGuest.passportNumber}` : 'Passport on file'}
                      {booking.leadGuest.nationality ? ` · ${booking.leadGuest.nationality}` : ''}
                    </span>
                  </li>
                  {booking.leadGuest.companions.map((c, i) => (
                    <li
                      key={`${c.fullName}-${i}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-surface-raised px-3 py-2 text-xs"
                    >
                      <span className="font-display font-semibold text-heading">
                        {c.fullName}{' '}
                        <span className="font-label text-ink-subtle">guest {i + 2}</span>
                      </span>
                      <span className="font-label text-ink-muted">
                        {c.passportNumber ? `Passport ${c.passportNumber}` : 'Passport pending'}
                        {c.nationality ? ` · ${c.nationality}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                {booking.leadGuest.companions.length + 1 < booking.guests ? (
                  <p className="mt-2.5 text-[0.7rem] leading-relaxed text-ink-muted">
                    {booking.guests - booking.leadGuest.companions.length - 1} traveler(s) still
                    un-named. UWA requires a passport for every permit holder — send them to
                    expeditions@jabalitrails.africa at least 21 days before departure.
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Financial Summary */}
            <div className="p-5 rounded-2xl bg-surface border border-line/12 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Safari Land Package Subtotal</span>
                <span className="font-label font-semibold text-heading">
                  ${booking.pricing.safariPackageSubtotalUsd.toLocaleString()} USD
                </span>
              </div>
              {booking.pricing.permitsSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">
                    Uganda Wildlife Authority (UWA) Permits ({booking.guests}x)
                  </span>
                  <span className="font-label font-semibold text-heading">
                    ${booking.pricing.permitsSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              {booking.pricing.privateUpgradeSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Private 4x4 Land Cruiser Charter</span>
                  <span className="font-label font-semibold text-heading">
                    +${booking.pricing.privateUpgradeSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              {booking.pricing.luxuryUpgradeSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Premier Luxury Sanctuary Upgrade</span>
                  <span className="font-label font-semibold text-heading">
                    +${booking.pricing.luxuryUpgradeSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              {booking.pricing.addonsSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Optional Field Upgrades &amp; Flights</span>
                  <span className="font-label font-semibold text-heading">
                    +${booking.pricing.addonsSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-line/15 flex justify-between text-base font-bold text-heading">
                <span>{isInquiry ? 'Amount Payable to Convert Hold' : 'Amount Settled'}</span>
                <span className="font-label text-terracotta">
                  ${booking.pricing.payableNowUsd.toLocaleString()} USD
                </span>
              </div>
              {booking.pricing.remainingBalanceUsd > 0 && (
                <div className="flex justify-between text-xs font-label text-ink-muted">
                  <span>Remaining Balance (Due 60 Days Prior to Departure):</span>
                  <span>${booking.pricing.remainingBalanceUsd.toLocaleString()} USD</span>
                </div>
              )}
            </div>

            {/* Interactive Manage Booking Controls (Reschedule / Convert Hold / Cancel) */}
            <div className="no-print p-5 rounded-2xl bg-field border border-line/15 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-label text-xs uppercase font-semibold text-heading flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-terracotta" />
                  Manage Reservation &amp; UWA Permit Dates
                </span>
                {isInquiry && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/booking/checkout?ref=${encodeURIComponent(
                          booking.bookingReference
                        )}&session_id=cs_test_convert_${Date.now()}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      Pay ${booking.pricing.payableNowUsd.toLocaleString()} via Stripe Now
                    </span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label
                    htmlFor="reschedule-date"
                    className="block text-[11px] font-label uppercase text-ink-muted mb-1"
                  >
                    Transfer Departure Date (Free up to 60 Days Prior)
                  </label>
                  <input
                    id="reschedule-date"
                    type="date"
                    min="2026-10-02"
                    max="2027-12-31"
                    value={newDepartureDate}
                    onChange={(e) => setNewDepartureDate(e.target.value)}
                    className="w-full rounded-xl bg-surface-raised border border-line/20 px-3.5 py-2 text-xs font-label text-heading"
                  />
                </div>
                <button
                  type="button"
                  disabled={managing || newDepartureDate === booking.departureDate}
                  onClick={handleRescheduleDate}
                  className="px-4 py-2.5 rounded-xl bg-canopy hover:bg-canopy-moss disabled:opacity-50 text-parchment text-xs font-semibold transition-all"
                >
                  {managing ? 'Updating...' : 'Transfer Permit Date'}
                </button>
                {!isCancelled && (
                  <button
                    type="button"
                    disabled={managing}
                    onClick={handleCancelBooking}
                    className="px-4 py-2.5 rounded-xl border border-neg/35 hover:bg-neg-soft text-neg text-xs font-semibold transition-all"
                  >
                    Cancel &amp; Release Permits
                  </button>
                )}
              </div>

              {manageMessage && (
                <div className="p-3 rounded-lg bg-pos-soft border border-pos/30 text-xs text-pos font-label">
                  {manageMessage}
                </div>
              )}
            </div>

            {/* Simulated Email Preview */}
            <div className="p-5 rounded-2xl bg-field border border-line/12 space-y-3">
              <div className="flex items-center gap-2 text-xs font-label text-heading uppercase">
                <Mail className="w-4 h-4 text-terracotta" />
                <span>Automated Field Dispatch Email Sent</span>
              </div>
              <div className="text-xs text-ink-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong>Subject:</strong> [Jabali Trails Africa] Confirmed Expedition &amp; UWA Permit Docket ({displayRef})
                </p>
                <p>
                  Webale nyo, {booking.leadGuest.fullName}! Your Bwindi/Kibale permit quota has been locked under docket <strong>{displayDocket}</strong>. Lead Primatologist Moses Tumusiime and our Kampala operations desk have been assigned to your departure on <strong>{booking.departureDate}</strong>.
                </p>
              </div>
            </div>

            {/* Webhook Verification Utility */}
            <div className="no-print p-4 rounded-2xl bg-surface-sunk/60 border border-line/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-label font-semibold text-heading">
                  <Webhook className="w-4 h-4 text-terracotta" />
                  <span>Stripe Webhook Endpoint (`/api/webhooks/stripe`)</span>
                </div>
                <p className="text-xs text-ink-muted">
                  {webhookResult ||
                    'Click to simulate or re-verify a checkout.session.completed webhook event against this booking.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerWebhookTest}
                disabled={testingWebhook}
                className="px-4 py-2 rounded-xl bg-canopy hover:bg-canopy-moss text-parchment text-xs font-label font-semibold shrink-0 transition-colors"
              >
                {testingWebhook ? 'Sending Event...' : 'Test Webhook Event'}
              </button>
            </div>
          </div>
        )}

        {/* Next Actions */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-line/20 text-heading text-sm font-semibold hover:bg-surface-sunk transition-all"
          >
            <span>Open Admin Operations Console</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold transition-all"
          >
            <span>Return to Jabali Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface text-heading">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading Confirmation Dossier...</span>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
