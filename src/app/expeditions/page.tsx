'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { EXPEDITIONS } from '@/data/expeditions';
import ExpeditionCard from '@/components/ExpeditionCard';
import {
  Compass,
  Filter,
  ShieldCheck,
  Calendar,
  ArrowRight,
  SlidersHorizontal,
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
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'duration-asc'>('featured');

  const filteredExpeditions = useMemo(() => {
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
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePriceUsd - b.basePriceUsd;
      if (sortBy === 'duration-asc') return a.durationDays - b.durationDays;
      return Number(b.featured) - Number(a.featured);
    });
  }, [selectedCategory, durationFilter, sortBy]);

  return (
    <div className="min-h-screen bg-parchment bg-topographic">
      {/* Page Hero */}
      <section className="relative bg-canopy text-parchment py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/images/bwindi-gorilla-family.jpg"
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
              Every Jabali Trails itinerary is capped at 6 travelers on scheduled departures—or available on any date as a private 4x4 Land Cruiser charter. Select an expedition below to view its day-by-day field dossier or lock your UWA permits online.
            </p>
          </div>
        </div>
      </section>

      {/* Filter & Controls Bar */}
      <section className="sticky top-20 z-30 bg-parchment-light/95 backdrop-blur-md border-b border-canopy/10 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

          {/* Duration & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-bark-muted" />
              <select
                aria-label="Filter by duration"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="rounded-lg bg-white border border-canopy/20 px-3 py-2 text-xs font-medium text-canopy"
              >
                <option value="all">All Durations (5–12 Days)</option>
                <option value="short">Short Treks (5–6 Days)</option>
                <option value="medium">Classic Circuits (7–8 Days)</option>
                <option value="long">Grand Odysseys (10–12 Days)</option>
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
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="duration-asc">Sort: Duration (Shortest First)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredExpeditions.length === 0 ? (
            <div className="bg-parchment-light rounded-2xl p-12 text-center border border-canopy/15 space-y-4">
              <h3 className="font-serif text-2xl text-canopy">
                No expeditions match your exact filter combination
              </h3>
              <p className="text-sm text-bark-muted max-w-md mx-auto">
                Reset the filters below or request a custom-tailored itinerary built around your exact travel window.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setDurationFilter('all');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-terracotta text-white text-sm font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExpeditions.map((exp) => (
                <ExpeditionCard key={exp.id} expedition={exp} />
              ))}
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
    </div>
  );
}
