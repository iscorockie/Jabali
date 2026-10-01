'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Sticky in-page section rail for expedition dossiers. Tracks the active
 * section with an IntersectionObserver and smooth-scrolls on click.
 */
export default function DossierNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id || '');
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0.05, 0.3, 0.6] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [sections, pathname]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jump = (id: string) => {
    const node = document.getElementById(id);
    if (!node) return;
    const y = node.getBoundingClientRect().top + window.scrollY - 132;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActive(id);
  };

  return (
    <div className="no-print sticky top-[var(--header-h)] z-30 border-y border-line/12 bg-surface-raised/92 backdrop-blur-xl">
      <div className="wrap flex items-center gap-3 overflow-x-auto py-2.5">
        <span className="hidden shrink-0 font-label text-ink-subtle sm:block">Dossier</span>
        <div className="flex items-center gap-1">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              aria-current={active === s.id}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-all ${
                active === s.id
                  ? 'bg-canopy text-parchment shadow-card'
                  : 'text-ink-muted hover:bg-ink/5 hover:text-heading'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden w-28 shrink-0 items-center gap-2 sm:flex">
          <span className="font-label text-ink-subtle">{Math.round(progress * 100)}%</span>
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-terracotta to-acacia transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
