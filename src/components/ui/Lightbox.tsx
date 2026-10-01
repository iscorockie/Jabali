'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

/** Keyboard + touch friendly image viewer with zoom and thumbnails. */
export default function Lightbox({
  images,
  openIndex,
  onClose,
}: {
  images: LightboxImage[];
  openIndex: number | null;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStart = useRef<number | null>(null);

  const open = openIndex != null;

  useEffect(() => {
    if (openIndex != null) {
      setIndex(openIndex);
      setZoomed(false);
    }
  }, [openIndex]);

  const step = useCallback(
    (dir: number) => {
      setZoomed(false);
      setIndex((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === '+' || e.key === '=') setZoomed(true);
      if (e.key === '-') setZoomed(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, step]);

  if (!open) return null;
  const active = images[index];

  return (
    <div
      className="fixed inset-0 z-[75] flex flex-col bg-[#060c08]/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="font-label text-acacia">
            Field gallery · {index + 1} / {images.length}
          </p>
          <p className="truncate text-sm text-parchment/80">{active.alt}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
            className="btn btn-onPanel !px-3 !py-2"
          >
            {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-parchment/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-auto px-2 pb-4 sm:px-6">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous photo"
          className="absolute left-2 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/45 text-parchment backdrop-blur transition-colors hover:bg-terracotta hover:text-white sm:left-5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active.src}
          src={active.src}
          alt={active.alt}
          onClick={() => setZoomed((z) => !z)}
          className={`anim-fade max-h-[70vh] rounded-2xl object-contain shadow-deep transition-transform duration-500 ${
            zoomed ? 'scale-[1.55] cursor-zoom-out' : 'cursor-zoom-in'
          }`}
        />

        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next photo"
          className="absolute right-2 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/45 text-parchment backdrop-blur transition-colors hover:bg-terracotta hover:text-white sm:right-5"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {active.caption ? (
        <p className="px-6 pb-2 text-center font-label text-parchment/70">{active.caption}</p>
      ) : null}

      <div className="flex items-center justify-center gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => {
              setIndex(i);
              setZoomed(false);
            }}
            aria-label={`View ${img.alt}`}
            className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
              i === index
                ? 'border-acacia opacity-100'
                : 'border-transparent opacity-55 hover:opacity-90'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
