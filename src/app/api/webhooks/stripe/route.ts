import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  listWebhookEvents,
  recordWebhookEvent,
  updateBookingPaymentStatus,
} from '@/lib/booking-store';
import { getStripeServer } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    events: listWebhookEvents(),
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripe = getStripeServer();
  let event: Stripe.Event;
  let verifiedMode: 'verified' | 'simulated_sandbox' = 'simulated_sandbox';

  try {
    if (
      stripe &&
      signature &&
      webhookSecret &&
      !webhookSecret.includes('replace_with_your')
    ) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      verifiedMode = 'verified';
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown webhook verification error';
    console.error(`⚠️ Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const processedAt = new Date().toISOString();

  try {
    let bookingRef = 'UNKNOWN';
    let stripeObjId = event.id;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        stripeObjId = session.id;
        bookingRef =
          session.metadata?.bookingReference || session.client_reference_id || session.id;

        const updated = updateBookingPaymentStatus(bookingRef, 'paid', {
          stripeSessionId: session.id,
        });

        console.log(
          `✅ [Stripe Webhook] checkout.session.completed processed for ${bookingRef}`,
          updated?.uwaPermitDocketNumber
        );
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        stripeObjId = paymentIntent.id;
        bookingRef = paymentIntent.metadata?.bookingReference || paymentIntent.id;

        const updated = updateBookingPaymentStatus(bookingRef, 'paid', {
          stripePaymentIntentId: paymentIntent.id,
        });

        console.log(
          `✅ [Stripe Webhook] payment_intent.succeeded processed for ${bookingRef}`,
          updated?.uwaPermitDocketNumber
        );
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const obj = event.data.object as { metadata?: { bookingReference?: string }; id: string };
        stripeObjId = obj.id;
        bookingRef = obj.metadata?.bookingReference || obj.id;
        updateBookingPaymentStatus(bookingRef, 'cancelled');
        console.log(`⚠️ [Stripe Webhook] Payment cancelled/expired for ${bookingRef}`);
        break;
      }

      default:
        console.log(`ℹ️ [Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    const logEntry = recordWebhookEvent({
      id: event.id || `evt_${Date.now()}`,
      eventType: event.type,
      bookingReference: bookingRef,
      stripeObjectId: stripeObjId,
      status: verifiedMode,
      processedAt,
    });

    return NextResponse.json({
      received: true,
      eventType: event.type,
      processedAt,
      logEntry,
    });
  } catch (err) {
    console.error('Webhook handler processing error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
