'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Compass,
  CreditCard,
  Mountain,
  Moon,
  Search,
  Sun,
  Users,
  CornerDownLeft,
  ArrowUpRight,
  Heart,
  Sparkles,
} from 'lucide-react';
import {
  DESTINATIONS,
  EXPEDITIONS,
  LEAD_GUIDES,
} from '@/data/expeditions';
import { useSite, CURRENCIES, type CurrencyCode } from '@/components/providers/SiteProvider';

interface PaletteEntry {
  id: string;
  group: 'Expeditions' | 'Destinations' | 'Guides' | 'Pages' | 'Actions';
  title: string;
  subtitle: string;
  keywords: string;
  href?: string;
  icon: React.ReactNode;
  meta?: string;
  action?: () => void;
}

const PAGES: { title: string; href: string; subtitle: string; icon: React.ReactNode }[] = [
  {
    title: 'Plan & Book an Expedition',
    href: '/booking',
    subtitle: 'Live UWA permit calendar, itemised quote, Stripe checkout',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: 'Expedition Catalogue',
    href: '/expeditions',
    subtitle: 'Filter, sort and compare all guided itineraries',
    icon: <Compass className="h-4 w-4" />,
  },
  {
    title: 'Destinations & National Parks',
    href: '/destinations',
    subtitle: 'Bwindi, Kibale, Queen Elizabeth, Murchison, Kidepo, Serengeti',
    icon: <Mountain className="h-4 w-4" />,
  },
  {
    title: 'About & Lead Guides',
    href: '/about',
    subtitle: 'Our story, conservation ledger and Ugandan naturalists',
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: 'Tailor-Made Private Safari Inquiry',
    href: '/contact',
    subtitle: 'Build a bespoke itinerary, 24-hour proposal turnaround',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    title: 'My Booking / Permit Docket',
    href: '/booking#permit-guide',
    subtitle: 'Lookup reference, permit rules, packing checklist',
    icon: <ArrowUpRight className="h-4 w-4" />,
  },
  {
    title: 'Operations Console',
    href: '/admin',
    subtitle: 'Bookings, inquiries, webhook ledger & quota overrides',
    icon: <CreditCard className="h-4 w-4" />,
  },
];

function score(haystack: string, needle: string): number {
  if (!needle) return 1;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  const idx = h.indexOf(n);
  if (idx === -1) {
    // loose subsequence match
    let cursor = 0;
    for (const ch of n) {
      const found = h.indexOf(ch, cursor);
      if (found === -1) return 0;
      cursor = found + 1;
    }
    return 12;
  }
  return 100 - Math.min(60, idx) + (idx === 0 ? 40 : 0);
}

