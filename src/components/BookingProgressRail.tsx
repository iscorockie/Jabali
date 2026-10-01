'use client';

import React, { useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';

export interface RailStep {
  id: string;
  label: string;
  hint?: string;
  done?: boolean;
}

/**
 * Sticky configurator progress rail for the booking engine: scrollspy +
 * completion ticks + a jump link per step.
 */
export default function BookingProgressRail({
  steps,
  gearDone,
  gearTotal,
}: {
  steps: RailStep[];
  gearDone?: number;
  gearTotal?: number;
}) {
  const [activeId, setActiveId] = useState(steps[0]?.id || '');

  useEffect(() => {
    const nodes = steps
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [steps]);

  const completed = steps.filter((s) => s.done).length;
  const percent = Math.round((completed / Math.max(1, steps.length)) * 100);

  const jump = (id: string) => {
    const node = document.getElementById(id);
    if (!node) return;
    window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' });
  };

  return (
    <div className="no-print sticky top-[var(--header-h)] z-30 border-b border-line/12 bg-surface-raised/92 backdrop-blur-xl">
      <div className="wrap flex items-center gap-3 overflow-x-auto py-2.5">
        <span className="hidden shrink-0 font-label text-ink-subtle sm:block">
          Step {Math.min(completed + 1, steps.length)} / {steps.length}
        </span>
        <ol className="flex items-center gap-1.5">
          {steps.map((step, i) => {
            const isActive = activeId === step.id;
            return (
              <li key={step.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => jump(step.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-display text-xs font-semibold transition-all ${
                    step.done
                      ? 'border-pos/45 bg-pos-soft text-pos'
                      : isActive
                      ? 'border-canopy bg-canopy text-parchment shadow-card'
                      : 'border-line/20 text-ink-muted hover:-translate-y-px hover:text-heading'
                  }`}
                >
                  <span
                    className={`grid h-4 w-4 place-items-center rounded-full text-[0.6rem] ${
                      step.done ? 'bg-pos text-white' : isActive ? 'bg-acacia/25 text-acacia' : 'bg-ink/10 text-ink-muted'
                    }`}
                  >
                    {step.done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                  </span>
                  {step.label}
                </button>
                {i < steps.length - 1 ? (
                  <ChevronRight className="h-3 w-3 shrink-0 text-ink-subtle/60" />
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {typeof gearDone === 'number' && typeof gearTotal === 'number' ? (
            <span className="hidden font-label text-ink-subtle md:inline">
              Packing {gearDone}/{gearTotal}
            </span>
          ) : null}
          <span className="hidden items-center gap-2 sm:flex">
            <span className="h-1 w-20 overflow-hidden rounded-full bg-ink/10">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-terracotta to-pos transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="font-label text-ink-subtle">{percent}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
