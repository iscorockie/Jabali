'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js/pure';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { triggerWebhookUniversal } from '@/lib/client-booking-engine';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const isRealPublishableKey =
  Boolean(publishableKey) &&
  !publishableKey.includes('replace_with_your') &&
  (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'));

const stripePromise = isRealPublishableKey ? loadStripe(publishableKey) : null;

interface EmbeddedModalProps {
  clientSecret: string;
  paymentIntentId: string;
  bookingReference: string;
  payableNowUsd: number;
  expeditionTitle: string;
  leadGuestEmail: string;
  mode: string;
  onClose: () => void;
}

function LiveStripeElementsForm({
  bookingReference,
  payableNowUsd,
  paymentIntentId,
}: {
  bookingReference: string;
  payableNowUsd: number;
  paymentIntentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success?payment_intent=${encodeURIComponent(
          paymentIntentId
        )}&ref=${encodeURIComponent(bookingReference)}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'Payment confirmation failed.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full py-3.5 px-5 rounded-xl bg-terracotta hover:bg-terracotta-hover disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Confirming with Stripe...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay ${payableNowUsd.toLocaleString()} USD Now</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function StripeEmbeddedPaymentModal({
  clientSecret,
  paymentIntentId,
  bookingReference,
  payableNowUsd,
  expeditionTitle,
  leadGuestEmail,
  mode,
  onClose,
}: EmbeddedModalProps) {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('08 / 29');
  const [cvc, setCvc] = useState('424');
  const [cardholder, setCardholder] = useState('TEST SAFARI TRAVELER');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSandboxConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg(null);

    if (cardNumber.replace(/\s+/g, '').endsWith('0002')) {
      setTimeout(() => {
        setProcessing(false);
        setErrorMsg(
          'Your card was declined (Stripe Test Card 4000 ... 0002). Use 4242 ... 4242 to succeed.'
        );
      }, 600);
      return;
    }

    try {
      await triggerWebhookUniversal({
        bookingReference,
        paymentIntentId,
        eventType: 'payment_intent.succeeded',
      });

      router.push(
        `/booking/success?payment_intent=${encodeURIComponent(
          paymentIntentId
        )}&ref=${encodeURIComponent(bookingReference)}`
      );
    } catch {
      setErrorMsg('Unable to complete test payment.');
      setProcessing(false);
    }
  };

  const useLiveElement =
    isRealPublishableKey &&
    stripePromise &&
    mode === 'stripe-live-or-test-api' &&
    !clientSecret.endsWith('_sandbox');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-parchment-light rounded-2xl border border-canopy/20 max-w-lg w-full shadow-elevated overflow-hidden my-8">
        {/* Header */}
        <div className="bg-canopy text-parchment px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tech text-acacia">
              <Lock className="w-3.5 h-3.5" />
              <span>STRIPE PAYMENT ELEMENT · REF {bookingReference}</span>
            </div>
            <h3 className="font-serif text-xl font-semibold text-white mt-1">
              Complete Expedition Payment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-parchment/70 hover:text-white hover:bg-white/10"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-parchment border border-canopy/12 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-bark-muted">{expeditionTitle}</div>
              <div className="text-xs font-mono-tech text-bark-subtle mt-0.5">
                Receipt to: {leadGuestEmail}
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-mono-tech uppercase text-bark-muted">
                Total Due Now
              </span>
              <span className="font-mono-tech text-xl font-bold text-canopy">
                ${payableNowUsd.toLocaleString()}
              </span>
            </div>
          </div>

          {useLiveElement ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#B8532E',
                    colorBackground: '#FDFBF7',
                    colorText: '#181A17',
                  },
                },
              }}
            >
              <LiveStripeElementsForm
                bookingReference={bookingReference}
                payableNowUsd={payableNowUsd}
                paymentIntentId={paymentIntentId}
              />
            </Elements>
          ) : (
            <form onSubmit={handleSandboxConfirm} className="space-y-4">
              <div className="p-3 rounded-lg bg-acacia-light border border-acacia/40 text-xs text-canopy flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <strong>Stripe Test Mode Active:</strong> Pre-filled with official Stripe test card{' '}
                  <code className="font-mono-tech font-semibold">4242 4242 4242 4242</code>. Add your{' '}
                  <code className="font-mono-tech">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in{' '}
                  <code className="font-mono-tech">.env.local</code> to mount live Stripe servers.
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                  Card Number (Stripe Test Card)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm font-mono-tech text-canopy"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-bark-muted absolute right-3.5 top-3" />
                </div>
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setCardNumber('4242 4242 4242 4242')}
                    className="text-[11px] font-mono-tech px-2 py-0.5 rounded bg-emerald-100 text-emerald-900"
                  >
                    Use 4242 (Success)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardNumber('4000 0000 0000 0002')}
                    className="text-[11px] font-mono-tech px-2 py-0.5 rounded bg-red-100 text-red-900"
                  >
                    Use 0002 (Decline Test)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm font-mono-tech text-canopy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm font-mono-tech text-canopy"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3.5 px-5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing PaymentIntent...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize ${payableNowUsd.toLocaleString()} USD &amp; Lock UWA Permits</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/booking/cancel?ref=${encodeURIComponent(bookingReference)}`)
                  }
                  className="w-full py-2.5 text-xs font-mono-tech text-bark-muted hover:text-canopy"
                >
                  Simulate Cancel / Return to Booking
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
