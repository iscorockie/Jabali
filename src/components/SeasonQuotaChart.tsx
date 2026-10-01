'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, TrendingDown } from 'lucide-react';
import type { Expedition } from '@/data/expeditions';
import { computeClientMonthAvailability } from '@/lib/client-booking-engine';
import { useSite } from '@/components/providers/SiteProvider';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Twelve-month permit & price heatmap for one expedition. Uses the same quota
 * engine the booking calendar talks to, so the bars always match the live
 * calendar — and it still works on static hosting.
 */
export default function SeasonQuotaChart({ expedition }: { expedition: Expedition }) {
  const router = useRouter();
  const { money } = useSite();
  const [hovered, setHovered] = useState<number | null>(null);

  const year = useMemo(() => {
    const now = new Date();
    // Roll to next year if we are already in December.
    return now.getUTCMonth() >= 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  }, []);

  const data = useMemo(() => {
    return MONTHS.map((label, idx) => {
      const month = idx + 1;
      const days = computeClientMonthAvailability(expedition.id, year, month);
      const open = days.filter((d) => d.status !== 'past' && d.permitsRemaining > 0);
      const permits = open.reduce((sum, d) => sum + d.permitsRemaining, 0);
      const green = days.some((d) => d.isGreenSeason);
      const fromPrice = open.length
        ? Math.min(...open.map((d) => d.effectiveFromPriceUsd))
        : expedition.basePriceUsd;
      return {
        label,
        month,
        permits,
        openDates: open.length,
        green,
        fromPrice,
        nextDate: open[0]?.date || '',
      };
    });
  }, [expedition, year]);

  const max = Math.max(1, ...data.map((d) => d.permits));
  const best = data.reduce((acc, d) => (d.fromPrice < acc.fromPrice ? d : acc), data[0]);
  const totalPermits = data.reduce((sum, d) => sum + d.permits, 0);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-label text-terracotta">Season &amp; quota heatmap · {year}</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-heading">
            {totalPermits.toLocaleString()} permit slots visible across {data.filter((d) => d.openDates > 0).length} open months
          </h3>
        </div>
        <div className="flex items-center gap-3 font-label text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-canopy" />
            Peak dry
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-pos" />
            Emerald green
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-line/25" />
            Committed
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-end gap-1.5 sm:gap-2.5" onMouseLeave={() => setHovered(null)}>
        {data.map((d, i) => {
          const heightPct = d.permits === 0 ? 6 : Math.max(10, Math.round((d.permits / max) * 100));
          const isBest = d.month === best.month && d.openDates > 0;
          return (
            <button
              key={d.label}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onClick={() => {
                if (d.nextDate) {
                  router.push(
                    `/booking?expedition=${encodeURIComponent(expedition.id)}&date=${d.nextDate}`
                  );
                }
              }}
              disabled={!d.nextDate}
              aria-label={`${d.label} ${year}: ${d.permits} permits across ${d.openDates} dates${
                d.nextDate ? ' — open the booking calendar' : ' — fully committed'
              }`}
              className="group/month flex flex-1 flex-col items-center gap-2 disabled:cursor-not-allowed"
            >
              <span className="relative flex h-32 w-full items-end justify-center sm:h-40">
                <span
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    d.permits === 0
                      ? 'bg-line/25'
                      : d.green
                      ? 'bg-pos/75 group-hover/month:bg-pos'
                      : 'bg-canopy/80 group-hover/month:bg-canopy'
                  } ${isBest ? 'ring-2 ring-acacia ring-offset-2 ring-offset-surface-raised' : ''}`}
                  style={{ height: `${heightPct}%` }}
                />
                {hovered === i ? (
                  <span className="anim-fade pointer-events-none absolute -top-1 left-1/2 z-10 w-40 -translate-x-1/2 -translate-y-full rounded-xl border border-line/15 bg-surface-raised p-2.5 text-left shadow-elevated">
                    <span className="block font-label text-heading">
                      {d.label} {year}
                    </span>
                    <span className="mt-1 block text-[0.7rem] leading-snug text-ink-muted">
                      {d.permits > 0
                        ? `${d.permits} permits · ${d.openDates} dates · from ${money(d.fromPrice)}`
                        : 'Fully committed — waitlist open'}
                    </span>
                  </span>
                ) : null}
              </span>
              <span
                className={`font-label transition-colors ${
                  hovered === i ? 'text-terracotta' : 'text-ink-subtle'
                }`}
              >
                {d.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-acacia/35 bg-acacia-light/60 px-4 py-3">
        <p className="inline-flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
          <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-pos" />
          <span>
            Cheapest window this year: <strong className="text-heading">{MONTHS[best.month - 1]}</strong> at{' '}
            {money(best.fromPrice)} per guest{best.green ? ' (Emerald Green Season discount applied)' : ''}.
          </span>
        </p>
        <p className="inline-flex items-center gap-1.5 font-label text-ink-subtle">
          <Info className="h-3.5 w-3.5" />
          Quotas mirror the UWA sector ledger
        </p>
      </div>
    </div>
  );
}
