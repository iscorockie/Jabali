'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EXPEDITIONS } from '@/data/expeditions';
import type { DayAvailability } from '@/lib/pricing';
import { fetchAvailabilityUniversal } from '@/lib/client-booking-engine';
import { useSite } from '@/components/providers/SiteProvider';
import {
  Calendar,
  Compass,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const GREEN_MONTHS = [4, 5, 11];

/** Build the next 15 selectable departure months from today. */
function buildMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string; year: number; month: number; green: boolean }[] = [];
  for (let i = 1; i <= 15; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    const month = d.getUTCMonth() + 1;
    const year = d.getUTCFullYear();
    const green = GREEN_MONTHS.includes(month);
    options.push({
      value: `${year}-${String(month).padStart(2, '0')}`,
      label: `${MONTH_LABELS[month - 1]} ${year}${green ? ' · Emerald Green (save up to $490)' : ''}`,
      year,
      month,
      green,
    });
  }
  return options;
}

export default function HeroQuickBookingBar() {
  const router = useRouter();
  const { money } = useSite();
  const monthOptions = useMemo(buildMonthOptions, []);

  const [selectedExpeditionId, setSelectedExpeditionId] = useState(EXPEDITIONS[0].id);
  const [monthKey, setMonthKey] = useState(monthOptions[3]?.value || monthOptions[0].value);
  const [guests, setGuests] = useState(2);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedExpedition =
    EXPEDITIONS.find((e) => e.id === selectedExpeditionId) || EXPEDITIONS[0];
  const permitTotal = selectedExpedition.gorillaPermitUsd + selectedExpedition.chimpPermitUsd;
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const isGreen = GREEN_MONTHS.includes(month);
  const effectiveFrom = selectedExpedition.basePriceUsd - (isGreen ? selectedExpedition.greenSeasonDiscountUsd : 0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAvailabilityUniversal(selectedExpeditionId, year, month)
      .then((res) => {
        if (active) setDays(Array.isArray(res) ? res : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedExpeditionId, year, month]);

  const openDates = useMemo(
    () => days.filter((d) => d.status !== 'past' && d.permitsRemaining >= guests),
    [days, guests]
  );
  const permitsTotal = openDates.reduce((sum, d) => sum + d.permitsRemaining, 0);
  const nextOpen = openDates[0];

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      expedition: selectedExpeditionId,
      guests: String(guests),
    });
    if (nextOpen) params.set('date', nextOpen.date);
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleLaunch}
      className="rounded-3xl border border-white/15 bg-canopy/80 p-4 text-parchment shadow-deep backdrop-blur-2xl sm:p-5"
    >
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-label text-acacia">
          <Sparkles className="h-3.5 w-3.5" />
          Live permit finder · Bwindi &amp; Kibale sectors
        </span>
        <span className="font-label text-parchment/55">No card needed to hold dates 48h</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Expedition */}
        <div className="md:col-span-5">
          <label htmlFor="hero-expedition" className="field-label !text-parchment/70">
            <Compass className="h-3.5 w-3.5 text-acacia" />
            Expedition
          </label>
          <select
            id="hero-expedition"
            value={selectedExpeditionId}
            onChange={(e) => setSelectedExpeditionId(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 font-display text-sm font-medium text-parchment outline-none transition-colors hover:border-acacia/60 focus:border-acacia focus:bg-white/[0.15]"
          >
            {EXPEDITIONS.map((exp) => (
              <option key={exp.id} value={exp.id} className="text-ink">
                {exp.title} · {exp.durationDays}D
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div className="md:col-span-3">
          <label htmlFor="hero-month" className="field-label !text-parchment/70">
            <Calendar className="h-3.5 w-3.5 text-acacia" />
            Departure month
          </label>
          <select
            id="hero-month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 font-display text-sm font-medium text-parchment outline-none transition-colors hover:border-acacia/60 focus:border-acacia focus:bg-white/[0.15]"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value} className="text-ink">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Guests stepper */}
        <div className="md:col-span-2">
          <span className="field-label !text-parchment/70">
            <UsersIcon />
            Travelers
          </span>
          <div className="flex items-center justify-between gap-1 rounded-xl border border-white/20 bg-white/10 px-1.5 py-1.5">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              aria-label="Fewer travelers"
              className="grid h-8 w-8 place-items-center rounded-lg text-parchment/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40"
              disabled={guests <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-display text-sm font-semibold tabular-nums">
              {guests}
              <span className="sr-only"> travelers</span>
            </span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(12, g + 1))}
              aria-label="More travelers"
              className="grid h-8 w-8 place-items-center rounded-lg text-parchment/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-40"
              disabled={guests >= 12}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-end md:col-span-2">
          <button type="submit" className="btn btn-primary w-full !py-3 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {nextOpen ? 'View open dates' : 'Check quota'}
          </button>
        </div>
      </div>

      {/* Live telemetry footer */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-parchment/80">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            {permitTotal > 0 ? (
              <>
                UWA permit {money(permitTotal)}/pp itemised at cost
              </>
            ) : (
              <>All park &amp; armed-ranger permits included</>
            )}
          </span>
          <span className="hidden h-3 w-px bg-white/20 sm:block" />
          <span className="font-label text-parchment/70">
            {selectedExpedition.trekkingSector || selectedExpedition.primaryPark}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-label">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-acacia">
              <Loader2 className="h-3 w-3 animate-spin" /> Querying UWA desk…
            </span>
          ) : nextOpen ? (
            <span className="text-parchment/85">
              <strong className="text-acacia">{openDates.length}</strong> open dates ·{' '}
              <strong className="text-acacia">{permitsTotal}</strong> permits · next{' '}
              <strong className="text-parchment">
                {new Date(`${nextOpen.date}T00:00:00Z`).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </strong>
            </span>
          ) : (
            <span className="text-parchment/85">
              No {MONTH_LABELS[month - 1]} dates for {guests} travelers — we can open a waitlist hold
            </span>
          )}
          <span className={`chip ${isGreen ? 'chip-pos !border-pos/30' : 'chip-onPanel'}`}>
            from {money(effectiveFrom)} pp
          </span>
        </div>
      </div>
    </form>
  );
}

function UsersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-acacia"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}
