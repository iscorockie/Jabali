'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, BadgeCheck } from 'lucide-react';
import { TESTIMONIALS } from '@/data/expeditions';

/** Auto-rotating guest dispatch carousel (pauses on hover/focus, swipeable). */
export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = TESTIMONIALS.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(() => go(1), 7500);
    return () => window.clearInterval(id);
  }, [paused, go, count]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Verified guest dispatches"
    >
      <div className="overflow-hidden rounded-3xl border border-line/12 bg-surface-raised shadow-elevated">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {TESTIMONIALS.map((item, i) => (
            <figure
              key={item.id}
              aria-hidden={i !== index}
              className="w-full shrink-0 px-6 py-8 sm:px-10 sm:py-11"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1 text-acacia">
                  {Array.from({ length: item.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-acacia" />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1.5 font-label text-pos">
                  <BadgeCheck className="h-4 w-4" />
                  Verified post-trek
                </span>
              </div>

              <Quote className="mt-5 h-7 w-7 text-terracotta/35" />

              <blockquote className="mt-2 font-display text-[1.05rem] leading-relaxed text-heading sm:text-[1.3rem] sm:leading-[1.5]">
                “{item.quote}”
              </blockquote>

              <figcaption className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-line/10 pt-5">
                <div>
                  <div className="font-display text-base font-semibold text-heading">
                    {item.guest}
                  </div>
                  <div className="text-xs text-ink-muted">{item.origin}</div>
                </div>
                <div className="text-right">
                  <div className="font-label text-terracotta">{item.expedition}</div>
                  <div className="mt-0.5 text-xs text-ink-subtle">{item.date}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show dispatch ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-9 bg-terracotta' : 'w-4 bg-ink/20 hover:bg-ink/40'
              }`}
            />
          ))}
          <span className="ml-2 font-label text-ink-subtle">
            {index + 1} / {count}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous dispatch"
            className="btn btn-outline !px-2.5 !py-2.5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next dispatch"
            className="btn btn-outline !px-2.5 !py-2.5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
