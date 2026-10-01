import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EXPEDITIONS, getExpeditionBySlug } from '@/data/expeditions';
import ExpeditionQuickBookSidebar from '@/components/ExpeditionQuickBookSidebar';
import {
  Calendar,
  Users,
  Mountain,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export function generateStaticParams() {
  return EXPEDITIONS.map((exp) => ({
    slug: exp.slug,
  }));
}

export default function ExpeditionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const expedition = getExpeditionBySlug(params.slug);

  if (!expedition) {
    notFound();
  }

  const totalPermitUsd = expedition.gorillaPermitUsd + expedition.chimpPermitUsd;

  return (
    <div className="min-h-screen bg-parchment">
      {/* Hero Banner */}
      <section className="relative min-h-[62vh] flex flex-col justify-end bg-canopy text-parchment overflow-hidden">
        <img
          src={expedition.heroImage}
          alt={expedition.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,34,24,0.35) 0%, rgba(17,34,24,0.75) 60%, rgba(17,34,24,0.96) 100%)',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-5">
          <Link
            href="/expeditions"
            className="inline-flex items-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider text-acacia hover:text-parchment transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Expeditions</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-terracotta text-white">
              {expedition.badge}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono-tech bg-white/10 border border-white/15 text-acacia">
              {expedition.coordinates} · {expedition.primaryPark}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold max-w-4xl leading-tight">
            {expedition.title}
          </h1>
          <p className="text-base sm:text-xl text-parchment/85 max-w-3xl">
            {expedition.subtitle}
          </p>

          {/* Telemetry Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="text-[11px] font-mono-tech uppercase text-parchment/70">Duration</div>
              <div className="font-mono-tech text-lg font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-acacia" />
                {expedition.durationDays} Days / {expedition.durationDays - 1} Nights
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="text-[11px] font-mono-tech uppercase text-parchment/70">Group Size</div>
              <div className="font-mono-tech text-lg font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-acacia" />
                Max {expedition.maxGroupSize} Guests
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="text-[11px] font-mono-tech uppercase text-parchment/70">Physical Grade</div>
              <div className="font-mono-tech text-lg font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <Mountain className="w-4 h-4 text-acacia" />
                {expedition.difficulty}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="text-[11px] font-mono-tech uppercase text-parchment/70">Trekking Sector</div>
              <div className="font-mono-tech text-sm font-semibold text-acacia truncate mt-1">
                {expedition.trekkingSector || 'Savannah & Rift'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Booking Sidebar */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 8 Columns: Dossier Content */}
            <div className="lg:col-span-8 space-y-12">
              {/* Overview */}
              <div className="bg-parchment-light rounded-2xl p-6 sm:p-8 border border-canopy/12 shadow-card space-y-5">
                <span className="font-mono-tech text-xs uppercase tracking-widest text-terracotta font-semibold">
                  Expedition Brief
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-canopy">
                  About This Journey
                </h2>
                <p className="text-bark-muted leading-relaxed text-base">
                  {expedition.summary}
                </p>

                <div className="pt-3">
                  <h3 className="font-serif text-lg font-semibold text-canopy mb-3">
                    Signature Field Highlights
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {expedition.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-parchment border border-canopy/8"
                      >
                        <Sparkles className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                        <span className="text-sm text-bark">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              <div className="space-y-6">
                <div>
                  <span className="font-mono-tech text-xs uppercase tracking-widest text-terracotta font-semibold">
                    Field Route &amp; Elevation Log
                  </span>
                  <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-canopy mt-1">
                    Day-by-Day Expedition Dossier
                  </h2>
                </div>

                <div className="space-y-4">
                  {expedition.itinerary.map((item) => (
                    <div
                      key={item.day}
                      className="bg-parchment-light rounded-2xl p-6 border border-canopy/12 shadow-sm hover:border-canopy/30 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-canopy/10">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-canopy text-acacia font-mono-tech text-xs font-bold">
                            DAY {String(item.day).padStart(2, '0')}
                          </span>
                          <h3 className="font-serif text-lg sm:text-xl font-semibold text-canopy">
                            {item.title}
                          </h3>
                        </div>
                        <span className="font-mono-tech text-xs text-bark-muted bg-parchment-dark px-2.5 py-1 rounded-md">
                          Alt: {item.altitude}
                        </span>
                      </div>

                      <p className="text-sm text-bark-muted leading-relaxed mt-4">
                        {item.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-canopy/8 flex flex-wrap items-center justify-between gap-3 text-xs text-bark">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-terracotta" />
                          <span>
                            <strong>Sanctuary / Lodge:</strong> {item.accommodation}
                          </span>
                        </div>
                        <div className="font-mono-tech text-bark-muted">
                          Meals: <strong className="text-canopy">{item.meals}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included & Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-parchment-light rounded-2xl p-6 border border-emerald-800/20 space-y-4">
                  <h3 className="font-serif text-xl font-semibold text-canopy flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Included in Base Package</span>
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-bark-muted">
                    {expedition.included.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-parchment-light rounded-2xl p-6 border border-canopy/15 space-y-4">
                  <h3 className="font-serif text-xl font-semibold text-canopy flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-terracotta" />
                    <span>Itemized / Excluded</span>
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-bark-muted">
                    {expedition.excluded.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0 mt-2" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Interactive Live Booking & Permit Configurator */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <ExpeditionQuickBookSidebar expedition={expedition} />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
