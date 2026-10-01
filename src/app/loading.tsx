import React from 'react';
import { Compass, Loader2 } from 'lucide-react';

/** Route-transition skeleton shown while a server component streams in. */
export default function Loading() {
  return (
    <div className="bg-surface bg-topographic" aria-busy="true" aria-live="polite">
      <section className="wrap py-20 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-canopy text-acacia">
            <Compass className="h-7 w-7 animate-spin [animation-duration:3.5s]" />
          </span>
          <p className="mt-5 font-label text-terracotta">Loading field data</p>
          <h1 className="text-h3 mt-2 font-display font-semibold text-heading">
            Syncing UWA permit ledger…
          </h1>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
            Pulling sector quotas, lodge allocations and season pricing
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton h-44 w-full rounded-none" />
              <div className="space-y-3 p-6">
                <div className="skeleton h-3.5 w-1/3" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3.5 w-full" />
                <div className="skeleton h-3.5 w-5/6" />
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="skeleton h-9" />
                  <div className="skeleton h-9" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
