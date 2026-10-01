'use client';

import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useSite, type ToastTone } from '@/components/providers/SiteProvider';

const TONE_STYLES: Record<ToastTone, { ring: string; icon: React.ReactNode }> = {
  success: {
    ring: 'border-pos/40 bg-pos-soft',
    icon: <CheckCircle2 className="h-4 w-4 text-pos" />,
  },
  info: {
    ring: 'border-line/25 bg-surface-raised',
    icon: <Info className="h-4 w-4 text-terracotta" />,
  },
  warn: {
    ring: 'border-acacia/45 bg-acacia-light',
    icon: <AlertTriangle className="h-4 w-4 text-acacia-dark" />,
  },
  error: {
    ring: 'border-neg/40 bg-neg-soft',
    icon: <XCircle className="h-4 w-4 text-neg" />,
  },
};

/** Global field-desk notification stack (bottom-right, dismissible). */
export default function Toaster() {
  const { toasts, dismissToast } = useSite();
  if (!toasts.length) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print fixed bottom-4 right-4 z-[70] flex w-[min(23rem,calc(100vw-2rem))] flex-col gap-2.5"
    >
      {toasts.map((t) => {
        const tone = TONE_STYLES[t.tone] || TONE_STYLES.info;
        return (
          <div
            key={t.id}
            className={`anim-scale-in flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-elevated backdrop-blur-xl ${tone.ring}`}
          >
            <span className="mt-0.5 shrink-0">{tone.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold text-heading">{t.title}</p>
              {t.message ? (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{t.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="-mr-1 rounded-lg p-1 text-ink-subtle transition-colors hover:bg-ink/5 hover:text-heading"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