export default function CommandPalette() {
  const router = useRouter();
  const { paletteOpen, setPaletteOpen, theme, toggleTheme, currency, setCurrency, wishlist } =
    useSite();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const entries = useMemo<PaletteEntry[]>(() => {
    const expeditionEntries: PaletteEntry[] = EXPEDITIONS.map((exp) => ({
      id: `exp-${exp.id}`,
      group: 'Expeditions',
      title: exp.title,
      subtitle: `${exp.durationDays} days · ${exp.categoryLabel} · from $${exp.basePriceUsd.toLocaleString()}/pp`,
      keywords: [
        exp.title,
        exp.subtitle,
        exp.primaryPark,
        exp.trekkingSector || '',
        exp.categoryLabel,
        exp.summary,
        ...exp.highlights,
      ].join(' '),
      href: `/expeditions/${exp.slug}`,
      icon: <Compass className="h-4 w-4" />,
      meta: `${exp.durationDays}D`,
    }));

    const destinationEntries: PaletteEntry[] = DESTINATIONS.map((dest) => ({
      id: `dest-${dest.id}`,
      group: 'Destinations',
      title: dest.name,
      subtitle: dest.tagline,
      keywords: [dest.name, dest.region, dest.description, ...dest.signatureSpecies].join(' '),
      href: `/destinations#${dest.slug}`,
      icon: <Mountain className="h-4 w-4" />,
      meta: dest.country,
    }));

    const guideEntries: PaletteEntry[] = LEAD_GUIDES.map((guide) => ({
      id: `guide-${guide.name}`,
      group: 'Guides',
      title: guide.name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      subtitle: `${guide.role} · ${guide.experienceYears} yrs`,
      keywords: [guide.name, guide.role, guide.bio, ...guide.specialties, ...guide.languages].join(' '),
      href: '/about#guides',
      icon: <Users className="h-4 w-4" />,
    }));

    const actionEntries: PaletteEntry[] = [
      {
        id: 'act-theme',
        group: 'Actions',
        title: theme === 'dark' ? 'Switch to Daylight Field Mode' : 'Switch to Night Field Mode',
        subtitle: 'Theme is saved to this device',
        keywords: 'theme dark night light mode contrast',
        icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        action: toggleTheme,
      },
      ...Object.values(CURRENCIES).map((c) => ({
        id: `act-ccy-${c.code}`,
        group: 'Actions' as const,
        title: `Show prices in ${c.label}`,
        subtitle: currency === c.code ? 'Active currency' : `Currently ${currency}`,
        keywords: `currency ${c.code} ${c.label} ${c.symbol} money price`,
        icon: <span className="grid h-4 w-4 place-items-center text-xs font-bold">{c.symbol}</span>,
        action: () => setCurrency(c.code as CurrencyCode),
      })),
      {
        id: 'act-instant-book',
        group: 'Actions',
        title: 'Open the real-time permit calendar',
        subtitle: 'Check live gorilla & chimpanzee permit quotas',
        keywords: 'permit availability calendar book gorilla chimp quota',
        icon: <Calendar className="h-4 w-4" />,
        action: () => router.push('/booking'),
      },
    ];

    if (wishlist.length) {
      actionEntries.unshift({
        id: 'act-wishlist',
        group: 'Actions',
        title: `View saved expeditions (${wishlist.length})`,
        subtitle: 'Your shortlist, stored on this device',
        keywords: 'wishlist saved shortlist favourite trips',
        icon: <Heart className="h-4 w-4" />,
        action: () => router.push('/expeditions?view=saved'),
      });
    }

    return [...expeditionEntries, ...destinationEntries, ...guideEntries, ...PAGES.map((p) => ({
      id: `page-${p.href}`,
      group: 'Pages' as const,
      title: p.title,
      subtitle: p.subtitle,
      keywords: `${p.title} ${p.subtitle}`,
      href: p.href,
      icon: p.icon,
    })), ...actionEntries];
  }, [theme, toggleTheme, currency, setCurrency, wishlist, router]);

  const results = useMemo(() => {
    const q = query.trim();
    const scored = entries
      .map((entry) => ({
        entry,
        s: Math.max(
          score(`${entry.title} ${entry.group}`, q) * 1.35,
          score(entry.keywords, q) * 0.85
        ),
      }))
      .filter((r) => !q || r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, q ? 12 : 8);
    return scored.map((r) => r.entry);
  }, [entries, query]);

  useEffect(() => setActive(0), [query, paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [paletteOpen]);

  const run = (entry: PaletteEntry | undefined) => {
    if (!entry) return;
    setPaletteOpen(false);
    setQuery('');
    if (entry.action) {
      entry.action();
      return;
    }
    if (entry.href) router.push(entry.href);
  };

  if (!paletteOpen) return null;

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[#08110c]/70 p-4 backdrop-blur-md sm:pt-[12vh]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setPaletteOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Jabali Trails Africa"
        className="anim-scale-in w-full max-w-2xl overflow-hidden rounded-3xl border border-line/15 bg-surface-raised shadow-deep"
      >
        <div className="flex items-center gap-3 border-b border-line/10 px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-terracotta" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((i) => Math.min(results.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                run(results[active]);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setPaletteOpen(false);
              }
            }}
            placeholder="Search expeditions, parks, guides, actions…"
            className="w-full bg-transparent font-display text-base text-heading outline-none placeholder:font-sans placeholder:text-ink-subtle"
            aria-controls="palette-results"
          />
          <kbd className="hidden shrink-0 rounded-md border border-line/20 px-1.5 py-0.5 font-label text-ink-subtle sm:block">
            ESC
          </kbd>
        </div>

        <div ref={listRef} id="palette-results" className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-display text-base font-semibold text-heading">
                No trail matches “{query}”
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Try “gorilla”, “Kidepo”, “habituation”, “birding” or “inquiry”.
              </p>
            </div>
          ) : (
            results.map((entry, i) => {
              const showGroup = entry.group !== lastGroup;
              lastGroup = entry.group;
              return (
                <div key={entry.id}>
                  {showGroup ? (
                    <p className="px-5 pb-1 pt-3 font-label text-ink-subtle first:pt-1">
                      {entry.group}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(entry)}
                    className={`flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                      active === i ? 'bg-acacia-light/70' : 'hover:bg-ink/[0.04]'
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border ${
                        active === i
                          ? 'border-terracotta/40 bg-terracotta text-white'
                          : 'border-line/15 bg-surface text-ink-muted'
                      }`}
                    >
                      {entry.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-semibold text-heading">
                        {entry.title}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">{entry.subtitle}</span>
                    </span>
                    {entry.meta ? (
                      <span className="shrink-0 font-label text-ink-subtle">{entry.meta}</span>
                    ) : null}
                    {active === i ? (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                    ) : null}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line/10 bg-surface-sunk/60 px-5 py-2.5 font-label text-ink-subtle">
          <span>↑ ↓ navigate · ⏎ open</span>
          <span className="hidden sm:block">Instant booking & permit desk</span>
        </div>
      </div>
    </div>
  );
}
