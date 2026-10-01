'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DESTINATIONS, EXPEDITIONS } from '@/data/expeditions';
import {
  MapPin,
  Plane,
  Compass,
  ArrowRight,
  ShieldCheck,
  Mountain,
} from 'lucide-react';

interface MapPinConfig {
  destId: string;
  shortLabel: string;
  x: number; // percentage 0-100 on SVG
  y: number; // percentage 0-100 on SVG
  flightFromEntebbe: string;
  permitNote: string;
}

const MAP_PINS: MapPinConfig[] = [
  {
    destId: 'dest-bwindi',
    shortLabel: 'Bwindi Gorillas',
    x: 24,
    y: 76,
    flightFromEntebbe: '75 min bush flight to Kihihi / Kisoro',
    permitNote: '$800 UWA Gorilla Permit · 4 Trekking Sectors',
  },
  {
    destId: 'dest-queen-elizabeth',
    shortLabel: 'Queen Elizabeth NP',
    x: 29,
    y: 58,
    flightFromEntebbe: '60 min bush flight to Mweya / Kasese',
    permitNote: 'Kazinga Boat & Ishasha Tree-Climbing Lions',
  },
  {
    destId: 'dest-kibale',
    shortLabel: 'Kibale Chimps',
    x: 34,
    y: 46,
    flightFromEntebbe: '55 min flight to Kasese + Crater drive',
    permitNote: '$250 UWA Chimpanzee Permit · 13 Primate Species',
  },
  {
    destId: 'dest-murchison',
    shortLabel: 'Murchison Falls',
    x: 45,
    y: 26,
    flightFromEntebbe: '60 min bush flight to Pakuba Airstrip',
    permitNote: 'Victoria Nile Gorge & Ziwa White Rhinos',
  },
  {
    destId: 'dest-kidepo',
    shortLabel: 'Kidepo Valley',
    x: 74,
    y: 14,
    flightFromEntebbe: '115 min charter flight to Apoka Airstrip',
    permitNote: 'Armed Ranger Walking Safaris & Mount Morungole',
  },
  {
    destId: 'dest-serengeti-extension',
    shortLabel: 'Serengeti Fly-In',
    x: 76,
    y: 84,
    flightFromEntebbe: 'Direct regional link via Entebbe over Lake Victoria',
    permitNote: 'TANAPA Great Migration Cross-Border Extension',
  },
];

