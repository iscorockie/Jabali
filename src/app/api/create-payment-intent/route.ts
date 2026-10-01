import { NextRequest, NextResponse } from 'next/server';
import { EXPEDITIONS, getExpeditionById } from '@/data/expeditions';
import {
  AccommodationTier,
  BookingRecord,
  PaymentPlan,
  ResidencyStatus,
  SafariStyle,
  calculateBookingPricing,
  saveBooking,
} from '@/lib/booking-store';
import { getStripeServer, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const expeditionId: string = body.expeditionId || EXPEDITIONS[0].id;
    const expedition = getExpeditionById(expeditionId) || EXPEDITIONS[0];
    const departureDate: string = body.departureDate || '2026-11-15';
    const guests: number = Math.max(1, Math.min(12, Number(body.guests) || 2));
    const safariStyle: SafariStyle = body.safariStyle === 'private' ? 'private' : 'shared';
    const accommodationTier: AccommodationTier =
      body.accommodationTier === 'luxury' ? 'luxury' : 'signature';
    const residencyStatus: ResidencyStatus = body.residencyStatus || 'foreign-non-resident';
    const paymentPlan: PaymentPlan =
      body.paymentPlan === 'deposit-plus-permits' ? 'deposit-plus-permits' : 'full';
    const addonIds: string[] = Array.isArray(body.addonIds) ? body.addonIds : [];

    const leadGuest = {
      fullName: body.leadGuest?.fullName || 'Traveler Guest',
      email: body.leadGuest?.email || 'guest@example.com',
      phone: body.leadGuest?.phone || '+1 555 019 2834',
      nationality: body.leadGuest?.nationality || 'United States',
      passportNumber: body.leadGuest?.passportNumber || '',
      fitnessLevel: body.leadGuest?.fitnessLevel || 'Moderate (Regular Hiker)',
      dietaryOrMedicalNotes: body.leadGuest?.dietaryOrMedicalNotes || '',
      companions: Array.isArray(body.leadGuest?.companions)
        ? body.leadGuest.companions
            .filter((c: { fullName?: string }) => (c?.fullName || '').trim().length > 1)
            .map((c: Record<string, unknown>) => ({
              fullName: String(c.fullName || '').trim(),
              passportNumber: String(c.passportNumber || '').trim(),
              nationality: String(c.nationality || '').trim(),
              dateOfBirth: String(c.dateOfBirth || '').trim(),
              notes: String(c.notes || '').trim(),
            }))
        : [],
    };

    const pricing = calculateBookingPricing({
      expeditionId: expedition.id,
      departureDate,
      guests,
      safariStyle,
      accommodationTier,
      residencyStatus,
      paymentPlan,
      addonIds,
    });

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `JBL-${new Date().getFullYear()}-${randomCode}`;
    const bookingId = `bk_${Date.now()}_${randomCode}`;

    const stripe = getStripeServer();

    if (stripe && isStripeConfigured()) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: pricing.payableNowUsd * 100,
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
          receipt_email: leadGuest.email,
          description: `${expedition.title} (${departureDate}) — Ref ${bookingReference}`,
          metadata: {
            bookingId,
            bookingReference,
            expeditionId: expedition.id,
            expeditionTitle: expedition.title,
            departureDate,
            guests: String(guests),
            paymentPlan,
          },
        });

        const record: BookingRecord = {
          id: bookingId,
          bookingReference,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'pending_payment',
          paymentMethod: 'stripe-elements',
          stripePaymentIntentId: paymentIntent.id,
          expeditionId: expedition.id,
          expeditionSlug: expedition.slug,
          expeditionTitle: expedition.title,
          departureDate,
          endDate: pricing.endDate,
          guests,
          safariStyle,
          accommodationTier,
          residencyStatus,
          paymentPlan,
          addonIds,
          pricing,
          leadGuest,
        };
        saveBooking(record);

        return NextResponse.json({
          mode: 'stripe-live-or-test-api',
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          bookingReference,
          bookingId,
          payableNowUsd: pricing.payableNowUsd,
        });
      } catch (err) {
        console.warn('Stripe PaymentIntent API fallback triggered:', err);
      }
    }

    const simulatedPiId = `pi_test_jabali_${Date.now()}_${randomCode}`;
    const record: BookingRecord = {
      id: bookingId,
      bookingReference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending_payment',
      paymentMethod: 'stripe-elements',
      stripePaymentIntentId: simulatedPiId,
      expeditionId: expedition.id,
      expeditionSlug: expedition.slug,
      expeditionTitle: expedition.title,
      departureDate,
      endDate: pricing.endDate,
      guests,
      safariStyle,
      accommodationTier,
      residencyStatus,
      paymentPlan,
      addonIds,
      pricing,
      leadGuest,
    };
    saveBooking(record);

    return NextResponse.json({
      mode: 'stripe-test-sandbox',
      clientSecret: `${simulatedPiId}_secret_sandbox`,
      paymentIntentId: simulatedPiId,
      bookingReference,
      bookingId,
      payableNowUsd: pricing.payableNowUsd,
    });
  } catch (error) {
    console.error('PaymentIntent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe PaymentIntent' },
      { status: 500 }
    );
  }
}
