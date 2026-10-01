'use client';

import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import Lightbox, { type LightboxImage } from '@/components/ui/Lightbox';

const CAPTIONS = [
  'Lead silverback foraging at 2,180m · Buhoma sector',
  'Infant on the move — trekkers hold a 7m buffer',
  'Family group mid-feed, habituated research cohort',
  'Eco-lodge terrace overlooking the Virunga chain',
];

/** Field gallery strip with a full-screen lightbox (keyboard + swipe enabled). */
export default function ExpeditionGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items: LightboxImage[] = images.map((src, i) => ({
    src,
    alt: `${title} — field photograph ${i + 1}`,
    caption: CAPTIONS[i % CAPTIONS.length],
  }));

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line/10 px-5 py-3.5">
        <div>
          <p className="font-label text-terracotta">Field gallery</p>
          <p className="text-xs text-ink-muted">
            {images.length} expedition photographs · click any frame to enlarge
          </p>
        </div>
        <span className="chip hidden sm:inline-flex">
          <Maximize2 className="h-3 w-3" />
          Full screen
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 sm:grid-cols-4">
        {items.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className={`media-frame group/gallery relative overflow-hidden rounded-xl focus-visible:outline-offset-2 ${
              i === 0 ? 'col-span-2 row-span-2 h-56 sm:h-full' : 'h-28 sm:h-[7.15rem]'
            }`}
            aria-label={`Open photo ${i + 1}: ${img.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
            <span className="absolute inset-0 bg-canopy/0 transition-colors duration-300 group-hover/gallery:bg-canopy/25" />
            <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 font-label text-parchment opacity-0 backdrop-blur transition-opacity duration-300 group-hover/gallery:opacity-100">
              {i === 0 ? 'Featured frame' : `Frame 0${i + 1}`}
            </span>
          </button>
        ))}
      </div>

      <Lightbox images={items} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </div>
  );
}
