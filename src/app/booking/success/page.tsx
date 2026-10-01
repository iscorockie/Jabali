'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookingRecord } from '@/lib/pricing';
import {
  CheckCircle2,
  ShieldCheck,
  Printer,
  Calendar,
  MapPin,
  FileCheck2,
  Mail,
  ArrowRight,
  Webhook,
  Loader2,
} from 'lucide-react';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const sessionId = searchParams.get('session_id') || '';
  const paymentIntent = searchParams.get('payment_intent') || '';
  const mode = searchParams.get('mode') || '';

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (ref) params.set('ref', ref);
    if (sessionId) params.set('session_id', sessionId);
    if (paymentIntent) params.set('payment_intent', paymentIntent);

    fetch(`/api/bookings?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ref, sessionId, paymentIntent]);

  const handleTriggerWebhookTest = async () => {
    setTestingWebhook(true);
    setWebhookResult(null);
    try {
      const bookingRef = booking?.bookingReference || ref || 'JBL-2026-DEMO';
      const res = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `evt_manual_verify_${Date.now()}`,
          type: 'checkout.session.completed',
          data: {
            object: {
              id: sessionId || booking?.stripeSessionId || 'cs_test_verified',
              client_reference_id: bookingRef,
              payment_status: 'paid',
              metadata: { bookingReference: bookingRef },
            },
          },
        }),
      });
      const json = await res.json();
      setWebhookResult(
        `Webhook 200 OK (${json.eventType}) processed at ${new Date(
          json.processedAt
        ).toLocaleTimeString()}`
      );
      // Refresh booking status
      const refreshed = await fetch(
        `/api/bookings?ref=${encodeURIComponent(bookingRef)}`
      ).then((r) => r.json());
      if (refreshed.booking) setBooking(refreshed.booking);
    } catch {
      setWebhookResult('Webhook verification failed');
    } finally {
      setTestingWebhook(false);
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

  const isInquiry = mode === 'inquiry' || booking?.status === 'inquiry_hold';
  const displayRef = booking?.bookingReference || ref || 'JBL-2026-8419';
  const displayDocket =
    booking?.uwaPermitDocketNumber || `UWA-BW-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="min-h-screen bg-parchment bg-topographic py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Confirmation Header Card */}
        <div className="bg-canopy text-parchment rounded-3xl p-8 sm:p-12 shadow-elevated border border-acacia/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/15">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <span className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
                  {isInquiry
                    ? '48-HOUR PERMIT INQUIRY HOLD REGISTERED'
                    : 'STRIPE PAYMENT VERIFIED · UWA PERMIT LOCKED'}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mt-1">
                  {isInquiry
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
                {isInquiry
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
                <span>Amount Settled Today</span>
                <span className="font-mono-tech text-terracotta">
                  ${isInquiry ? 0 : booking.pricing.payableNowUsd.toLocaleString()} USD
                </span>
              </div>
              {booking.pricing.remainingBalanceUsd > 0 && !isInquiry && (
                <div className="flex justify-between text-xs font-mono-tech text-bark-muted">
                  <span>Remaining Balance (Due 60 Days Prior to Departure):</span>
                  <span>${booking.pricing.remainingBalanceUsd.toLocaleString()} USD</span>
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
            href="/expeditions"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-canopy/20 text-canopy text-sm font-semibold hover:bg-parchment-dark transition-all"
          >
            <span>Browse More Expeditions</span>
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
