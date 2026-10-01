import React from 'react';
import Link from 'next/link';
import { Compass, Search, ArrowRight, Home, Calendar, ShieldCheck } from 'lucide-react';
import { EXPEDITIONS } from '@/data/expeditions';

export const metadata = {
  title: 'Trail not found',
  description: 'That path is not on our map — explore the expedition catalogue instead.',
};

export default function NotFound() {
  const suggestions = EXPEDITIONS.slice(0, 3);

  return (
    <div className="bg-surface bg-topographic">
      <section className="wrap py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip chip-accent mx-auto">
            <Compass className="h-3 w-3" />
            Error 404 · off the marked trail
          </span>
          <h1 className="text-hero mt-5 font-display font-semibold text-heading">
            This path is not on our map.
          </h1>
          <p className="lede mx-auto mt-4 max-w-xl">
            The page you were looking for has moved, been renamed, or never existed. Everything
            below is still exactly where you left it — use search or jump straight to a trek.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/expeditions" className="btn btn-primary btn-lg">
              <Search className="h-4 w-4" />
              Browse all expeditions
            </Link>
            <Link href="/booking" className="btn btn-outline btn-lg">
              <Calendar className="h-4 w-4 text-terracotta" />
              Check permit availability
            </Link>
            <Link href="/" className="btn btn-ghost btn-lg">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
          <p className="mt-5 font-label text-ink-subtle">
            Tip: press ⌘K (or Ctrl-K) anywhere to search parks, species, guides and actions.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {suggestions.map((exp) => (
            <Link
              key={exp.id}
              href={`/expeditions/${exp.slug}`}
              className="card card-hover media-frame group relative flex h-52 flex-col justify-end p-5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={exp.heroImage} alt={exp.title} loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-canopy/95 via-canopy/45 to-transparent" />
              <div className="relative z-10">
                <p className="font-label text-acacia">
                  {exp.durationDays} days · from ${exp.basePriceUsd.toLocaleString()}
                </p>
                <p className="mt-1 font-display text-lg font-semibold leading-snug text-parchment group-hover:text-acacia">
                  {exp.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-parchment/75">
                  <ShieldCheck className="h-3.5 w-3.5 text-acacia" />
                  {exp.permitSummary}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
          {[
            { href: '/destinations', label: 'Destinations & parks' },
            { href: '/about', label: 'Staff & guides' },
            { href: '/contact', label: 'Custom inquiry' },
            { href: '/booking#permit-guide', label: 'UWA permit guide' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="link-underline hover:text-heading">
              {l.label}
              <ArrowRight className="h-3 w-3 text-terracotta" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
