'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Mail, Copy, Home } from 'lucide-react';
import { copyText } from '@/lib/format';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the digest so guests can quote it to the Kampala desk.
    console.error('Jabali Trails runtime error:', error);
  }, [error]);

  const reportId = error.digest || `JB-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="bg-surface bg-topographic">
      <section className="wrap py-20 sm:py-28">
        <div className="card mx-auto max-w-2xl space-y-5 p-8 text-center sm:p-12">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neg-soft text-neg">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div>
            <p className="font-label text-terracotta">Field radio glitch</p>
            <h1 className="text-h2 mt-2 font-display font-semibold text-heading">
              Something interrupted this page
            </h1>
          </div>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-ink-muted">
            Your booking data is safe — nothing on this screen affects a permit docket or payment.
            Retry the page; if it keeps happening, quote the incident reference below and our
            Kampala desk will pick it up immediately.
          </p>

          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-line/20 bg-surface px-4 py-2">
            <span className="font-label text-ink-subtle">Incident</span>
            <span className="font-display text-sm font-semibold text-heading">{reportId}</span>
            <button
              type="button"
              onClick={() => copyText(reportId)}
              className="text-ink-subtle transition-colors hover:text-heading"
              aria-label="Copy incident reference"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <button type="button" onClick={reset} className="btn btn-primary">
              <RefreshCw className="h-4 w-4" />
              Retry this page
            </button>
            <Link href="/" className="btn btn-outline">
              <Home className="h-4 w-4" />
              Back home
            </Link>
            <a
              href={`mailto:expeditions@jabalitrails.africa?subject=${encodeURIComponent(
                `Site incident ${reportId}`
              )}`}
              className="btn btn-ghost"
            >
              <Mail className="h-4 w-4 text-terracotta" />
              Email the field desk
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
