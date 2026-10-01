'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EXPEDITIONS } from '@/data/expeditions';
import { Calendar, Compass, Users, ArrowRight, ShieldCheck } from 'lucide-react';

const DEPARTURE_DATES = [
  { label: 'November 2026 (Emerald Green Season · Save $350+)', value: '2026-11-14' },
  { label: 'December 2026 (Peak Dry Season · Holiday Trek)', value: '2026-12-18' },
  { label: 'January 2027 (Peak Dry Season · Prime Trails)', value: '2027-01-16' },
  { label: 'February 2027 (Peak Dry Season · High Sightings)', value: '2027-02-12' },
  { label: 'June 2027 (Dry Season Opening · Bwindi & Kibale)', value: '2027-06-15' },
  { label: 'July 2027 (Peak Migration & Gorilla Season)', value: '2027-07-20' },
  { label: 'August 2027 (Peak Dry Season)', value: '2027-08-14' },
];

export default function HeroQuickBookingBar() {
  const router = useRouter();
  const [selectedExpeditionId, setSelectedExpeditionId] = useState(EXPEDITIONS[0].id);
  const [departureDate, setDepartureDate] = useState(DEPARTURE_DATES[0].value);
  const [guests, setGuests] = useState(2);

  const selectedExpedition =
    EXPEDITIONS.find((e) => e.id === selectedExpeditionId) || EXPEDITIONS[0];
  const permitTotal = selectedExpedition.gorillaPermitUsd + selectedExpedition.chimpPermitUsd;

  const handleLaunchBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      expedition: selectedExpeditionId,
      date: departureDate,
      guests: String(guests),
    });
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleLaunchBooking}
      className="bg-parchment-light/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-elevated border border-canopy/15 text-bark"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Expedition Selector */}
        <div className="md:col-span-5">
          <label
            htmlFor="hero-expedition"
            className="flex items-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-terracotta" />
            <span>1. Select Guided Expedition</span>
          </label>
          <select
            id="hero-expedition"
            value={selectedExpeditionId}
            onChange={(e) => setSelectedExpeditionId(e.target.value)}
            className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-3 text-sm font-medium text-canopy focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            {EXPEDITIONS.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title} ({exp.durationDays}D · From ${exp.basePriceUsd.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Departure Window */}
        <div className="md:col-span-3">
          <label
            htmlFor="hero-date"
            className="flex items-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-terracotta" />
            <span>2. Target Departure</span>
          </label>
          <select
            id="hero-date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-3 text-sm font-medium text-canopy focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            {DEPARTURE_DATES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Travelers */}
        <div className="md:col-span-2">
          <label
            htmlFor="hero-guests"
            className="flex items-center gap-1.5 text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-1.5"
          >
            <Users className="w-3.5 h-3.5 text-terracotta" />
            <span>3. Guests</span>
          </label>
          <select
            id="hero-guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-3 text-sm font-medium text-canopy focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Traveler' : 'Travelers'}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm shadow-sm transition-all"
          >
            <span>Check Permits</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Live Telemetry Strip */}
      <div className="mt-3.5 pt-3 border-t border-canopy/10 flex flex-wrap items-center justify-between gap-2 text-xs text-bark-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong className="text-canopy">{selectedExpedition.primaryPark}:</strong>{' '}
            {permitTotal > 0
              ? `Requires $${permitTotal}/pp official UWA permit (allocated live at checkout)`
              : 'All park & ranger walking permits included in base package'}
          </span>
        </div>
        <div className="font-mono-tech text-[11px] text-canopy">
          Est. Package: <strong className="text-terracotta">${selectedExpedition.basePriceUsd.toLocaleString()}/pp</strong> · Instant Stripe Checkout or Inquiry Hold
        </div>
      </div>
    </form>
  );
}
