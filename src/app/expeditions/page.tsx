'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { EXPEDITIONS } from '@/data/expeditions';
import { withBasePath } from '@/lib/base-path';
import ExpeditionCard from '@/components/ExpeditionCard';
import {
  Compass,
  Filter,
  ShieldCheck,
  Calendar,
  ArrowRight,
  SlidersHorizontal,
  Search,
  Scale,
  X,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Expeditions (6)' },
  { id: 'gorilla-trekking', label: 'Bwindi Gorilla Focus' },
  { id: 'primates-wildlife', label: 'Chimps, Gorillas & Big Game' },
  { id: 'savannah-safari', label: 'Victoria Nile & Savannah' },
  { id: 'walking-wilderness', label: 'Kidepo Walking Safaris' },
  { id: 'cross-border', label: 'Uganda + Serengeti Fly-In' },
];

export default function ExpeditionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'duration-asc'>('featured');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const filteredExpeditions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return EXPEDITIONS.filter((exp) => {
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }
      if (durationFilter === 'short' && exp.durationDays > 6) return false;
      if (
        durationFilter === 'medium' &&
        (exp.durationDays < 7 || exp.durationDays > 9)
      )
        return false;
      if (durationFilter === 'long' && exp.durationDays < 10) return false;

      if (q) {
        const haystack = [
          exp.title,
          exp.subtitle,
          exp.primaryPark,
          exp.trekkingSector || '',
          exp.summary,
          ...exp.highlights,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePriceUsd - b.basePriceUsd;
      if (sortBy === 'duration-asc') return a.durationDays - b.durationDays;
      return Number(b.featured) - Number(a.featured);
    });
  }, [selectedCategory, durationFilter, searchQuery, sortBy]);

  const comparedExpeditions = useMemo(
    () => EXPEDITIONS.filter((e) => compareIds.includes(e.id)),
    [compareIds]
  );

  return (
    <div className="min-h-screen bg-parchment bg-topographic">
      {/* Page Hero */}
      <section className="relative bg-canopy text-parchment py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src={withBasePath('/images/bwindi-gorilla-family.jpg')}
            alt="Bwindi mountain gorilla family"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canopy via-canopy/85 to-canopy/65" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
              <Compass className="w-3.5 h-3.5" />
              2026 / 2027 SMALL-GROUP &amp; PRIVATE CHARTER CATALOG
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight">
              Guided Expeditions in Uganda &amp; East Africa
            </h1>
            <p className="text-parchment/85 text-base sm:text-lg leading-relaxed">
              Every Jabali Trails itinerary is capped at 6 travelers on scheduled departures—or available on any date as a private 4x4 Land Cruiser charter. Filter, search, or compare itineraries side-by-side below.
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Controls Bar */}
      <section className="sticky top-20 z-30 bg-parchment-light/95 backdrop-blur-md border-b border-canopy/10 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <Filter className="w-4 h-4 text-terracotta shrink-0 mr-1" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-canopy text-parchment shadow-sm'
                      : 'bg-parchment-dark/70 text-bark hover:bg-parchment-dark'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search, Duration & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search parks, gorillas, lions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg bg-white border border-canopy/20 pl-8 pr-3 py-2 text-xs text-canopy w-48 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 text-bark-muted absolute left-2.5 top-2.5" />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-bark-muted" />
                <select
                  aria-label="Filter by duration"
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="rounded-lg bg-white border border-canopy/20 px-3 py-2 text-xs font-medium text-canopy"
                >
                  <option value="all">All Durations (5–12D)</option>
                  <option value="short">Short Treks (5–6D)</option>
                  <option value="medium">Classic Circuits (7–8D)</option>
                  <option value="long">Grand Odysseys (10–12D)</option>
                </select>
              </div>

              <select
                aria-label="Sort expeditions"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'featured' | 'price-asc' | 'duration-asc')
                }
                className="rounded-lg bg-white border border-canopy/20 px-3 py-2 text-xs font-medium text-canopy"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price-asc">Sort: Price (Low → High)</option>
                <option value="duration-asc">Sort: Duration (Shortest)</option>
              </select>
            </div>
          </div>

          {/* Compare Bar */}
          {compareIds.length > 0 && (
            <div className="pt-2 border-t border-canopy/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono-tech uppercase text-terracotta font-semibold flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  Comparing ({compareIds.length}/3):
                </span>
                {comparedExpeditions.map((e) => (
                  <span
                    key={e.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-canopy text-parchment font-mono-tech text-[11px]"
                  >
                    {e.title}
                    <button
                      type="button"
                      onClick={() => toggleCompare(e.id)}
                      aria-label={`Remove ${e.title}`}
                    >
                      <X className="w-3 h-3 text-acacia" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompareModal(true)}
                  className="px-4 py-1.5 rounded-lg bg-terracotta text-white font-semibold text-xs"
                >
                  Open Side-by-Side Comparison
                </button>
                <button
                  type="button"
                  onClick={() => setCompareIds([])}
                  className="text-bark-muted hover:text-canopy underline"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredExpeditions.length === 0 ? (
            <div className="bg-parchment-light rounded-2xl p-12 text-center border border-canopy/15 space-y-4">
              <h3 className="font-serif text-2xl text-canopy">
                No expeditions match your exact search or filter combination
              </h3>
              <p className="text-sm text-bark-muted max-w-md mx-auto">
                Reset the filters below or request a custom-tailored itinerary built around your exact travel window.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setDurationFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terracotta text-white text-sm font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExpeditions.map((exp) => {
                const isCompared = compareIds.includes(exp.id);
                return (
                  <div key={exp.id} className="relative flex flex-col">
                    <ExpeditionCard expedition={exp} />
                    <button
                      type="button"
                      onClick={() => toggleCompare(exp.id)}
                      className={`mt-2 self-end inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono-tech border transition-all ${
                        isCompared
                          ? 'bg-canopy text-acacia border-canopy'
                          : 'bg-parchment-light text-bark-muted border-canopy/15 hover:border-canopy'
                      }`}
                    >
                      <Scale className="w-3 h-3" />
                      <span>{isCompared ? 'Added to Compare ✓' : 'Compare Itinerary'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Permit & Stripe Transparency Banner */}
          <div className="mt-16 rounded-2xl bg-canopy text-parchment p-8 sm:p-10 shadow-elevated grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-acacia">
                <ShieldCheck className="w-4 h-4" />
                <span>UWA Official Permit &amp; Stripe Payment Guarantee</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                Need Specific Gorilla Habituation Dates or a Private Family Charter?
              </h2>
              <p className="text-sm text-parchment/80 leading-relaxed">
                All six expeditions above can be booked online right now with either a 30% deposit + UWA permit fee or 100% full payment via Stripe Checkout. For groups of 7+ or custom cross-border extensions into Rwanda or Kenya, our Kampala desk builds bespoke dossiers within 24 hours.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Open Real-Time Booking Engine</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-parchment text-sm font-semibold transition-all"
              >
                <span>Request Custom Itinerary</span>
                <ArrowRight className="w-4 h-4 text-acacia" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && comparedExpeditions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-parchment-light rounded-3xl border border-canopy/20 max-w-5xl w-full shadow-elevated overflow-hidden my-8">
            <div className="bg-canopy text-parchment px-6 py-5 flex items-center justify-between">
              <div>
                <span className="font-mono-tech text-xs text-acacia uppercase">
                  Side-by-Side Field Comparison
                </span>
                <h3 className="font-serif text-2xl font-semibold text-white">
                  Compare Selected Expeditions ({comparedExpeditions.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-lg text-parchment/75 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-canopy/15">
                    <th className="py-3 px-3 font-mono-tech uppercase text-bark-muted w-40">
                      Attribute
                    </th>
                    {comparedExpeditions.map((exp) => (
                      <th key={exp.id} className="py-3 px-3 font-serif text-lg text-canopy">
                        {exp.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-canopy/10">
                  <tr>
                    <td className="py-3 px-3 font-mono-tech text-bark-muted">Duration</td>
                    {comparedExpeditions.map((exp) => (
                      <td key={exp.id} className="py-3 px-3 font-mono-tech font-semibold text-canopy">
                        {exp.durationDays} Days / {exp.durationDays - 1} Nights
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono-tech text-bark-muted">Primary Parks</td>
                    {comparedExpeditions.map((exp) => (
                      <td key={exp.id} className="py-3 px-3 text-canopy">
                        {exp.primaryPark}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono-tech text-bark-muted">Base Rate (Peak)</td>
                    {comparedExpeditions.map((exp) => (
                      <td key={exp.id} className="py-3 px-3 font-mono-tech font-bold text-canopy">
                        ${exp.basePriceUsd.toLocaleString()} / guest
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono-tech text-bark-muted">Emerald Season</td>
                    {comparedExpeditions.map((exp) => (
                      <td key={exp.id} className="py-3 px-3 font-mono-tech text-emerald-800 font-semibold">
                        ${(exp.basePriceUsd - exp.greenSeasonDiscountUsd).toLocaleString()} (-${exp.greenSeasonDiscountUsd})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono-tech text-bark-muted">UWA Permits</td>
                    {comparedExpeditions.map((exp) => (
                      <td key={exp.id} className="py-3 px-3 font-mono-tech text-terracotta">
                        {exp.permitSummary}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono-tech text-bark-muted">Physical Grade</td>
                    {comparedExpeditions.map((exp) => (
                      <td key={exp.id} className="py-3 px-3 font-mono-tech">
                        {exp.difficulty} (Max {exp.maxGroupSize} pax)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono-tech text-bark-muted">Action</td>
                    {comparedExpeditions.map((exp) => (
                      <td key={exp.id} className="py-3 px-3">
                        <Link
                          href={`/booking?expedition=${encodeURIComponent(exp.id)}`}
                          onClick={() => setShowCompareModal(false)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-terracotta text-white text-xs font-semibold"
                        >
                          <span>Book This Trek</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
