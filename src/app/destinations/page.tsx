'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DESTINATIONS, EXPEDITIONS } from '@/data/expeditions';
import InteractiveUgandaMap from '@/components/InteractiveUgandaMap';
import {
  MapPin,
  Compass,
  Mountain,
  Calendar,
  Plane,
  ArrowRight,
  Sparkles,
  Binoculars,
  Sun,
  CloudRain,
  ShieldCheck,
  Search,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const REGION_FILTERS = [
  { id: 'all', label: 'All Field Territories (6)' },
  { id: 'primate', label: 'Primate Rainforests (Bwindi & Kibale)' },
  { id: 'savannah', label: 'Savannah & Victoria Nile' },
  { id: 'wilderness', label: 'Karamoja Frontier (Kidepo)' },
  { id: 'cross-border', label: 'Cross-Border (Serengeti)' },
];

const MONTHS = [
  { num: 1, short: 'Jan', season: 'Peak Dry', temp: '24°C / 75°F', rain: 'Low (45mm)', note: 'Prime gorilla & chimp trekking on firm forest trails.' },
  { num: 2, short: 'Feb', season: 'Peak Dry', temp: '25°C / 77°F', rain: 'Low (55mm)', note: 'Excellent Kidepo & Murchison wildlife congregations at waterholes.' },
  { num: 3, short: 'Mar', season: 'Emerald Green', temp: '23°C / 73°F', rain: 'Moderate (110mm)', note: '$400–$650 Emerald Season lodge savings; migratory birds peak.' },
  { num: 4, short: 'Apr', season: 'Emerald Green', temp: '22°C / 72°F', rain: 'High (155mm)', note: 'Lush photography conditions; abundant fruiting trees in Kibale.' },
  { num: 5, short: 'May', season: 'Emerald Green', temp: '22°C / 72°F', rain: 'Moderate (120mm)', note: 'Uncrowded trails in Bwindi and Queen Elizabeth; green season rates.' },
  { num: 6, short: 'Jun', season: 'Peak Dry', temp: '23°C / 73°F', rain: 'Very Low (35mm)', note: 'Start of primary dry season; highest demand for Bwindi permits.' },
  { num: 7, short: 'Jul', season: 'Peak Dry', temp: '23°C / 73°F', rain: 'Very Low (30mm)', note: 'Peak dry trekking in Bwindi + Mara River crossings in North Serengeti.' },
  { num: 8, short: 'Aug', season: 'Peak Dry', temp: '24°C / 75°F', rain: 'Low (45mm)', note: 'Ideal combined Uganda Gorilla + Serengeti Great Migration window.' },
  { num: 9, short: 'Sep', season: 'Peak Dry', temp: '24°C / 75°F', rain: 'Moderate (75mm)', note: 'Late dry season; superb Kazinga Channel elephant & hippo sightings.' },
  { num: 10, short: 'Oct', season: 'Emerald Green', temp: '23°C / 73°F', rain: 'Moderate (115mm)', note: 'Emerald Season discounts active; gorillas forage on lower bamboo slopes.' },
  { num: 11, short: 'Nov', season: 'Emerald Green', temp: '23°C / 73°F', rain: 'Moderate (125mm)', note: 'Dramatic mist photography in Bwindi; Emerald Season savings apply.' },
  { num: 12, short: 'Dec', season: 'Peak Dry', temp: '24°C / 75°F', rain: 'Low (50mm)', note: 'Festive dry season; crisp alpine mornings along the Albertine Rift.' },
];

export default function DestinationsPage() {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // Nov 2026 default
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [livePermitCounts, setLivePermitCounts] = useState<
    Record<string, { totalAvailableDays: number; maxPermitsOnBestDay: number; sampleDate: string }>
  >({});
  const [loadingPermits, setLoadingPermits] = useState<boolean>(false);

  // Fetch live permit telemetry from /api/availability for all destinations when month/year changes
  useEffect(() => {
    let active = true;
    setLoadingPermits(true);

    Promise.all(
      EXPEDITIONS.map((exp) =>
        fetch(
          `/api/availability?expeditionId=${encodeURIComponent(
            exp.id
          )}&year=${selectedYear}&month=${selectedMonth}`
        )
          .then((r) => r.json())
          .then((data) => ({ expId: exp.id, days: data.days || [] }))
          .catch(() => ({ expId: exp.id, days: [] }))
      )
    )
      .then((results) => {
        if (!active) return;
        const summary: Record<
          string,
          { totalAvailableDays: number; maxPermitsOnBestDay: number; sampleDate: string }
        > = {};
        for (const res of results) {
          const openDays = res.days.filter(
            (d: { status: string; permitsRemaining: number; date: string }) =>
              d.status !== 'sold-out' && d.permitsRemaining > 0
          );
          const bestDay = openDays.reduce(
            (max: number, d: { permitsRemaining: number }) =>
              d.permitsRemaining > max ? d.permitsRemaining : max,
            0
          );
          summary[res.expId] = {
            totalAvailableDays: openDays.length,
            maxPermitsOnBestDay: bestDay,
            sampleDate:
              openDays[4]?.date ||
              openDays[0]?.date ||
              `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-15`,
          };
        }
        setLivePermitCounts(summary);
      })
      .finally(() => {
        if (active) setLoadingPermits(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMonth, selectedYear]);

  const currentMonthMeta =
    MONTHS.find((m) => m.num === selectedMonth) || MONTHS[10];

  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DESTINATIONS.filter((dest) => {
      if (regionFilter === 'primate') {
        if (!dest.slug.includes('bwindi') && !dest.slug.includes('kibale'))
          return false;
      } else if (regionFilter === 'savannah') {
        if (
          !dest.slug.includes('queen-elizabeth') &&
          !dest.slug.includes('murchison')
        )
          return false;
      } else if (regionFilter === 'wilderness') {
        if (!dest.slug.includes('kidepo')) return false;
      } else if (regionFilter === 'cross-border') {
        if (!dest.slug.includes('serengeti')) return false;
      }

      if (q) {
        const text = [
          dest.name,
          dest.region,
          dest.tagline,
          dest.description,
          ...dest.signatureSpecies,
          ...dest.sectorsOrZones.map((s) => `${s.name} ${s.detail}`),
        ]
          .join(' ')
          .toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [regionFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-parchment bg-topographic">
      {/* Hero */}
      <section className="relative bg-canopy text-parchment py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-35">
          <img
            src="/images/queen-elizabeth-savannah.webp"
            alt="Queen Elizabeth National Park Uganda savannah and crater lakes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canopy via-canopy/85 to-canopy/65" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
              <Compass className="w-3.5 h-3.5" />
              LIVE FIELD SECTORS · SEASONALITY &amp; UWA PERMIT TELEMETRY
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight">
              Destinations &amp; National Parks
            </h1>
            <p className="text-parchment/85 text-base sm:text-lg leading-relaxed">
              Explore our six signature conservation territories across Uganda and East Africa. Filter by ecosystem, inspect month-by-month climate &amp; wildlife conditions, and verify live UWA permit availability for each park below.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Seasonality & Live Permit Telemetry Bar */}
      <section className="sticky top-20 z-30 bg-parchment-light/95 backdrop-blur-md border-b border-canopy/15 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Region Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {REGION_FILTERS.map((rf) => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setRegionFilter(rf.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    regionFilter === rf.id
                      ? 'bg-canopy text-parchment shadow-sm'
                      : 'bg-parchment-dark/70 text-bark hover:bg-parchment-dark'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Search & Year Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search species, sectors, parks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg bg-white border border-canopy/20 pl-8 pr-3 py-1.5 text-xs text-canopy w-52"
                />
                <Search className="w-3.5 h-3.5 text-bark-muted absolute left-2.5 top-2" />
              </div>

              <select
                aria-label="Target travel year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg bg-white border border-canopy/20 px-2.5 py-1.5 text-xs font-mono-tech font-semibold text-canopy"
              >
                <option value={2026}>2026 Departures</option>
                <option value={2027}>2027 Departures</option>
              </select>
            </div>
          </div>

          {/* 12-Month Interactive Seasonality Selector */}
          <div className="pt-2 border-t border-canopy/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-[11px] font-mono-tech uppercase text-bark-muted mr-2 shrink-0">
                Inspect Month:
              </span>
              {MONTHS.map((m) => (
                <button
                  key={m.num}
                  type="button"
                  onClick={() => setSelectedMonth(m.num)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono-tech transition-all ${
                    selectedMonth === m.num
                      ? 'bg-terracotta text-white font-bold shadow-sm'
                      : 'bg-parchment text-bark hover:bg-parchment-dark'
                  }`}
                >
                  {m.short}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono-tech">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${
                  currentMonthMeta.season === 'Peak Dry'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                {currentMonthMeta.season === 'Peak Dry' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <CloudRain className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {currentMonthMeta.short} {selectedYear}: {currentMonthMeta.season}
              </span>
              <span className="text-bark-muted hidden sm:inline">
                Avg {currentMonthMeta.temp} · Rain: {currentMonthMeta.rain}
              </span>
              <span className="text-canopy font-medium">
                {currentMonthMeta.note}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive Destination Dossiers with Live Permit Telemetry */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {filteredDestinations.length === 0 ? (
            <div className="bg-parchment-light rounded-2xl p-12 text-center border border-canopy/15 space-y-4">
              <h3 className="font-serif text-2xl text-canopy">
                No field territories match your filter
              </h3>
              <button
                type="button"
                onClick={() => {
                  setRegionFilter('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-terracotta text-white text-xs font-semibold"
              >
                Reset Territory Filters
              </button>
            </div>
          ) : (
            filteredDestinations.map((dest, index) => {
              const matchingExpeditions = EXPEDITIONS.filter((exp) =>
                exp.primaryPark
                  .toLowerCase()
                  .includes(dest.name.split(' ')[0].toLowerCase())
              );
              const primaryExp = matchingExpeditions[0] || EXPEDITIONS[0];
              const permitStats = livePermitCounts[primaryExp.id];

              return (
                <article
                  key={dest.id}
                  id={dest.slug}
                  className="scroll-mt-32 bg-parchment-light rounded-3xl border border-canopy/15 shadow-card overflow-hidden"
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
                            <span className="block text-[10px] text-parchment/60">
                              ELEVATION
                            </span>
                            <span>{dest.elevation}</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                            <span className="block text-[10px] text-parchment/60">
                              PROTECTED AREA
                            </span>
                            <span className="truncate block">{dest.areaSqKm}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-mono-tech text-terracotta uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Field Territory 0{index + 1}</span>
                          </div>

                          {/* Live API Permit Telemetry Badge */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono-tech text-xs">
                            {loadingPermits ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                                <span>Checking {currentMonthMeta.short} {selectedYear} UWA Quota...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>
                                  {currentMonthMeta.short} {selectedYear}:{' '}
                                  <strong>
                                    {permitStats?.totalAvailableDays ?? 24} open departure days
                                  </strong>{' '}
                                  (up to {permitStats?.maxPermitsOnBestDay ?? 8} permits/day)
                                </span>
                              </>
                            )}
                          </div>
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
                            <strong className="block text-canopy">
                              Access from Entebbe (EBB)
                            </strong>
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

                      {/* Matching Expeditions + Live Date Book CTA */}
                      <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-canopy/10">
                        <div className="flex flex-wrap items-center gap-2">
                          {matchingExpeditions.map((exp) => (
                            <Link
                              key={exp.id}
                              href={`/expeditions/${exp.slug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-canopy hover:text-terracotta bg-acacia-light px-3 py-1.5 rounded-lg border border-acacia/30 transition-colors"
                            >
                              <Sparkles className="w-3 h-3 text-terracotta" />
                              <span>
                                {exp.title} (${exp.basePriceUsd.toLocaleString()})
                              </span>
                            </Link>
                          ))}
                        </div>

                        <Link
                          href={`/booking?expedition=${encodeURIComponent(
                            primaryExp.id
                          )}&date=${encodeURIComponent(
                            permitStats?.sampleDate ||
                              `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-15`
                          )}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>
                            Lock {currentMonthMeta.short} {selectedYear} Permits
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Interactive Cartographic Map Section */}
      <InteractiveUgandaMap />
    </div>
  );
}
