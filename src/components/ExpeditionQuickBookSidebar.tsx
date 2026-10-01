'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Expedition } from '@/data/expeditions';
import {
  DayAvailability,
  SafariStyle,
  calculateBookingPricing,
} from '@/lib/pricing';
import {
  fetchAvailabilityUniversal,
  createCheckoutUniversal,
} from '@/lib/client-booking-engine';
import {
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Compass,
  Loader2,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function ExpeditionQuickBookSidebar({
  expedition,
}: {
  expedition: Expedition;
}) {
  const router = useRouter();
  const [departureDate, setDepartureDate] = useState('2026-11-14');
  const [guests, setGuests] = useState(2);
  const [safariStyle, setSafariStyle] = useState<SafariStyle>('shared');
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const yearMonth = useMemo(() => {
    const parts = departureDate.split('-');
    return {
      year: parseInt(parts[0], 10) || 2026,
      month: parseInt(parts[1], 10) || 11,
    };
  }, [departureDate]);

  useEffect(() => {
    let active = true;
    fetchAvailabilityUniversal(expedition.id, yearMonth.year, yearMonth.month).then(
      (days) => {
        if (active) setAvailability(days);
      }
    );
    return () => {
      active = false;
    };
  }, [expedition.id, yearMonth.year, yearMonth.month]);

  const selectedDayInfo = useMemo(
    () => availability.find((d) => d.date === departureDate),
    [availability, departureDate]
  );

  const pricing = useMemo(
    () =>
      calculateBookingPricing({
        expeditionId: expedition.id,
        departureDate,
        guests,
        safariStyle,
        accommodationTier: 'signature',
        residencyStatus: 'foreign-non-resident',
        paymentPlan: 'deposit-plus-permits',
        addonIds: [],
      }),
    [expedition.id, departureDate, guests, safariStyle]
  );

  const handleInstantStripeCheckout = async () => {
    setSubmitting(true);
    try {
      const data = await createCheckoutUniversal({
        expeditionId: expedition.id,
        departureDate,
        guests,
        safariStyle,
        accommodationTier: 'signature',
        residencyStatus: 'foreign-non-resident',
        paymentPlan: 'deposit-plus-permits',
        addonIds: [],
        paymentMethod: 'stripe-checkout',
        leadGuest: {
          fullName: 'Dr. Clara Reynolds',
          email: 'clara.reynolds@example.com',
          phone: '+1 (415) 890-4321',
          nationality: 'United States',
          fitnessLevel: 'Moderate (Regular Hiker)',
        },
      });
      if (data.checkoutUrl.startsWith('http')) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(data.checkoutUrl);
      }
    } catch {
      router.push(
        `/booking?expedition=${encodeURIComponent(
          expedition.id
        )}&date=${encodeURIComponent(departureDate)}&guests=${guests}`
      );
    }
  };

  const totalPermitUsd = expedition.gorillaPermitUsd + expedition.chimpPermitUsd;

  return (
    <div className="bg-surface-raised rounded-2xl border-2 border-line/20 shadow-elevated overflow-hidden">
      <div className="bg-canopy text-parchment p-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-label text-acacia">
          <span>LIVE PERMIT &amp; STRIPE ENGINE</span>
          <span>{expedition.durationDays} DAYS</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-label text-3xl sm:text-4xl font-bold text-white">
            ${pricing.effectiveBasePerPersonUsd.toLocaleString()}
          </span>
          <span className="text-xs text-parchment/75">/ guest ({pricing.seasonName})</span>
        </div>
        {pricing.isGreenSeason ? (
          <div className="text-xs text-emerald-300 font-label flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Emerald Green Season Discount Applied (-${expedition.greenSeasonDiscountUsd}/pp)
            </span>
          </div>
        ) : (
          <div className="text-xs text-emerald-300 font-label">
            Emerald Season (Apr–May, Nov): $
            {(expedition.basePriceUsd - expedition.greenSeasonDiscountUsd).toLocaleString()}/pp
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Interactive Date & Guest Selector */}
        <div className="space-y-3">
          <div>
            <label
              htmlFor="sidebar-date"
              className="block text-[11px] font-label uppercase text-ink-muted mb-1"
            >
              Target Departure Date
            </label>
            <input
              id="sidebar-date"
              type="date"
              min="2026-10-02"
              max="2027-12-31"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded-xl bg-field border border-line/20 px-3.5 py-2.5 text-xs font-label font-semibold text-heading"
            />
            {selectedDayInfo && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] font-label">
                <span className="text-ink-muted">UWA Sector Status:</span>
                {selectedDayInfo.permitsRemaining > 0 ? (
                  <span className="text-pos font-semibold">
                    ✓ {selectedDayInfo.permitsRemaining} permits available
                  </span>
                ) : (
                  <span className="text-neg font-semibold">
                    Sold out — choose adjacent date
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="sidebar-guests"
                className="block text-[11px] font-label uppercase text-ink-muted mb-1"
              >
                Travelers
              </label>
              <select
                id="sidebar-guests"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-xl bg-field border border-line/20 px-3 py-2.5 text-xs font-semibold text-heading"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sidebar-style"
                className="block text-[11px] font-label uppercase text-ink-muted mb-1"
              >
                Safari Style
              </label>
              <select
                id="sidebar-style"
                value={safariStyle}
                onChange={(e) => setSafariStyle(e.target.value as SafariStyle)}
                className="w-full rounded-xl bg-field border border-line/20 px-3 py-2.5 text-xs font-semibold text-heading"
              >
                <option value="shared">Small Group (Max 6)</option>
                <option value="private">
                  Private 4x4 (+${expedition.privateVehicleUpgradePerPersonUsd})
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Permit Callout */}
        <div className="p-3.5 rounded-xl bg-acacia-light border border-acacia/40 space-y-1">
          <div className="flex items-center justify-between text-xs font-label font-semibold text-heading">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-terracotta" />
              UWA Permits ({guests}x)
            </span>
            <span>
              {totalPermitUsd > 0
                ? `+$${(totalPermitUsd * guests).toLocaleString()}`
                : 'Included'}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            {expedition.permitSummary}
          </p>
        </div>

        {/* Live Calculated Totals */}
        <div className="space-y-1.5 text-xs border-y border-line/10 py-3">
          <div className="flex justify-between">
            <span className="text-ink-muted">Total Trip &amp; Permit Value:</span>
            <span className="font-label font-bold text-heading">
              ${pricing.totalTripCostUsd.toLocaleString()} USD
            </span>
          </div>
          <div className="flex justify-between text-terracotta font-semibold">
            <span>Due Today (30% Deposit + Permits):</span>
            <span className="font-label">
              ${pricing.payableNowUsd.toLocaleString()} USD
            </span>
          </div>
        </div>

        {/* Primary Booking Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={submitting || selectedDayInfo?.permitsRemaining === 0}
            onClick={handleInstantStripeCheckout}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching Stripe Checkout...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Instant Stripe Checkout (${pricing.payableNowUsd.toLocaleString()})</span>
              </>
            )}
          </button>

          <Link
            href={`/booking?expedition=${encodeURIComponent(
              expedition.id
            )}&date=${encodeURIComponent(departureDate)}&guests=${guests}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-canopy hover:bg-canopy-moss text-parchment font-semibold text-xs transition-all"
          >
            <Calendar className="w-4 h-4 text-acacia" />
            <span>Open Full Calendar &amp; Add-On Customizer</span>
            <ArrowRight className="w-3.5 h-3.5 text-acacia" />
          </Link>

          <Link
            href={`/booking?expedition=${encodeURIComponent(
              expedition.id
            )}&date=${encodeURIComponent(departureDate)}&guests=${guests}&mode=inquiry`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-line/20 hover:bg-surface-sunk text-heading font-semibold text-xs transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-terracotta" />
            <span>Place 48-Hour Complimentary Permit Hold</span>
          </Link>
        </div>

        <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-ink-muted font-label">
          <CreditCard className="w-3.5 h-3.5 text-heading" />
          <span>Stripe Checkout &amp; Embedded Payment Element</span>
        </div>
      </div>
    </div>
  );
}
