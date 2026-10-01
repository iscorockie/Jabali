'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Mountain,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Scale,
  Check,
  Ticket,
} from 'lucide-react';
import { Expedition } from '@/data/expeditions';
import { useSite } from '@/components/providers/SiteProvider';
import { nightsFor } from '@/lib/format';
import WishlistButton from '@/components/WishlistButton';
import LivePermitChip from '@/components/LivePermitChip';

export default function ExpeditionCard({
  expedition,
  index = 0,
}: {
  expedition: Expedition;
  index?: number;
}) {
  const { money, compare, toggleCompare, pushToast } = useSite();
  const totalPermitUsd = expedition.gorillaPermitUsd + expedition.chimpPermitUsd;
  const greenSeasonFrom = expedition.basePriceUsd - expedition.greenSeasonDiscountUsd;
  const perDay = expedition.basePriceUsd / expedition.durationDays;
  const inCompare = compare.includes(expedition.id);

  const handleCompare = () => {
    toggleCompare(expedition.id);
    pushToast({
      tone: inCompare ? 'info' : 'success',
      title: inCompare ? 'Removed from comparison' : 'Added to comparison',
      message: inCompare
        ? `${expedition.title} is no longer in your side-by-side tray.`
        : 'Open “Compare” under the catalogue filters for the side-by-side dossier.',
    });
  };

  return (
    <article
      className="card card-hover group relative flex h-full flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
    >
      {/* ── Media ───────────────────────────────────────────────────────── */}
      <div className="media-frame h-56 sm:h-64">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={expedition.heroImage}
          alt={expedition.title}
          className="object-center"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canopy/95 via-canopy/25 to-canopy/5" />

        <div className="absolute inset-x-4 top-3.5 flex items-start justify-between gap-2">
          <span className="chip chip-onPanel !border-white/20 !bg-black/40 !text-acacia backdrop-blur-md">
            <Ticket className="h-3 w-3" />
            {expedition.badge}
          </span>
          <div className="flex items-center gap-1.5">
            <WishlistButton expeditionId={expedition.id} variant="icon" />
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-3.5 text-parchment">
          <div className="flex items-center gap-1.5 font-label text-acacia">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{expedition.primaryPark}</span>
          </div>
          <h3 className="mt-1 font-display text-[1.15rem] font-semibold leading-snug text-white sm:text-[1.3rem]">
            <Link
              href={`/expeditions/${expedition.slug}`}
              className="after:absolute after:inset-0 after:content-[''] hover:text-acacia"
            >
              {expedition.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* ── Spec strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-line/10 border-y border-line/10 bg-surface-sunk/50">
        {[
          { Icon: Calendar, text: `${expedition.durationDays}D / ${nightsFor(expedition.durationDays)}N` },
          { Icon: Users, text: `Max ${expedition.maxGroupSize} pax` },
          { Icon: Mountain, text: expedition.difficulty },
        ].map((spec) => (
          <div
            key={spec.text}
            className="flex items-center justify-center gap-1.5 px-2 py-2.5 text-ink"
            title={spec.text}
          >
            <spec.Icon className="h-3.5 w-3.5 shrink-0 text-terracotta" />
            <span className="truncate font-label text-ink-muted">{spec.text}</span>
          </div>
        ))}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
        <div className="space-y-3">
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{expedition.subtitle}</p>
          <ul className="space-y-1.5">
            {expedition.highlights.slice(0, 2).map((h) => (
              <li key={h} className="flex items-start gap-2 text-xs text-ink">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pos" />
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
          <LivePermitChip expeditionId={expedition.id} compact className="mt-1" />
        </div>

        <div className="space-y-3.5 border-t border-line/10 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="block font-label text-ink-subtle">Package from</span>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-semibold tracking-tight text-heading">
                  {money(expedition.basePriceUsd)}
                </span>
                <span className="text-xs text-ink-muted">/ guest</span>
              </div>
              <span className="mt-0.5 block font-label text-ink-subtle">
                ≈ {money(Math.round(perDay))} per day
              </span>
            </div>
            <div className="space-y-1 text-right">
              <span className="chip chip-gold !whitespace-nowrap">
                <ShieldCheck className="h-3 w-3 text-acacia-dark" />
                {totalPermitUsd > 0 ? `+${money(totalPermitUsd)} permit` : 'Permits included'}
              </span>
              <span className="block text-[0.68rem] font-semibold text-pos">
                Green season from {money(greenSeasonFrom)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Link
              href={`/booking?expedition=${encodeURIComponent(expedition.id)}`}
              className="btn btn-primary w-full !py-2.5 text-[0.82rem]"
            >
              Check permits
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleCompare}
              aria-pressed={inCompare}
              title={inCompare ? 'Remove from comparison' : 'Add to side-by-side comparison'}
              className={`btn !px-3 !py-2.5 ${
                inCompare ? 'btn-solid' : 'btn-outline'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              {inCompare ? 'Added' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
