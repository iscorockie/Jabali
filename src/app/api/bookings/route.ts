import { NextRequest, NextResponse } from 'next/server';
import {
  findBooking,
  listBookings,
  modifyBookingDetails,
  updateBookingPaymentStatus,
} from '@/lib/booking-store';
import { getStripeServer, isStripeConfigured } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref');
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');

  const identifier = ref || sessionId || paymentIntentId;

  if (!identifier) {
    return NextResponse.json({
      bookings: listBookings(),
    });
  }

  let booking = findBooking(identifier);

  // If Stripe API is configured and session_id was returned from Stripe Checkout, verify status
  if (booking && booking.status === 'pending_payment' && sessionId && isStripeConfigured()) {
    const stripe = getStripeServer();
    if (stripe && !sessionId.startsWith('cs_test_jabali_')) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          booking = updateBookingPaymentStatus(booking.bookingReference, 'paid', {
            stripeSessionId: session.id,
          });
        }
      } catch {
        // Keep current record state
      }
    }
  }

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, status, departureDate, guests, safariStyle, accommodationTier } = body;

    if (!identifier) {
      return NextResponse.json({ error: 'Missing booking identifier' }, { status: 400 });
    }

    let updated;
    if (departureDate || typeof guests === 'number' || safariStyle || accommodationTier) {
      updated = modifyBookingDetails(identifier, {
        departureDate,
        guests,
        safariStyle,
        accommodationTier,
        status,
      });
    } else if (status) {
      updated = updateBookingPaymentStatus(identifier, status);
    }

    if (!updated) {
      return NextResponse.json({ error: 'Booking record not found' }, { status: 404 });
    }

    return NextResponse.json({
      booking: updated,
      message: `Booking ${updated.bookingReference} updated successfully.`,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
