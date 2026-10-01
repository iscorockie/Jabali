import React from 'react';
import Link from 'next/link';
import { DESTINATIONS, EXPEDITIONS } from '@/data/expeditions';
import { withBasePath } from '@/lib/base-path';
import {
  MapPin,
  Compass,
  Mountain,
  Calendar,
  Plane,
  ArrowRight,
  Sparkles,
  Binoculars,
} from 'lucide-react';

export const metadata = {
  title: 'Uganda National Parks & East Africa Destinations',
  description:
    'Explore Bwindi Impenetrable Forest, Kibale National Park, Queen Elizabeth NP, Murchison Falls, Kidepo Valley, and Serengeti cross-border extensions.',
};

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-parchment bg-topographic">
      {/* Hero */}
      <section className="relative bg-canopy text-parchment py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-35">
          <img
            src={withBasePath('/images/queen-elizabeth-savannah.webp')}
            alt="Queen Elizabeth National Park Uganda savannah and crater lakes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canopy via-canopy/85 to-canopy/65" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
              <Compass className="w-3.5 h-3.5" />
              ALBERTINE RIFT · VICTORIA NILE · KARAMOJA · SERENGETI
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight">
              Destinations &amp; Field Sectors
            </h1>
            <p className="text-parchment/85 text-base sm:text-lg leading-relaxed">
              Uganda sits at the ecological crossroads of Africa—where the Central African rainforest collides with the East African savannah along the snow-capped Rwenzori Mountains and the Albertine Rift.
            </p>
          </div>

          {/* Quick Jump Anchors */}
          <div className="mt-8 flex flex-wrap gap-2">
            {DESTINATIONS.map((d) => (
              <a
                key={d.id}
                href={`#${d.slug}`}
                className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-acacia hover:text-canopy text-parchment text-xs font-mono-tech border border-white/15 transition-all"
              >
                {d.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-Dive Destination Dossiers */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {DESTINATIONS.map((dest, index) => {
            const matchingExpeditions = EXPEDITIONS.filter((exp) =>
              exp.primaryPark.toLowerCase().includes(dest.name.split(' ')[0].toLowerCase())
            );

            return (
              <article
                key={dest.id}
                id={dest.slug}
                className="scroll-mt-28 bg-parchment-light rounded-3xl border border-canopy/15 shadow-card overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Image Column */}
                  <div
                    className={`lg:col-span-5 relative min-h-[340px] lg:min-h-full bg-canopy ${
                      index % 2 === 1 ? 'lg:order-2' : ''
                    }`}
                  >
                    <img
                      src={dest.heroImage}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canopy/90 via-canopy/25 to-transparent" />

                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-mono-tech font-semibold bg-canopy/85 text-acacia border border-acacia/30">
                        {dest.country}
                      </span>
                      <span className="px-3 py-1 rounded-md text-xs font-mono-tech bg-black/60 text-parchment">
                        {dest.coordinates}
                      </span>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 space-y-2 text-parchment">
                      <div className="text-xs font-mono-tech text-acacia uppercase">
                        {dest.region}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono-tech">
                        <div className="p-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                          <span className="block text-[10px] text-parchment/60">ELEVATION</span>
                          <span>{dest.elevation}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                          <span className="block text-[10px] text-parchment/60">PROTECTED AREA</span>
                          <span className="truncate block">{dest.areaSqKm}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono-tech text-terracotta uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Field Territory 0{index + 1}</span>
                      </div>
                      <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-canopy">
                        {dest.name}
                      </h2>
                      <p className="text-sm sm:text-base font-medium text-canopy/90">
                        {dest.tagline}
                      </p>
                      <p className="text-sm text-bark-muted leading-relaxed pt-1">
                        {dest.description}
                      </p>
                    </div>

                    {/* Signature Wildlife */}
                    <div>
                      <div className="text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2 flex items-center gap-1.5">
                        <Binoculars className="w-3.5 h-3.5 text-terracotta" />
                        <span>Key Wildlife &amp; Endemics</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dest.signatureSpecies.map((sp, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full text-xs font-mono-tech bg-parchment-dark text-canopy border border-canopy/10"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sectors Breakdown */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-mono-tech uppercase tracking-wider text-bark-muted flex items-center gap-1.5">
                        <Mountain className="w-3.5 h-3.5 text-terracotta" />
                        <span>Trekking Sectors &amp; Ecological Zones</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dest.sectorsOrZones.map((sec, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-parchment border border-canopy/10"
                          >
                            <div className="font-serif font-semibold text-sm text-canopy">
                              {sec.name}
                            </div>
                            <p className="text-xs text-bark-muted mt-1 leading-relaxed">
                              {sec.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics & Best Months */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-canopy/10 text-xs">
                      <div className="flex items-start gap-2.5">
                        <Plane className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-canopy">Access from Entebbe (EBB)</strong>
                          <span className="text-bark-muted">{dest.travelLogistics}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-canopy">Prime Seasonality</strong>
                          <span className="text-bark-muted">{dest.bestTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Matching Expeditions + Book CTA */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-canopy/10">
                      <div className="flex flex-wrap items-center gap-2">
                        {matchingExpeditions.slice(0, 2).map((exp) => (
                          <Link
                            key={exp.id}
                            href={`/expeditions/${exp.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-canopy hover:text-terracotta bg-acacia-light px-3 py-1.5 rounded-lg border border-acacia/30 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-terracotta" />
                            <span>{exp.title}</span>
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={
                          matchingExpeditions[0]
                            ? `/booking?expedition=${encodeURIComponent(matchingExpeditions[0].id)}`
                            : '/booking'
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-semibold transition-all"
                      >
                        <span>Book This Destination</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
