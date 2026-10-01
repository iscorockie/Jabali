'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Floating field-desk shortcut: appears after the first screenful. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`no-print fixed bottom-4 left-4 z-[62] grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-canopy text-parchment shadow-elevated transition-all duration-300 hover:bg-terracotta hover:text-white ${
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
