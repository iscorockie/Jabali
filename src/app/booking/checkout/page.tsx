'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookingRecord } from '@/lib/pricing';
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
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12 / 28');
  const [cvc, setCvc] = useState('424');
  const [nameOnCard, setNameOnCard] = useState('DR CLARA REYNOLDS');
  const [processing, setProcessing] = useState(false);
  const [declineError, setDeclineError] = useState<string | null>(null);

  useEffect(() => {
    const query = ref
      ? `ref=${encodeURIComponent(ref)}`
      : `session_id=${encodeURIComponent(sessionId)}`;
    fetch(`/api/bookings?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking);
          if (data.booking.leadGuest?.fullName) {
            setNameOnCard(data.booking.leadGuest.fullName.toUpperCase());
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
      const bookingRef = booking?.bookingReference || ref;

      // Fire the official Stripe Webhook endpoint (`/api/webhooks/stripe`) with `checkout.session.completed`
      await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `evt_test_${Date.now()}`,
          object: 'event',
          type: 'checkout.session.completed',
          data: {
            object: {
              id: sessionId,
              object: 'checkout.session',
              payment_status: 'paid',
              client_reference_id: bookingRef,
              customer_email: booking?.leadGuest?.email || 'guest@example.com',
              amount_total: (booking?.pricing?.payableNowUsd || 4250) * 100,
              currency: 'usd',
              metadata: {
                bookingReference: bookingRef,
                expeditionId: booking?.expeditionId || 'exp-bwindi-gorilla-5d',
              },
            },
          },
        }),
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
      <div className="min-h-screen flex items-center justify-center bg-parchment text-canopy">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="font-serif text-lg">Loading Stripe Checkout Session...</span>
      </div>
    );
  }

  const payableUsd = booking?.pricing?.payableNowUsd || 4250;
  const bookingRef = booking?.bookingReference || ref || 'JBL-2026-DEMO';

  return (
    <div className="min-h-screen bg-parchment py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Top Stripe Test Mode Notice Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-acacia-light border border-acacia/50 flex flex-wrap items-center justify-between gap-3 text-xs text-canopy">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-amber-600 text-white font-mono-tech font-bold uppercase">
              STRIPE TEST MODE
            </span>
            <span>
              Session <code className="font-mono-tech font-semibold">{sessionId}</code> · Configure{' '}
              <code className="font-mono-tech">STRIPE_SECRET_KEY</code> in{' '}
              <code className="font-mono-tech">.env.local</code> for hosted{' '}
              <code className="font-mono-tech">checkout.stripe.com</code> redirect.
            </span>
          </div>
          <Link
            href={`/booking/cancel?ref=${encodeURIComponent(bookingRef)}`}
            className="inline-flex items-center gap-1 font-mono-tech font-semibold text-terracotta hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Simulate Cancel Redirect</span>
          </Link>
        </div>

        {/* Main Two-Column Stripe Checkout Card */}
        <div className="bg-white rounded-3xl shadow-elevated border border-canopy/15 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Merchant & Line Item Summary */}
          <div className="lg:col-span-6 bg-canopy text-parchment p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-acacia/20 border border-acacia/40 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-acacia" />
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-lg text-white block leading-none">
                      Jabali Trails Africa
                    </span>
                    <span className="font-mono-tech text-[10px] text-acacia uppercase">
                      Official UWA Permit &amp; Expedition Escrow
                    </span>
                  </div>
                </div>
                <span className="font-mono-tech text-xs px-2.5 py-1 rounded bg-white/10 text-parchment">
                  Ref: {bookingRef}
                </span>
              </div>

              <div>
                <span className="text-xs font-mono-tech uppercase text-parchment/70">
                  Amount Due Today
                </span>
                <div className="font-mono-tech text-4xl sm:text-5xl font-bold text-white mt-1">
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
                      <div className="text-xs text-parchment/70 font-mono-tech">
                        Departure: {booking.departureDate} · {booking.guests} Guest(s) ·{' '}
                        {booking.paymentPlan === 'deposit-plus-permits'
                          ? '30% Safari Deposit'
                          : '100% Full Package'}
                      </div>
                    </div>
                    <span className="font-mono-tech font-semibold text-white">
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
                        <div className="text-xs text-parchment/70 font-mono-tech">
                          100% upfront government permit allocation ({booking.guests}x)
                        </div>
                      </div>
                      <span className="font-mono-tech font-semibold text-acacia">
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
                      <span className="font-mono-tech font-semibold text-white">
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
              <span className="font-mono-tech">TLS 1.3 Encrypted</span>
            </div>
          </div>

          {/* Right Column: Card Payment Form */}
          <div className="lg:col-span-6 p-8 sm:p-10 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-canopy">
                Pay with Card
              </h2>
              <p className="text-xs text-bark-muted mt-1">
                Receipt &amp; UWA Permit Docket will be sent to{' '}
                <strong className="text-canopy">
                  {booking?.leadGuest?.email || 'guest@example.com'}
                </strong>
              </p>
            </div>

            <form onSubmit={handleAuthorizePayment} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="checkout-card"
                    className="text-xs font-mono-tech uppercase text-bark-muted"
                  >
                    Card Information
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCardNumber('4242 4242 4242 4242')}
                      className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold"
                    >
                      Fill 4242 (Success)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardNumber('4000 0000 0000 0002')}
                      className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-red-100 text-red-900 font-semibold"
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
                    className="w-full rounded-xl bg-parchment-light border border-canopy/20 px-4 py-3 text-sm font-mono-tech text-canopy"
                  />
                  <CreditCard className="w-4 h-4 text-bark-muted absolute right-4 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="checkout-exp"
                    className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                  >
                    Expiration (MM / YY)
                  </label>
                  <input
                    id="checkout-exp"
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-xl bg-parchment-light border border-canopy/20 px-4 py-3 text-sm font-mono-tech text-canopy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-cvc"
                    className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                  >
                    CVC
                  </label>
                  <input
                    id="checkout-cvc"
                    type="text"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full rounded-xl bg-parchment-light border border-canopy/20 px-4 py-3 text-sm font-mono-tech text-canopy"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-holder"
                  className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                >
                  Cardholder Name
                </label>
                <input
                  id="checkout-holder"
                  type="text"
                  required
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  className="w-full rounded-xl bg-parchment-light border border-canopy/20 px-4 py-3 text-sm text-canopy"
                />
              </div>

              {declineError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
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
                  className="w-full py-3 rounded-xl border border-canopy/15 hover:bg-parchment text-xs font-mono-tech text-bark-muted transition-colors"
                >
                  Cancel &amp; Return to Jabali Trails Booking
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-bark-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  Triggers <code className="font-mono-tech">checkout.session.completed</code> webhook upon authorization
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
        <div className="min-h-screen flex items-center justify-center bg-parchment text-canopy">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading Stripe Checkout...</span>
        </div>
      }
    >
      <StripeTestCheckoutContent />
    </Suspense>
  );
}
