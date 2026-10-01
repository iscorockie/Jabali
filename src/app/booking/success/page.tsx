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
} from 'lucide-react';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center bg-parchment text-canopy">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="font-serif text-lg">Verifying Expedition Dossier &amp; Permit Allocation...</span>
      </div>
    );
  }

  const isCancelled = booking?.status === 'cancelled';
  const isInquiry =
    !isCancelled && (mode === 'inquiry' || booking?.status === 'inquiry_hold');
  const displayRef = booking?.bookingReference || ref || 'JBL-2026-8419';
  const displayDocket = booking?.uwaPermitDocketNumber || 'UWA-BW-2026-594820';

  return (
    <div className="min-h-screen bg-parchment bg-topographic py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Confirmation Header Card */}
        <div className="bg-canopy text-parchment rounded-3xl p-8 sm:p-12 shadow-elevated border border-acacia/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/15">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isCancelled
                    ? 'bg-red-500/20 border border-red-400/40'
                    : 'bg-emerald-500/20 border border-emerald-400/40'
                }`}
              >
                {isCancelled ? (
                  <XCircle className="w-8 h-8 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                )}
              </div>
              <div>
                <span className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
                  {isCancelled
                    ? 'RESERVATION CANCELLED · PERMITS RELEASED'
                    : isInquiry
                    ? '48-HOUR PERMIT INQUIRY HOLD REGISTERED'
                    : 'STRIPE PAYMENT VERIFIED · UWA PERMIT LOCKED'}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mt-1">
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

            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono-tech text-parchment self-start"
            >
              <Printer className="w-4 h-4 text-acacia" />
              <span>Print Dossier</span>
            </button>
          </div>

          {/* Key Reference Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-mono-tech uppercase text-parchment/60">
                JABALI BOOKING REFERENCE
              </span>
              <span className="font-mono-tech text-xl font-bold text-acacia mt-1 block">
                {displayRef}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-mono-tech uppercase text-parchment/60">
                UWA PERMIT DOCKET ID
              </span>
              <span className="font-mono-tech text-lg font-bold text-emerald-400 mt-1 block">
                {displayDocket}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-mono-tech uppercase text-parchment/60">
                PAYMENT STATUS
              </span>
              <span className="font-mono-tech text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
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
          <div className="bg-parchment-light rounded-3xl border border-canopy/15 p-6 sm:p-10 shadow-card space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-canopy/10 pb-4">
              <div>
                <span className="font-mono-tech text-xs uppercase text-terracotta font-semibold">
                  Official Safari Manifest
                </span>
                <h2 className="font-serif text-2xl font-semibold text-canopy mt-0.5">
                  {booking.expeditionTitle}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-parchment-dark font-mono-tech text-xs text-canopy">
                {booking.pricing.seasonName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-parchment border border-canopy/10">
                <span className="text-bark-muted block">Departure Date</span>
                <strong className="font-mono-tech text-canopy text-sm mt-0.5 block">
                  {booking.departureDate}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-parchment border border-canopy/10">
                <span className="text-bark-muted block">Return Date</span>
                <strong className="font-mono-tech text-canopy text-sm mt-0.5 block">
                  {booking.endDate}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-parchment border border-canopy/10">
                <span className="text-bark-muted block">Travelers</span>
                <strong className="font-mono-tech text-canopy text-sm mt-0.5 block">
                  {booking.guests} Guest(s) ({booking.safariStyle})
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-parchment border border-canopy/10">
                <span className="text-bark-muted block">Lead Traveler</span>
                <strong className="text-canopy text-sm mt-0.5 block truncate">
                  {booking.leadGuest.fullName}
                </strong>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-5 rounded-2xl bg-parchment border border-canopy/12 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-bark-muted">Safari Land Package Subtotal</span>
                <span className="font-mono-tech font-semibold text-canopy">
                  ${booking.pricing.safariPackageSubtotalUsd.toLocaleString()} USD
                </span>
              </div>
              {booking.pricing.permitsSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-bark-muted">
                    Uganda Wildlife Authority (UWA) Permits ({booking.guests}x)
                  </span>
                  <span className="font-mono-tech font-semibold text-canopy">
                    ${booking.pricing.permitsSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              {booking.pricing.privateUpgradeSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-bark-muted">Private 4x4 Land Cruiser Charter</span>
                  <span className="font-mono-tech font-semibold text-canopy">
                    +${booking.pricing.privateUpgradeSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              {booking.pricing.luxuryUpgradeSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-bark-muted">Premier Luxury Sanctuary Upgrade</span>
                  <span className="font-mono-tech font-semibold text-canopy">
                    +${booking.pricing.luxuryUpgradeSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              {booking.pricing.addonsSubtotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-bark-muted">Optional Field Upgrades &amp; Flights</span>
                  <span className="font-mono-tech font-semibold text-canopy">
                    +${booking.pricing.addonsSubtotalUsd.toLocaleString()} USD
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-canopy/15 flex justify-between text-base font-bold text-canopy">
                <span>{isInquiry ? 'Amount Payable to Convert Hold' : 'Amount Settled'}</span>
                <span className="font-mono-tech text-terracotta">
                  ${booking.pricing.payableNowUsd.toLocaleString()} USD
                </span>
              </div>
              {booking.pricing.remainingBalanceUsd > 0 && (
                <div className="flex justify-between text-xs font-mono-tech text-bark-muted">
                  <span>Remaining Balance (Due 60 Days Prior to Departure):</span>
                  <span>${booking.pricing.remainingBalanceUsd.toLocaleString()} USD</span>
                </div>
              )}
            </div>

            {/* Interactive Manage Booking Controls (Reschedule / Convert Hold / Cancel) */}
            <div className="no-print p-5 rounded-2xl bg-white border border-canopy/15 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono-tech text-xs uppercase font-semibold text-canopy flex items-center gap-1.5">
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
                    className="block text-[11px] font-mono-tech uppercase text-bark-muted mb-1"
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
                    className="w-full rounded-xl bg-parchment-light border border-canopy/20 px-3.5 py-2 text-xs font-mono-tech text-canopy"
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
                    className="px-4 py-2.5 rounded-xl border border-red-300 hover:bg-red-50 text-red-700 text-xs font-semibold transition-all"
                  >
                    Cancel &amp; Release Permits
                  </button>
                )}
              </div>

              {manageMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-mono-tech">
                  {manageMessage}
                </div>
              )}
            </div>

            {/* Simulated Email Preview */}
            <div className="p-5 rounded-2xl bg-white border border-canopy/12 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono-tech text-canopy uppercase">
                <Mail className="w-4 h-4 text-terracotta" />
                <span>Automated Field Dispatch Email Sent</span>
              </div>
              <div className="text-xs text-bark-muted space-y-1.5 leading-relaxed">
                <p>
                  <strong>Subject:</strong> [Jabali Trails Africa] Confirmed Expedition &amp; UWA Permit Docket ({displayRef})
                </p>
                <p>
                  Webale nyo, {booking.leadGuest.fullName}! Your Bwindi/Kibale permit quota has been locked under docket <strong>{displayDocket}</strong>. Lead Primatologist Moses Tumusiime and our Kampala operations desk have been assigned to your departure on <strong>{booking.departureDate}</strong>.
                </p>
              </div>
            </div>

            {/* Webhook Verification Utility */}
            <div className="no-print p-4 rounded-2xl bg-parchment-dark/60 border border-canopy/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono-tech font-semibold text-canopy">
                  <Webhook className="w-4 h-4 text-terracotta" />
                  <span>Stripe Webhook Endpoint (`/api/webhooks/stripe`)</span>
                </div>
                <p className="text-xs text-bark-muted">
                  {webhookResult ||
                    'Click to simulate or re-verify a checkout.session.completed webhook event against this booking.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerWebhookTest}
                disabled={testingWebhook}
                className="px-4 py-2 rounded-xl bg-canopy hover:bg-canopy-moss text-parchment text-xs font-mono-tech font-semibold shrink-0 transition-colors"
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
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-canopy/20 text-canopy text-sm font-semibold hover:bg-parchment-dark transition-all"
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
        <div className="min-h-screen flex items-center justify-center bg-parchment text-canopy">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading Confirmation Dossier...</span>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
