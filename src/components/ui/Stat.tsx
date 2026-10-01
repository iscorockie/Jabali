'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Animated field-counter. Counts up once the element scrolls into view.
 * Falls back to the final value when reduced motion is requested.
 */
export default function Stat({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1400,
  label,
  note,
  className = '',
  onDark = false,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  label?: string;
  note?: string;
  className?: string;
  onDark?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduce || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(value * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [value, duration]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div ref={ref} className={className}>
      <div
        className={`font-display font-semibold tracking-tight ${
          onDark ? 'text-acacia' : 'text-heading'
        }`}
        style={{ fontSize: 'clamp(1.7rem, 1.2rem + 1.5vw, 2.4rem)', lineHeight: 1.05 }}
      >
        {prefix}
        {formatted}
        {suffix}
      </div>
      {label ? (
        <div
          className={`font-label mt-1.5 ${onDark ? 'text-parchment/85' : 'text-ink-muted'}`}
        >
          {label}
        </div>
      ) : null}
      {note ? (
        <div
          className={`mt-1 text-xs leading-relaxed ${
            onDark ? 'text-parchment/65' : 'text-ink-subtle'
          }`}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
}
