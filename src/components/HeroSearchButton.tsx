'use client';

import { Search } from 'lucide-react';
import { useSite } from '@/components/providers/SiteProvider';

export default function HeroSearchButton() {
  const { paletteOpen, setPaletteOpen } = useSite();

  return (
    <button
      type="button"
      onClick={() => setPaletteOpen(true)}
      aria-label="Search expeditions, parks and guides"
      aria-haspopup="dialog"
      aria-expanded={paletteOpen}
      className="btn btn-onPanel"
    >
      <Search className="h-4 w-4 text-acacia" aria-hidden="true" />
      Search expeditions
      <kbd className="rounded border border-white/25 px-1.5 py-0.5 text-[0.65rem] text-parchment/75">
        ⌘K
      </kbd>
    </button>
  );
}
