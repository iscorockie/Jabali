'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck2, Loader2, Ticket } from 'lucide-react';
import type { DayAvailability } from '@/lib/pricing';
import { fetchAvailabilityUniversal } from '@/lib/client-booking-engine';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Live UWA permit telemetry for one expedition/month. Hits `/api/availability`
 * when the server runtime is present and transparently falls back to the local
 * quota engine on static hosting.
 */
export default function LivePermitChip({
  expeditionId,
  year,
  month,
  className = '',
  compact = false,
}: {
  expeditionId: string;
  year?: number;
  month?: number;
  className?: string;
  compact?: boolean;
}) {
  // Look one month past the current month: the running month is usually already committed.
  const now = new Date();
  const shifted = now.getUTCMonth() + 2; // 1-based month index
  const rollsOver = shifted > 12;
  const targetMonth = month ?? (rollsOver ? shifted - 12 : shifted);
  const targetMonthYear = year ?? (rollsOver && month == null ? now.getUTCFullYear() + 1 : now.getUTCFullYear());

  const [days, setDays] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAvailabilityUniversal(expeditionId, targetMonthYear, targetMonth)
      .then((res) => {
        if (!active) return;
        setDays(Array.isArray(res) ? res : []);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [expeditionId, targetMonthYear, targetMonth]);

  const summary = useMemo(() => {
    const open = days.filter((d) => d.status !== 'past' && d.permitsRemaining > 0);
    const total = open.reduce((sum, d) => sum + d.permitsRemaining, 0);
    const next = open[0];
    return { openDays: open.length, total, next };
  }, [days]);

  const tone =
    failed || loading
      ? 'border-line/20 bg-surface text-ink-subtle'
      : summary.total === 0
      ? 'border-neg/35 bg-neg-soft text-neg'
      : summary.total <= 12
      ? 'border-acacia/45 bg-acacia-light text-acacia-dark'
      : 'border-pos/35 bg-pos-soft text-pos';

  const label = `${MONTH_NAMES[targetMonth - 1]} ${targetMonthYear}`;

  if (loading) {
    return (
      <span className={`chip !border-line/20 !bg-surface !text-ink-subtle ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Syncing {label} quota
      </span>
    );
  }

  return (
    <span className={`chip ${tone} ${className}`}>
      {failed ? <Ticket className="h-3 w-3" /> : <CalendarCheck2 className="h-3 w-3" />}
      {failed ? (
        <span>Quota feed offline</span>
      ) : summary.total === 0 ? (
        <span>{label} · fully committed</span>
      ) : (
        <span>
          {summary.total} permits · {summary.openDays} open {summary.openDays === 1 ? 'date' : 'dates'}
          {!compact && summary.next ? (
            <>
              {' · '}
              <Link
                href={`/booking?expedition=${encodeURIComponent(expeditionId)}&date=${summary.next.date}`}
                className="link-underline font-semibold normal-case tracking-normal underline decoration-1"
              >
                next {MONTH_NAMES[new Date(`${summary.next.date}T00:00:00Z`).getUTCMonth()]}{' '}
                {new Date(`${summary.next.date}T00:00:00Z`).getUTCDate()}
              </Link>
            </>
          ) : null}
        </span>
      )}
    </span>
  );
}
