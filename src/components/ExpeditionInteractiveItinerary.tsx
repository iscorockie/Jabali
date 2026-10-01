'use client';

import React, { useState } from 'react';
import { Expedition } from '@/data/expeditions';
import { MapPin, ChevronDown, ChevronUp, Sparkles, Mountain } from 'lucide-react';

export default function ExpeditionInteractiveItinerary({
  expedition,
}: {
  expedition: Expedition;
}) {
  const [expandedDays, setExpandedDays] = useState<number[]>(
    expedition.itinerary.map((i) => i.day)
  );
  const [lodgeTier, setLodgeTier] = useState<'signature' | 'luxury'>('signature');

  const toggleDay = (day: number) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const expandAll = () =>
    setExpandedDays(expedition.itinerary.map((i) => i.day));
  const collapseAll = () => setExpandedDays([1]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono-tech text-xs uppercase tracking-widest text-terracotta font-semibold">
            Interactive Field Route &amp; Elevation Log
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-canopy mt-1">
            Day-by-Day Expedition Dossier
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-parchment-dark p-1 border border-canopy/15 text-xs">
            <button
              type="button"
              onClick={() => setLodgeTier('signature')}
              className={`px-3 py-1.5 rounded-lg font-mono-tech transition-all ${
                lodgeTier === 'signature'
                  ? 'bg-canopy text-parchment font-semibold'
                  : 'text-bark hover:text-canopy'
              }`}
            >
              Signature Eco-Lodges
            </button>
            <button
              type="button"
              onClick={() => setLodgeTier('luxury')}
              className={`px-3 py-1.5 rounded-lg font-mono-tech transition-all ${
                lodgeTier === 'luxury'
                  ? 'bg-terracotta text-white font-semibold'
                  : 'text-bark hover:text-canopy'
              }`}
            >
              Premier Luxury (+${expedition.luxuryLodgeUpgradePerPersonUsd})
            </button>
          </div>

          <button
            type="button"
            onClick={
              expandedDays.length === expedition.itinerary.length
                ? collapseAll
                : expandAll
            }
            className="px-3 py-2 rounded-xl border border-canopy/20 text-xs font-mono-tech text-canopy hover:bg-parchment-dark"
          >
            {expandedDays.length === expedition.itinerary.length
              ? 'Collapse Days'
              : 'Expand All Days'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {expedition.itinerary.map((item) => {
          const isOpen = expandedDays.includes(item.day);
          return (
            <div
              key={item.day}
              className="bg-parchment-light rounded-2xl border border-canopy/12 shadow-sm hover:border-canopy/30 transition-all overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleDay(item.day)}
                className="w-full p-5 sm:p-6 flex flex-wrap items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-canopy text-acacia font-mono-tech text-xs font-bold">
                    DAY {String(item.day).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-canopy">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech text-xs text-bark-muted bg-parchment-dark px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Mountain className="w-3 h-3 text-terracotta" />
                    {item.altitude}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-canopy" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-canopy" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-canopy/10 space-y-4">
                  <p className="text-sm text-bark-muted leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-3 border-t border-canopy/8 flex flex-wrap items-center justify-between gap-3 text-xs text-bark">
                    <div className="flex items-center gap-1.5">
                      {lodgeTier === 'luxury' ? (
                        <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-terracotta" />
                      )}
                      <span>
                        <strong>
                          {lodgeTier === 'luxury'
                            ? 'Premier Luxury Sanctuary:'
                            : 'Signature Eco-Lodge:'}
                        </strong>{' '}
                        {lodgeTier === 'luxury'
                          ? `${item.accommodation} — Private Butler Suite / Sanctuary Villa`
                          : item.accommodation}
                      </span>
                    </div>
                    <div className="font-mono-tech text-bark-muted">
                      Meals: <strong className="text-canopy">{item.meals}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