export default function InteractiveUgandaMap() {
  const [activePinId, setActivePinId] = useState<string>('dest-bwindi');

  const activePin = MAP_PINS.find((p) => p.destId === activePinId) || MAP_PINS[0];
  const activeDest =
    DESTINATIONS.find((d) => d.id === activePin.destId) || DESTINATIONS[0];
  const matchingExpedition =
    EXPEDITIONS.find((e) =>
      e.primaryPark.toLowerCase().includes(activeDest.name.split(' ')[0].toLowerCase())
    ) || EXPEDITIONS[0];

  return (
    <div className="bg-canopy-topographic text-parchment rounded-3xl border border-white/15 p-6 sm:p-10 shadow-elevated">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-acacia">
            Interactive Telemetry &amp; Bush Flight Corridor Map
          </span>
          <h3 className="font-serif text-2xl sm:text-4xl font-semibold text-white mt-1">
            Explore Uganda’s Rift Valley &amp; East Africa Air Links
          </h3>
        </div>
        <span className="font-mono-tech text-xs text-parchment/75">
          Click any park sector pin to inspect flight times, elevation &amp; UWA permits
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 7 Columns: Interactive Stylistic Cartographic Map */}
        <div className="lg:col-span-7 relative rounded-2xl bg-canopy-moss/90 border border-white/15 p-4 sm:p-6 overflow-hidden min-h-[380px] sm:min-h-[430px] flex items-center justify-center">
          {/* Topographic Grid Lines */}
          <svg
            viewBox="0 0 600 440"
            className="w-full h-full max-h-[400px] select-none"
            role="img"
            aria-label="Interactive map of Uganda National Parks and Serengeti flight links"
          >
            <defs>
              <radialGradient id="lakeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C89B3C" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#112218" stopOpacity="0.05" />
              </radialGradient>
            </defs>

            {/* Coordinate Grid */}
            <g stroke="rgba(246,243,236,0.07)" strokeWidth="1">
              <line x1="0" y1="88" x2="600" y2="88" />
              <line x1="0" y1="176" x2="600" y2="176" />
              <line x1="0" y1="264" x2="600" y2="264" />
              <line x1="0" y1="352" x2="600" y2="352" />
              <line x1="120" y1="0" x2="120" y2="440" />
              <line x1="240" y1="0" x2="240" y2="440" />
              <line x1="360" y1="0" x2="360" y2="440" />
              <line x1="480" y1="0" x2="480" y2="440" />
            </g>

            {/* Equator Line */}
            <line
              x1="0"
              y1="275"
              x2="600"
              y2="275"
              stroke="rgba(200,155,60,0.35)"
              strokeDasharray="6 6"
              strokeWidth="1.5"
            />
            <text
              x="14"
              y="268"
              fill="#C89B3C"
              fontSize="10"
              fontFamily="monospace"
              letterSpacing="2"
            >
              EQUATOR 00°00&apos;
            </text>

            {/* Stylized Uganda & Albertine Rift Contour Polygon */}
            <path
              d="M150,360 L125,290 L155,210 L215,135 L245,75 L350,45 L465,50 L475,145 L435,230 L395,295 L305,345 L195,375 Z"
              fill="url(#lakeGrad)"
              stroke="rgba(200,155,60,0.45)"
              strokeWidth="2"
            />

            {/* Lake Victoria Basin */}
            <ellipse
              cx="355"
              cy="330"
              rx="75"
              ry="48"
              fill="rgba(58,94,74,0.45)"
              stroke="rgba(246,243,236,0.2)"
              strokeWidth="1.2"
            />
            <text
              x="320"
              y="334"
              fill="rgba(246,243,236,0.65)"
              fontSize="10"
              fontFamily="monospace"
            >
              LAKE VICTORIA
            </text>

            {/* Entebbe Hub (EBB) */}
            <circle cx="335" cy="282" r="5" fill="#F6F3EC" />
            <text
              x="345"
              y="286"
              fill="#F6F3EC"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              ENTEBBE (EBB HUB)
            </text>

            {/* Bush Flight Arcs from Entebbe (335, 282) to Each Park Pin */}
            {MAP_PINS.map((pin) => {
              const px = (pin.x / 100) * 600;
              const py = (pin.y / 100) * 440;
              const isSelected = pin.destId === activePinId;
              return (
                <line
                  key={`line-${pin.destId}`}
                  x1={335}
                  y1={282}
                  x2={px}
                  y2={py}
                  stroke={isSelected ? '#B8532E' : 'rgba(200,155,60,0.3)'}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                  strokeDasharray={isSelected ? 'none' : '4 4'}
                />
              );
            })}
          </svg>

          {/* Interactive HTML Pin Buttons Overlaid on Map */}
          {MAP_PINS.map((pin) => {
            const isSelected = pin.destId === activePinId;
            return (
              <button
                key={pin.destId}
                type="button"
                onClick={() => setActivePinId(pin.destId)}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className={`-translate-x-1/2 -translate-y-1/2 absolute z-10 px-2.5 py-1.5 rounded-full text-[11px] font-mono-tech font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                  isSelected
                    ? 'bg-terracotta text-white ring-4 ring-terracotta/40 scale-110 z-20'
                    : 'bg-canopy/90 hover:bg-acacia hover:text-canopy text-parchment border border-acacia/50'
                }`}
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="whitespace-nowrap">{pin.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Right 5 Columns: Selected Sector Live Dossier */}
        <div className="lg:col-span-5 bg-white/5 rounded-2xl border border-white/15 p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
              {activeDest.coordinates}
            </span>
            <span className="font-mono-tech text-xs text-parchment/75 flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-acacia" />
              {activeDest.elevation}
            </span>
          </div>

          <div>
            <h4 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
              {activeDest.name}
            </h4>
            <p className="text-xs font-mono-tech text-acacia mt-0.5">{activeDest.region}</p>
            <p className="text-sm text-parchment/80 mt-3 leading-relaxed">
              {activeDest.tagline}
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="flex items-start gap-2.5">
              <Plane className="w-4 h-4 text-acacia shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Air &amp; Overland Access:</strong>
                <span className="text-parchment/75">{activePin.flightFromEntebbe}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-acacia shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">UWA Permit &amp; Sector Protocol:</strong>
                <span className="text-parchment/75">{activePin.permitNote}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
            <Link
              href={`/booking?expedition=${encodeURIComponent(matchingExpedition.id)}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold transition-all"
            >
              <span>Book {matchingExpedition.durationDays}D Trek Here</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/destinations#${activeDest.slug}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-parchment text-xs font-semibold transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-acacia" />
              <span>Sector Guide</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
