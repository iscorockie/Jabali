'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookingRecord } from '@/lib/pricing';
import {
  fetchBookingUniversal,
  triggerWebhookUniversal,
} from '@/lib/client-booking-engine';
import {
  Lock,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
} from 'lucide-react';

function StripeTestCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id') || 'cs_test_jabali_demo';
  const ref = searchParams.get('ref') || '';

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12 / 28');
  const [cvc, setCvc] = useState('424');
  const [nameOnCard, setNameOnCard] = useState('DR CLARA REYNOLDS');
  const [processing, setProcessing] = useState(false);
  const [declineError, setDeclineError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setBooking(null);
    setBookingError(null);

    fetchBookingUniversal({
      ref,
      sessionId,
      allowDemoFallback: !ref && sessionId === 'cs_test_jabali_demo',
    })
      .then((found) => {
        if (!active) return;
        setBooking(found);
        if (found?.leadGuest?.fullName) {
          setNameOnCard(found.leadGuest.fullName.toUpperCase());
        }
      })
      .catch(() => {
        if (active) setBookingError('Unable to load your booking. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ref, sessionId]);

  const handleAuthorizePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setDeclineError(null);

    if (cardNumber.replace(/\s+/g, '').endsWith('0002')) {
      setTimeout(() => {
        setProcessing(false);
        setDeclineError(
          'Your card was declined (Stripe test decline card 4000 ... 0002). Switch to 4242 ... 4242 to complete payment.'
        );
      }, 650);
      return;
    }

    try {
      const bookingRef = booking?.bookingReference || ref || 'JBL-2026-8419';

      await triggerWebhookUniversal({
        bookingReference: bookingRef,
        sessionId,
        eventType: 'checkout.session.completed',
      });

      router.push(
        `/booking/success?session_id=${encodeURIComponent(
          sessionId
        )}&ref=${encodeURIComponent(bookingRef)}`
      );
    } catch {
      setDeclineError('Failed to process test checkout.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-heading">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="font-display text-lg">Loading Stripe Checkout Session...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-surface py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto rounded-2xl bg-surface-raised border border-line/15 p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-terracotta mx-auto" aria-hidden="true" />
          <h1 className="font-display text-2xl font-semibold text-heading">
            {bookingError ? 'Unable to Load Booking' : 'Booking Not Found'}
          </h1>
          <p role="alert" className="text-sm text-ink-muted">
            {bookingError || 'We could not find this checkout session. Check your booking reference or start a new reservation.'}
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-xl bg-canopy text-parchment px-5 py-3 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Plan &amp; Book
          </Link>
        </div>
      </div>
    );
  }

  const payableUsd = booking.pricing.payableNowUsd;
  const bookingRef = booking?.bookingReference || ref || 'JBL-2026-DEMO';

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Top Stripe Test Mode Notice Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-acacia-light border border-acacia/50 flex flex-wrap items-center justify-between gap-3 text-xs text-heading">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-warn text-white font-label font-bold uppercase">
              STRIPE TEST MODE
            </span>
            <span>
              Session <code className="font-label font-semibold">{sessionId}</code> · Configure{' '}
              <code className="font-label">STRIPE_SECRET_KEY</code> in{' '}
              <code className="font-label">.env.local</code> for hosted{' '}
              <code className="font-label">checkout.stripe.com</code> redirect.
            </span>
          </div>
          <Link
            href={`/booking/cancel?ref=${encodeURIComponent(bookingRef)}`}
            className="inline-flex items-center gap-1 font-label font-semibold text-terracotta hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Simulate Cancel Redirect</span>
          </Link>
        </div>

        {/* Main Two-Column Stripe Checkout Card */}
        <div className="bg-field rounded-3xl shadow-elevated border border-line/15 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Merchant & Line Item Summary */}
          <div className="lg:col-span-6 bg-canopy text-parchment p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-acacia/20 border border-acacia/40 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-acacia" />
                  </div>
                  <div>
                    <span className="font-display font-semibold text-lg text-white block leading-none">
                      Jabali Trails Africa
                    </span>
                    <span className="font-label text-[10px] text-acacia uppercase">
                      Official UWA Permit &amp; Expedition Escrow
                    </span>
                  </div>
                </div>
                <span className="font-label text-xs px-2.5 py-1 rounded bg-white/10 text-parchment">
                  Ref: {bookingRef}
                </span>
              </div>

              <div>
                <span className="text-xs font-label uppercase text-parchment/70">
                  Amount Due Today
                </span>
                <div className="font-label text-4xl sm:text-5xl font-bold text-white mt-1">
                  ${payableUsd.toLocaleString()}.00{' '}
                  <span className="text-lg font-normal text-parchment/70">USD</span>
                </div>
              </div>

              {/* Line Items */}
              {booking && (
                <div className="space-y-3 pt-4 border-t border-white/15 text-xs sm:text-sm">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-semibold text-white">{booking.expeditionTitle}</div>
                      <div className="text-xs text-parchment/70 font-label">
                        Departure: {booking.departureDate} · {booking.guests} Guest(s) ·{' '}
                        {booking.paymentPlan === 'deposit-plus-permits'
                          ? '30% Safari Deposit'
                          : '100% Full Package'}
                      </div>
                    </div>
                    <span className="font-label font-semibold text-white">
                      $
                      {(
                        booking.pricing.payableNowUsd -
                        booking.pricing.permitsSubtotalUsd -
                        booking.pricing.addonsSubtotalUsd
                      ).toLocaleString()}
                    </span>
                  </div>

                  {booking.pricing.permitsSubtotalUsd > 0 && (
                    <div className="flex justify-between items-start gap-3 pt-2 border-t border-white/10">
                      <div>
                        <div className="font-semibold text-acacia">
                          Official Uganda Wildlife Authority (UWA) Permits
                        </div>
                        <div className="text-xs text-parchment/70 font-label">
                          100% upfront government permit allocation ({booking.guests}x)
                        </div>
                      </div>
                      <span className="font-label font-semibold text-acacia">
                        ${booking.pricing.permitsSubtotalUsd.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {booking.pricing.selectedAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex justify-between items-start gap-3 pt-2 border-t border-white/10"
                    >
                      <span className="text-parchment/90">{addon.name}</span>
                      <span className="font-label font-semibold text-white">
                        ${addon.totalUsd.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/15 text-xs text-parchment/70 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-acacia" />
                Powered by Stripe · UWA Permit Guarantee
              </span>
              <span className="font-label">TLS 1.3 Encrypted</span>
            </div>
          </div>

          {/* Right Column: Card Payment Form */}
          <div className="lg:col-span-6 p-8 sm:p-10 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-heading">
                Pay with Card
              </h2>
              <p className="text-xs text-ink-muted mt-1">
                Receipt &amp; UWA Permit Docket will be sent to{' '}
                <strong className="text-heading">
                  {booking?.leadGuest?.email || 'guest@example.com'}
                </strong>
              </p>
            </div>

            <form onSubmit={handleAuthorizePayment} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="checkout-card"
                    className="text-xs font-label uppercase text-ink-muted"
                  >
                    Card Information
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCardNumber('4242 4242 4242 4242')}
                      className="text-[10px] font-label px-2 py-0.5 rounded bg-pos-soft text-pos font-semibold"
                    >
                      Fill 4242 (Success)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardNumber('4000 0000 0000 0002')}
                      className="text-[10px] font-label px-2 py-0.5 rounded bg-neg-soft text-neg font-semibold"
                    >
                      Fill 0002 (Decline)
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="checkout-card"
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl bg-surface-raised border border-line/20 px-4 py-3 text-sm font-label text-heading"
                  />
                  <CreditCard className="w-4 h-4 text-ink-muted absolute right-4 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="checkout-exp"
                    className="block text-xs font-label uppercase text-ink-muted mb-1"
                  >
                    Expiration (MM / YY)
                  </label>
                  <input
                    id="checkout-exp"
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-xl bg-surface-raised border border-line/20 px-4 py-3 text-sm font-label text-heading"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-cvc"
                    className="block text-xs font-label uppercase text-ink-muted mb-1"
                  >
                    CVC
                  </label>
                  <input
                    id="checkout-cvc"
                    type="text"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full rounded-xl bg-surface-raised border border-line/20 px-4 py-3 text-sm font-label text-heading"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-holder"
                  className="block text-xs font-label uppercase text-ink-muted mb-1"
                >
                  Cardholder Name
                </label>
                <input
                  id="checkout-holder"
                  type="text"
                  required
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  className="w-full rounded-xl bg-surface-raised border border-line/20 px-4 py-3 text-sm text-heading"
                />
              </div>

              {declineError && (
                <div className="p-3.5 rounded-xl bg-neg-soft border border-neg/35 text-xs text-neg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{declineError}</span>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 px-6 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-base shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying with Stripe &amp; UWA Desk...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ${payableUsd.toLocaleString()}.00 USD</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/booking/cancel?ref=${encodeURIComponent(bookingRef)}`)
                  }
                  className="w-full py-3 rounded-xl border border-line/15 hover:bg-surface text-xs font-label text-ink-muted transition-colors"
                >
                  Cancel &amp; Return to Jabali Trails Booking
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-ink-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-pos" />
                <span>
                  Triggers <code className="font-label">checkout.session.completed</code> webhook upon authorization
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StripeCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface text-heading">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading Stripe Checkout...</span>
        </div>
      }
    >
      <StripeTestCheckoutContent />
    </Suspense>
  );
}
