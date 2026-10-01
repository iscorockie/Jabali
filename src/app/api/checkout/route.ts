import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { EXPEDITIONS, getExpeditionById } from '@/data/expeditions';
import {
  AccommodationTier,
  BookingRecord,
  PaymentGatewayMode,
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
    const paymentMethod: PaymentGatewayMode = body.paymentMethod || 'stripe-checkout';

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

    // Determine origin for redirect URLs
    const originHeader = request.headers.get('origin');
    const refererHeader = request.headers.get('referer');
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    if (originHeader) {
      baseUrl = originHeader;
    } else if (refererHeader) {
      try {
        const u = new URL(refererHeader);
        baseUrl = u.origin;
      } catch {
        // Keep default
      }
    }

    // If user selected Inquiry Hold mode, save as inquiry_hold and return confirmation URL directly
    if (paymentMethod === 'inquiry-hold') {
      const record: BookingRecord = {
        id: bookingId,
        bookingReference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'inquiry_hold',
        paymentMethod: 'inquiry-hold',
        uwaPermitDocketNumber: `UWA-HOLD-${randomCode}`,
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
        mode: 'inquiry-hold',
        bookingReference,
        bookingId,
        checkoutUrl: `/booking/success?ref=${encodeURIComponent(bookingReference)}&mode=inquiry`,
      });
    }

    const stripe = getStripeServer();

    // Attempt live/test Stripe Checkout Session creation when STRIPE_SECRET_KEY is configured
    if (stripe && isStripeConfigured()) {
      try {
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

        if (paymentPlan === 'full') {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${expedition.title} (${expedition.durationDays} Days)`,
                description: `Departure: ${departureDate} · ${pricing.seasonName} · ${
                  safariStyle === 'private' ? 'Private 4x4 Charter' : 'Small-Group (Max 6)'
                } · ${
                  accommodationTier === 'luxury' ? 'Premier Luxury Sanctuary' : 'Signature Eco-Lodge'
                }`,
                metadata: {
                  expeditionId: expedition.id,
                  stripeProductId: expedition.stripeProductId,
                },
              },
              unit_amount: pricing.effectiveBasePerPersonUsd * 100,
            },
            quantity: guests,
          });

          if (pricing.privateUpgradeSubtotalUsd > 0) {
            lineItems.push({
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Private 4x4 Land Cruiser & Dedicated Lead Naturalist Charter',
                  description: 'Exclusive vehicle & flexible daily schedule',
                },
                unit_amount: expedition.privateVehicleUpgradePerPersonUsd * 100,
              },
              quantity: guests,
            });
          }

          if (pricing.luxuryUpgradeSubtotalUsd > 0) {
            lineItems.push({
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Premier Luxury Sanctuary Accommodation Tier Upgrade',
                  description: 'Upgraded suites & private plunge pool forest sanctuaries',
                },
                unit_amount: expedition.luxuryLodgeUpgradePerPersonUsd * 100,
              },
              quantity: guests,
            });
          }
        } else {
          // 30% Safari Deposit
          const landDepositTotalUsd = Math.round(
            (pricing.safariPackageSubtotalUsd +
              pricing.privateUpgradeSubtotalUsd +
              pricing.luxuryUpgradeSubtotalUsd) *
              0.3
          );
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `30% Expedition Deposit — ${expedition.title}`,
                description: `Departure: ${departureDate} for ${guests} guest(s). Remaining 70% land balance ($${pricing.remainingBalanceUsd.toLocaleString()}) due 60 days prior to departure.`,
              },
              unit_amount: landDepositTotalUsd * 100,
            },
            quantity: 1,
          });
        }

        // UWA Permits (100% payable upfront per Uganda Wildlife Authority regulations)
        if (pricing.gorillaPermitPerPersonUsd > 0) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Official UWA Mountain Gorilla Trekking Permit (${expedition.trekkingSector || 'Bwindi'})`,
                description:
                  'Government-controlled Uganda Wildlife Authority permit (100% required upfront to lock trekking date)',
              },
              unit_amount: pricing.gorillaPermitPerPersonUsd * 100,
            },
            quantity: guests,
          });
        }

        if (pricing.chimpPermitPerPersonUsd > 0) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Official UWA Kibale Chimpanzee Tracking Permit (Kanyanchu)',
                description: 'Uganda Wildlife Authority primate tracking permit',
              },
              unit_amount: pricing.chimpPermitPerPersonUsd * 100,
            },
            quantity: guests,
          });
        }

        for (const addon of pricing.selectedAddons) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: addon.name,
              },
              unit_amount: addon.totalUsd * 100,
            },
            quantity: 1,
          });
        }

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          customer_email: leadGuest.email,
          client_reference_id: bookingReference,
          line_items: lineItems,
          metadata: {
            bookingId,
            bookingReference,
            expeditionId: expedition.id,
            expeditionTitle: expedition.title,
            departureDate,
            guests: String(guests),
            paymentPlan,
            payableNowUsd: String(pricing.payableNowUsd),
          },
          success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(
            bookingReference
          )}`,
          cancel_url: `${baseUrl}/booking/cancel?ref=${encodeURIComponent(
            bookingReference
          )}&expedition=${encodeURIComponent(expedition.slug)}`,
        });

        const record: BookingRecord = {
          id: bookingId,
          bookingReference,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'pending_payment',
          paymentMethod: 'stripe-checkout',
          stripeSessionId: session.id,
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
          sessionId: session.id,
          bookingReference,
          bookingId,
          checkoutUrl: session.url,
        });
      } catch (stripeErr) {
        console.warn(
          'Stripe API call failed or running offline; falling back to interactive Stripe Test Checkout sandbox:',
          stripeErr
        );
      }
    }

    // Fallback: Interactive Stripe Test Mode Sandbox Session (works out-of-the-box without external keys)
    const simulatedSessionId = `cs_test_jabali_${Date.now()}_${randomCode}`;
    const record: BookingRecord = {
      id: bookingId,
      bookingReference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending_payment',
      paymentMethod: paymentMethod,
      stripeSessionId: simulatedSessionId,
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
      sessionId: simulatedSessionId,
      bookingReference,
      bookingId,
      checkoutUrl: `/booking/checkout?session_id=${encodeURIComponent(
        simulatedSessionId
      )}&ref=${encodeURIComponent(bookingReference)}`,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Unable to initialize Stripe checkout session.' },
      { status: 500 }
    );
  }
}
