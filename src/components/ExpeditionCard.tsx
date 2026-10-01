import React from 'react';
import Link from 'next/link';
import { Expedition } from '@/data/expeditions';
import {
  Calendar,
  Users,
  Mountain,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ExpeditionCardProps {
  expedition: Expedition;
  priority?: boolean;
}

export default function ExpeditionCard({ expedition }: ExpeditionCardProps) {
  const totalPermitUsd = expedition.gorillaPermitUsd + expedition.chimpPermitUsd;

  return (
    <article className="group bg-parchment-light rounded-2xl border border-canopy/12 overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col">
      {/* Image Header */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-canopy">
        <img
          src={expedition.heroImage}
          alt={expedition.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canopy/90 via-canopy/25 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-canopy/85 backdrop-blur-md text-parchment border border-white/15">
            <Sparkles className="w-3 h-3 text-acacia" />
            {expedition.badge}
          </span>
          <span className="font-mono-tech text-[11px] px-2.5 py-1 rounded-md bg-black/55 backdrop-blur-md text-acacia border border-white/10">
            {expedition.coordinates}
          </span>
        </div>

        {/* Bottom Overlay Location & Telemetry */}
        <div className="absolute bottom-4 left-4 right-4 text-parchment">
          <div className="flex items-center gap-1.5 text-xs text-acacia font-mono-tech uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{expedition.primaryPark}</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white mt-1 leading-snug">
            <Link
              href={`/expeditions/${expedition.slug}`}
              className="hover:text-acacia transition-colors"
            >
              {expedition.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* Telemetry Spec Strip */}
      <div className="grid grid-cols-3 divide-x divide-canopy/10 bg-parchment-dark/50 border-b border-canopy/10 text-xs">
        <div className="px-3 py-2.5 flex items-center justify-center gap-1.5 text-bark">
          <Calendar className="w-3.5 h-3.5 text-terracotta shrink-0" />
          <span className="font-mono-tech font-medium">{expedition.durationDays} Days</span>
        </div>
        <div className="px-3 py-2.5 flex items-center justify-center gap-1.5 text-bark">
          <Users className="w-3.5 h-3.5 text-canopy shrink-0" />
          <span className="font-mono-tech font-medium">Max {expedition.maxGroupSize}</span>
        </div>
        <div className="px-3 py-2.5 flex items-center justify-center gap-1.5 text-bark">
          <Mountain className="w-3.5 h-3.5 text-acacia-dark shrink-0" />
          <span className="font-mono-tech font-medium truncate">{expedition.difficulty}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <p className="text-sm text-bark-muted leading-relaxed line-clamp-3">
            {expedition.summary}
          </p>

          {/* Top 2 Highlights */}
          <ul className="space-y-1.5 pt-1">
            {expedition.highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-xs text-bark flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing + UWA Permit Transparency Box */}
        <div className="pt-4 border-t border-canopy/10 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="block text-[11px] font-mono-tech uppercase tracking-wider text-bark-subtle">
                Expedition Package From
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono-tech text-2xl font-bold text-canopy">
                  ${expedition.basePriceUsd.toLocaleString()}
                </span>
                <span className="text-xs text-bark-muted">/ guest</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-acacia-light border border-acacia/30 text-[11px] font-mono-tech font-medium text-canopy">
                <ShieldCheck className="w-3.5 h-3.5 text-acacia-dark shrink-0" />
                {totalPermitUsd > 0
                  ? `+ $${totalPermitUsd.toLocaleString()} UWA Permit`
                  : 'Park Permits Included'}
              </span>
              <span className="block text-[11px] text-emerald-800 font-mono-tech mt-1">
                Save ${expedition.greenSeasonDiscountUsd} in Green Season
              </span>
            </div>
          </div>

          {/* Dual CTAs */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/expeditions/${expedition.slug}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-canopy/20 hover:border-canopy text-canopy text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>View Dossier</span>
            </Link>
            <Link
              href={`/booking?expedition=${encodeURIComponent(expedition.id)}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              <span>Book / Dates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
