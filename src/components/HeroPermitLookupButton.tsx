'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileSearch } from 'lucide-react';
import PermitLookupModal from '@/components/PermitLookupModal';

export default function HeroPermitLookupButton() {
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setLookupOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={lookupOpen}
        className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-parchment transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acacia focus-visible:ring-offset-2 focus-visible:ring-offset-canopy"
      >
        <FileSearch className="w-4 h-4 text-acacia" aria-hidden="true" />
        <span>My Booking / Permit</span>
      </button>
      {/* Keep the overlay above the navbar and outside the hero's stacking context. */}
      {lookupOpen &&
        createPortal(
          <PermitLookupModal onClose={() => setLookupOpen(false)} />,
          document.body
        )}
    </>
  );
}
