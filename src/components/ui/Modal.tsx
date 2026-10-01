'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible dialog: focus capture, ESC/backdrop close, scroll lock.
 * `variant="panel"` renders the dark field-panel header used across the app.
 */
export default function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = 'md',
  variant = 'surface',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'surface' | 'panel';
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && boxRef.current) {
        const focusables = boxRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => {
      const auto = boxRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]),select,textarea,button'
      );
      auto?.focus();
    }, 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  } as const;

  const isPanel = variant === 'panel';

  return (
    <div
      className="fixed inset-0 z-[65] flex items-start justify-center overflow-y-auto bg-[#08110c]/75 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`anim-scale-in my-6 w-full overflow-hidden rounded-3xl border shadow-deep ${widths[size]} ${
          isPanel
            ? 'border-acacia/25 bg-canopy text-parchment'
            : 'border-line/15 bg-surface-raised text-ink'
        }`}
      >
        <header
          className={`flex items-start justify-between gap-4 px-6 py-5 ${
            isPanel ? 'border-b border-white/10' : 'border-b border-line/10'
          }`}
        >
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className={`font-label ${isPanel ? 'text-acacia' : 'text-terracotta'}`}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={`font-display text-xl font-semibold ${
                isPanel ? 'text-parchment' : 'text-heading'
              }`}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`rounded-xl p-2 transition-colors ${
              isPanel
                ? 'text-parchment/70 hover:bg-white/10 hover:text-white'
                : 'text-ink-subtle hover:bg-ink/5 hover:text-heading'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>

        {footer ? (
          <footer
            className={`px-6 py-4 ${
              isPanel ? 'border-t border-white/10 bg-white/5' : 'border-t border-line/10 bg-surface-sunk/60'
            }`}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
