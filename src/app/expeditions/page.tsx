'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EXPEDITIONS, type Expedition } from '@/data/expeditions';
import { withBasePath } from '@/lib/base-path';
import ExpeditionCard from '@/components/ExpeditionCard';
import { useSite } from '@/components/providers/SiteProvider';
import { formatDateShort, nightsFor } from '@/lib/format';
import {
  Compass,
  Filter,
  ShieldCheck,
  Calendar,
  ArrowRight,
  SlidersHorizontal,
  Search,
  X,
  LayoutGrid,
  Rows3,
  Heart,
  Scale,
  Check,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

const CATEGORIES = [
  { id: 'all', label: 'All expeditions' },
  { id: 'gorilla-trekking', label: 'Bwindi gorilla focus' },
  { id: 'primates-wildlife', label: 'Chimps, gorillas & big game' },
  { id: 'savannah-safari', label: 'Victoria Nile & savannah' },
  { id: 'walking-wilderness', label: 'Kidepo walking safaris' },
  { id: 'cross-border', label: 'Uganda + Serengeti fly-in' },
];

const DIFFICULTIES = ['Easy–Moderate', 'Moderate', 'Challenging', 'Strenuous'];
const DURATIONS = [
  { id: 'all', label: 'Any length' },
  { id: 'short', label: '5–6 days' },
  { id: 'medium', label: '7–9 days' },
  { id: 'long', label: '10–12 days' },
];
type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc';

function ExpeditionsCatalogue() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { compare, toggleCompare, clearCompare, wishlist, clearWishlist, money, pushToast } =
    useSite();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [permitsIncludedOnly, setPermitsIncludedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const savedView = searchParams.get('view') === 'saved';

  /* Deep links from the navbar / command palette / wishlist buttons */
  useEffect(() => {
    const next = searchParams.get('category');
    const nextQ = searchParams.get('q');
    if (next) setSelectedCategory(next);
    if (nextQ) setSearchQuery(nextQ);
  }, [searchParams]);

  const syncParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== '') params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.replace(`/expeditions${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const filteredExpeditions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = EXPEDITIONS.filter((exp) => {
      if (savedView && !wishlist.includes(exp.id)) return false;
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
      if (difficultyFilter !== 'all' && exp.difficulty !== difficultyFilter) return false;
      if (permitsIncludedOnly && exp.gorillaPermitUsd + exp.chimpPermitUsd > 0) return false;
      if (exp.basePriceUsd > maxPrice) return false;
      if (durationFilter === 'short' && exp.durationDays > 6) return false;
      if (durationFilter === 'medium' && (exp.durationDays < 7 || exp.durationDays > 9)) return false;
      if (durationFilter === 'long' && exp.durationDays < 10) return false;
      if (q) {
        const haystack = [
          exp.title,
          exp.subtitle,
          exp.primaryPark,
          exp.trekkingSector || '',
          exp.summary,
          exp.categoryLabel,
          exp.badge,
          ...exp.highlights,
          ...exp.bestMonths,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePriceUsd - b.basePriceUsd;
      if (sortBy === 'price-desc') return b.basePriceUsd - a.basePriceUsd;
      if (sortBy === 'duration-asc') return a.durationDays - b.durationDays;
      if (sortBy === 'duration-desc') return b.durationDays - a.durationDays;
      return Number(b.featured) - Number(a.featured);
    });
  }, [
    savedView,
    wishlist,
    selectedCategory,
    difficultyFilter,
    permitsIncludedOnly,
    maxPrice,
    durationFilter,
    searchQuery,
    sortBy,
  ]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (durationFilter !== 'all' ? 1 : 0) +
    (difficultyFilter !== 'all' ? 1 : 0) +
    (permitsIncludedOnly ? 1 : 0) +
    (maxPrice < 10000 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAll = () => {
    setSelectedCategory('all');
    setDurationFilter('all');
    setDifficultyFilter('all');
    setPermitsIncludedOnly(false);
    setMaxPrice(10000);
    setSearchQuery('');
    setSortBy('featured');
    if (savedView) router.replace('/expeditions', { scroll: false });
  };

  const comparedExpeditions = useMemo(
    () => EXPEDITIONS.filter((e) => compare.includes(e.id)),
    [compare]
  );

  const cheapest = Math.min(...EXPEDITIONS.map((e) => e.basePriceUsd));
  const dearest = Math.max(...EXPEDITIONS.map((e) => e.basePriceUsd));

  return (
    <div className="min-h-screen bg-surface bg-topographic">
      {/* ── Page hero ───────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-canopy text-parchment grain">
        <div className="absolute inset-0 opacity-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath('/images/bwindi-gorilla-family.jpg')}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canopy via-canopy/90 to-canopy/55" />
        </div>
        <div className="wrap relative z-10 py-14 sm:py-20">
          <div className="max-w-3xl space-y-4">
            <span className="chip chip-onPanel !border-acacia/40 !bg-acacia/15 !text-acacia">
              <Compass className="h-3.5 w-3.5" />
              2026 / 2027 small-group &amp; private charter catalogue
            </span>
            <h1 className="text-hero font-display font-semibold text-parchment">
              Guided expeditions in Uganda &amp; East Africa
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-parchment/85 sm:text-lg">
              Every itinerary is capped at six travelers on scheduled departures — or available on
              any date as a private 4x4 Land Cruiser charter. Filter, shortlist and compare
              side-by-side below; live permit quotas come straight from the UWA desk.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {savedView ? (
                <Link href="/expeditions" className="btn btn-gold">
                  <LayoutGrid className="h-4 w-4" />
                  Back to all expeditions
                </Link>
              ) : (
                <Link href="/expeditions?view=saved" className="btn btn-onPanel">
                  <Heart className="h-4 w-4 text-acacia" />
                  Saved shortlist ({wishlist.length})
                </Link>
              )}
              <Link href="/booking" className="btn btn-primary">
                <Calendar className="h-4 w-4" />
                Check permit calendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sticky control rail ─────────────────────────────────────────────── */}
      <section className="sticky top-[var(--header-h)] z-30 border-b border-line/12 bg-surface-raised/92 backdrop-blur-xl">
        <div className="wrap space-y-3 py-3.5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
              <Filter className="h-4 w-4 shrink-0 text-terracotta" />
              {CATEGORIES.map((cat) => {
                const count =
                  cat.id === 'all'
                    ? EXPEDITIONS.length
                    : EXPEDITIONS.filter((e) => e.category === cat.id).length;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      syncParam('category', cat.id);
                    }}
                    className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 font-display text-xs font-semibold transition-all ${
                      active
                        ? 'bg-canopy text-parchment shadow-card'
                        : 'bg-surface-sunk/70 text-ink hover:-translate-y-px hover:bg-surface-sunk'
                    }`}
                  >
                    {cat.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-label text-[0.6rem] ${
                        active ? 'bg-acacia/25 text-acacia' : 'bg-ink/8 text-ink-subtle'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    syncParam('q', e.target.value);
                  }}
                  placeholder="Search parks, species, sectors…"
                  aria-label="Search expeditions"
                  className="field !w-52 !py-2 pl-8 text-xs sm:!w-64"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-ink-subtle" />
                <select
                  aria-label="Filter by duration"
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="field !w-auto !py-2 text-xs"
                >
                  {DURATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter by physical grade"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="field !w-auto !py-2 text-xs"
                >
                  <option value="all">Any grade</option>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Sort expeditions"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="field !w-auto !py-2 text-xs"
                >
                  <option value="featured">Sort: featured first</option>
                  <option value="price-asc">Sort: price ↑</option>
                  <option value="price-desc">Sort: price ↓</option>
                  <option value="duration-asc">Sort: shortest</option>
                  <option value="duration-desc">Sort: longest</option>
                </select>
              </div>

              <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-line/20 bg-surface px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-pos/50">
                <input
                  type="checkbox"
                  checked={permitsIncludedOnly}
                  onChange={(e) => setPermitsIncludedOnly(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[rgb(var(--accent))]"
                />
                Permits included
              </label>

              <div className="hidden items-center gap-1 rounded-full border border-line/20 bg-surface p-1 sm:flex">
                {[
                  { id: 'grid' as const, Icon: LayoutGrid, label: 'Grid view' },
                  { id: 'list' as const, Icon: Rows3, label: 'List view' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setView(mode.id)}
                    aria-label={mode.label}
                    aria-pressed={view === mode.id}
                    className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
                      view === mode.id
                        ? 'bg-canopy text-parchment'
                        : 'text-ink-subtle hover:bg-ink/5 hover:text-heading'
                    }`}
                  >
                    <mode.Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>

              {compare.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowCompareModal(true)}
                  className="btn btn-primary !py-2 text-xs"
                >
                  <Scale className="h-3.5 w-3.5" />
                  Compare ({compare.length})
                </button>
              ) : null}
            </div>
          </div>

          {/* Budget slider + result meta */}
          <div className="flex flex-col gap-3 border-t border-line/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <span className="font-label text-ink-subtle">Budget cap</span>
              <input
                type="range"
                min={cheapest}
                max={dearest}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Maximum package price per guest"
                className="h-1.5 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-ink/15 accent-[rgb(var(--accent))]"
              />
              <span className="whitespace-nowrap font-display text-xs font-semibold text-heading">
                {money(maxPrice)} / guest
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-label text-ink-muted">
                {filteredExpeditions.length} of {EXPEDITIONS.length} {savedView ? 'saved' : ''}{' '}
                itineraries
              </span>
              {activeFilterCount > 0 ? (
                <button type="button" onClick={resetAll} className="chip chip-accent">
                  <X className="h-3 w-3" />
                  Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                </button>
              ) : null}
              {savedView && wishlist.length > 0 ? (
                <button type="button" onClick={clearWishlist} className="chip">
                  <Bookmark className="h-3 w-3" />
                  Empty shortlist
                </button>
              ) : null}
            </div>
          </div>

          {/* Compare tray */}
          {compare.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/10 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-label text-terracotta">Tray ({compare.length}/3)</span>
                {comparedExpeditions.map((e) => (
                  <span key={e.id} className="chip !bg-canopy !text-parchment !border-canopy">
                    {e.title.split(':')[0]}
                    <button
                      type="button"
                      onClick={() => toggleCompare(e.id)}
                      aria-label={`Remove ${e.title} from comparison`}
                      className="text-acacia transition-colors hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  clearCompare();
                  pushToast({ tone: 'info', title: 'Comparison tray cleared' });
                }}
                className="font-label text-ink-subtle underline-offset-2 transition-colors hover:text-heading hover:underline"
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16">
        <div className="wrap">
          {filteredExpeditions.length === 0 ? (
            <div className="card space-y-4 p-10 text-center sm:p-14">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-terracotta/10 text-terracotta">
                {savedView ? <Heart className="h-6 w-6" /> : <Search className="h-6 w-6" />}
              </span>
              <h2 className="text-h3 font-display font-semibold text-heading">
                {savedView
                  ? 'Your shortlist is empty — for now'
                  : 'No expedition matches those filters'}
              </h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-muted">
                {savedView
                  ? 'Tap the heart on any expedition to keep it here across visits. Your shortlist lives on this device, never on a server.'
                  : 'Loosen the budget cap or grade filter, or let our Kampala desk build a bespoke dossier around your exact travel window.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button type="button" onClick={resetAll} className="btn btn-primary">
                  Reset filters
                </button>
                <Link href="/contact" className="btn btn-outline">
                  <Sparkles className="h-4 w-4 text-terracotta" />
                  Request a custom itinerary
                </Link>
              </div>
            </div>
          ) : view === 'grid' ? (
            <Reveal className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredExpeditions.map((exp, i) => (
                <ExpeditionCard key={exp.id} expedition={exp} index={i} />
              ))}
            </Reveal>
          ) : (
            <div className="space-y-4">
              {filteredExpeditions.map((exp, i) => (
                <Reveal
                  key={exp.id}
                  delay={Math.min(i, 6) * 40}
                  className="card card-hover group grid grid-cols-1 overflow-hidden sm:grid-cols-12"
                >
                  <div className="media-frame sm:col-span-4 sm:h-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={exp.heroImage} alt={exp.title} loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-canopy/80 to-transparent sm:bg-gradient-to-r" />
                  </div>
                  <div className="relative z-10 flex flex-col justify-between gap-4 p-5 sm:col-span-8 sm:flex-row sm:items-center sm:p-6">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="chip chip-gold">{exp.categoryLabel}</span>
                        <span className="font-label text-ink-subtle">{exp.coordinates}</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-heading">
                        <Link
                          href={`/expeditions/${exp.slug}`}
                          className="link-underline hover:text-terracotta"
                        >
                          {exp.title}
                        </Link>
                      </h3>
                      <p className="line-clamp-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                        {exp.subtitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-terracotta" />
                          {exp.durationDays}D / {nightsFor(exp.durationDays)}N
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-pos" />
                          {exp.permitSummary}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-pos" />
                          Best: {exp.bestMonths.slice(0, 4).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3 border-t border-line/10 pt-4 sm:items-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                      <div className="text-right">
                        <div className="font-display text-2xl font-semibold text-heading">
                          {money(exp.basePriceUsd)}
                        </div>
                        <div className="font-label text-ink-subtle">per guest · from</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCompare(exp.id)}
                          className={`btn btn-sm ${compare.includes(exp.id) ? 'btn-solid' : 'btn-outline'}`}
                        >
                          <Scale className="h-3.5 w-3.5" />
                          {compare.includes(exp.id) ? 'In tray' : 'Compare'}
                        </button>
                        <Link
                          href={`/booking?expedition=${encodeURIComponent(exp.id)}`}
                          className="btn btn-sm btn-primary"
                        >
                          Check permits
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {/* ── Trust banner ───────────────────────────────────────────────── */}
          <div className="panel mt-16 grid grid-cols-1 items-center gap-8 p-8 shadow-deep sm:p-10 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-8">
              <span className="eyebrow !text-acacia">
                <ShieldCheck className="h-4 w-4" />
                UWA permit &amp; Stripe payment guarantee
              </span>
              <h2 className="text-h3 font-display font-semibold text-parchment">
                Need specific habituation dates or a private family charter?
              </h2>
              <p className="text-sm leading-relaxed text-parchment/80">
                All six expeditions above can be booked online today with either a 30% deposit plus
                UWA permit fees, or 100% full payment via Stripe Checkout. For groups of seven or
                more, or custom cross-border extensions into Rwanda and Kenya, our Kampala desk
                builds bespoke dossiers within 24 hours.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-row">
              <Link href="/booking" className="btn btn-primary w-full">
                <Calendar className="h-4 w-4" />
                Booking engine
              </Link>
              <Link href="/contact" className="btn btn-onPanel w-full">
                Custom inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Side-by-side comparison modal ───────────────────────────────────── */}
      {showCompareModal && comparedExpeditions.length > 0 ? (
        <CompareModal
          expeditions={comparedExpeditions}
          onClose={() => setShowCompareModal(false)}
          onRemove={toggleCompare}
        />
      ) : null}
    </div>
  );
}

function CompareModal({
  expeditions,
  onClose,
  onRemove,
}: {
  expeditions: typeof EXPEDITIONS;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const { money, currency } = useSite();
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const best = {
    price: Math.min(...expeditions.map((e) => e.basePriceUsd)),
    duration: Math.max(...expeditions.map((e) => e.durationDays)),
    group: Math.max(...expeditions.map((e) => e.maxGroupSize)),
  };

  type CompareRow = {
    label: string;
    key: string;
    differs: boolean;
    render: (e: Expedition) => React.ReactNode;
  };

  const allRows: CompareRow[] = [
    {
      label: 'Length',
      key: 'duration',
      differs: new Set(expeditions.map((e) => e.durationDays)).size > 1,
      render: (e) => (
        <span className={`font-display font-semibold ${e.durationDays === best.duration ? 'text-pos' : 'text-heading'}`}>
          {e.durationDays} days / {nightsFor(e.durationDays)} nights
        </span>
      ),
    },
    {
      label: 'Parks & sectors',
      key: 'parks',
      differs: new Set(expeditions.map((e) => e.primaryPark)).size > 1,
      render: (e) => (
        <span className="text-ink">
          {e.primaryPark}
          {e.trekkingSector ? (
            <span className="mt-1 block font-label text-ink-subtle">{e.trekkingSector}</span>
          ) : null}
        </span>
      ),
    },
    {
      label: 'Base rate',
      key: 'price',
      differs: new Set(expeditions.map((e) => e.basePriceUsd)).size > 1,
      render: (e) => (
        <span className={`font-display font-semibold ${e.basePriceUsd === best.price ? 'text-pos' : 'text-heading'}`}>
          {money(e.basePriceUsd)}
          {e.basePriceUsd === best.price ? (
            <span className="ml-1.5 font-label text-ink-subtle">best value</span>
          ) : null}
          <span className="mt-1 block font-label text-ink-subtle">
            ≈ {money(Math.round(e.basePriceUsd / e.durationDays))} / day
          </span>
        </span>
      ),
    },
    {
      label: 'Emerald green season',
      key: 'green',
      differs: new Set(expeditions.map((e) => e.greenSeasonDiscountUsd)).size > 1,
      render: (e) => (
        <span className="text-pos">
          {money(e.basePriceUsd - e.greenSeasonDiscountUsd)}
          <span className="ml-1 font-label text-ink-subtle">
            (−{money(e.greenSeasonDiscountUsd)})
          </span>
        </span>
      ),
    },
    {
      label: 'UWA permits',
      key: 'permits',
      differs: new Set(expeditions.map((e) => e.permitSummary)).size > 1,
      render: (e) => <span className="text-terracotta">{e.permitSummary}</span>,
    },
    {
      label: 'Group size & grade',
      key: 'group',
      differs: new Set(expeditions.map((e) => `${e.maxGroupSize}-${e.difficulty}`)).size > 1,
      render: (e) => (
        <span className="text-ink">
          Max {e.maxGroupSize} pax · {e.difficulty}
          {e.maxGroupSize === best.group ? (
            <span className="ml-1.5 font-label text-pos">largest cap</span>
          ) : null}
        </span>
      ),
    },
    {
      label: 'Signature moments',
      key: 'highlights',
      differs: true,
      render: (e) => (
        <ul className="space-y-1.5">
          {e.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-ink">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pos" />
              {h}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: 'Best months',
      key: 'months',
      differs: new Set(expeditions.map((e) => e.bestMonths.join(','))).size > 1,
      render: (e) => (
        <span className="flex flex-wrap gap-1">
          {e.bestMonths.map((m) => (
            <span key={m} className="chip !py-0.5 !text-[0.62rem]">
              {m}
            </span>
          ))}
        </span>
      ),
    },
  ];
  const rows = differencesOnly ? allRows.filter((row) => row.differs) : allRows;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[65] flex items-start justify-center overflow-y-auto bg-[#08110c]/75 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compare selected expeditions"
        className="anim-scale-in my-8 w-full max-w-6xl overflow-hidden rounded-3xl border border-line/15 bg-surface-raised shadow-deep"
      >
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line/10 bg-canopy px-6 py-5 text-parchment">
          <div>
            <p className="font-label text-acacia">Side-by-side field comparison</p>
            <h2 className="mt-0.5 font-display text-2xl font-semibold text-parchment">
              {expeditions.length} itinerary{expeditions.length > 1 ? 'ies' : ''} under the loupe
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 font-label text-parchment/80">
              <input
                type="checkbox"
                checked={differencesOnly}
                onChange={(e) => setDifferencesOnly(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              Differences only
            </label>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison"
              className="rounded-xl p-2 text-parchment/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="max-h-[68vh] overflow-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead className="sticky top-0 z-10 bg-surface-sunk/95 backdrop-blur">
              <tr className="border-b border-line/15">
                <th className="w-36 px-4 py-3.5 font-label text-ink-subtle sm:px-6">Attribute</th>
                {expeditions.map((exp) => (
                  <th key={exp.id} className="px-4 py-3.5 align-top sm:px-6">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/expeditions/${exp.slug}`}
                        className="font-display text-base font-semibold leading-snug text-heading hover:text-terracotta"
                      >
                        {exp.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => onRemove(exp.id)}
                        aria-label={`Remove ${exp.title}`}
                        className="rounded-lg p-1 text-ink-subtle transition-colors hover:bg-ink/5 hover:text-terracotta"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="media-frame mt-2.5 h-20 rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={exp.heroImage} alt="" loading="lazy" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/10">
              {rows.map((row) => (
                <tr key={row.key} className="align-top transition-colors hover:bg-acacia-light/40">
                  <th
                    scope="row"
                    className="px-4 py-3.5 text-left font-label text-ink-subtle sm:px-6"
                  >
                    {row.label}
                  </th>
                  {expeditions.map((exp) => (
                    <td key={exp.id} className="px-4 py-3.5 sm:px-6">
                      {row.render(exp)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="px-4 py-4 sm:px-6" />
                {expeditions.map((exp) => (
                  <td key={exp.id} className="px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/booking?expedition=${encodeURIComponent(exp.id)}&date=${
                          exp.bestMonths.length ? '2026-11-14' : ''
                        }`}
                        onClick={onClose}
                        className="btn btn-sm btn-primary"
                      >
                        Book this trek
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={`/expeditions/${exp.slug}`} onClick={onClose} className="btn btn-sm btn-outline">
                        Full dossier
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line/10 bg-surface-sunk/60 px-6 py-3.5">
          <p className="font-label text-ink-subtle">
            Prices shown in {currency} · permits itemised at UWA face value
          </p>
          <button type="button" onClick={onClose} className="btn btn-sm btn-solid">
            Done comparing
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function ExpeditionsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="wrap py-24 text-center font-label text-ink-subtle">
          Loading the expedition catalogue…
        </div>
      }
    >
      <ExpeditionsCatalogue />
    </React.Suspense>
  );
}
