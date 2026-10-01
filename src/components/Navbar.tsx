'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Menu,
  X,
  Calendar,
  ArrowUpRight,
  Search,
  Moon,
  Sun,
  FileSearch,
  Phone,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import PermitLookupModal from '@/components/PermitLookupModal';
import { useSite, CURRENCIES, type CurrencyCode } from '@/components/providers/SiteProvider';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/expeditions', label: 'Expeditions' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/about', label: 'About & Guides' },
  { href: '/booking', label: 'Plan & Book' },
  { href: '/contact', label: 'Custom Inquiry' },
];

function BrandMark() {
  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-canopy shadow-card ring-1 ring-acacia/30 transition-transform duration-500 group-hover:-rotate-3">
      <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
        <path d="M3 30 L14 13 L20 22 L25.5 14.5 L37 30 Z" fill="#C89B3C" />
        <path d="M14 13 L20 22 L16 30 L8 30 Z" fill="#B8532E" />
        <circle cx="29.5" cy="9.5" r="3.2" fill="#F6F3EC" />
      </svg>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme, currency, setCurrency, wishlist, setPaletteOpen } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [clock, setClock] = useState('');

  /* Shrink the header once the hero scrolls away */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* East Africa Time (Kampala desk) */
  useEffect(() => {
    const tick = () => {
      try {
        setClock(
          new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Africa/Kampala',
          }).format(new Date())
        );
      } catch {
        setClock('');
      }
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  /* Close the mobile sheet whenever the route changes */
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : Boolean(pathname?.startsWith(href));

  return (
    <header className="no-print sticky top-0 z-50">
      {/* ── Field telemetry strip ─────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-canopy text-[0.7rem] text-parchment/85">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-5 gap-y-1 py-1.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-label text-acacia">
              <span className="anim-pulse-ring h-1.5 w-1.5 rounded-full bg-emerald-400" />
              UWA Permit Desk · Live
            </span>
            <span className="hidden items-center gap-1.5 font-label text-parchment/65 md:inline-flex">
              <span className="h-1 w-1 rounded-full bg-acacia/70" />
              Kampala {clock ? `${clock} EAT` : 'EAT'} · 01°02&apos;S 29°41&apos;E
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden font-label text-parchment/60 lg:inline">
              Max 6 guests · 100% permit price transparency
            </span>
            <a
              href="tel:+256772841920"
              className="hidden items-center gap-1.5 font-label text-parchment/75 transition-colors hover:text-acacia sm:inline-flex"
            >
              <Phone className="h-3 w-3 text-acacia" />
              +256 772 841 920
            </a>
            <Link
              href="/booking"
              className="link-underline inline-flex items-center gap-1 font-label text-acacia transition-colors hover:text-parchment"
            >
              2026/27 Gorilla Permits
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Primary navigation ────────────────────────────────────────────── */}
      <nav
        aria-label="Primary"
        className={`border-b backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? 'border-line/15 bg-surface-raised/92 shadow-card'
            : 'border-line/10 bg-surface/85'
        }`}
      >
        <div
          className={`wrap flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          <Link href="/" className="group flex items-center gap-3" aria-label="Jabali Trails Africa home">
            <BrandMark />
            <span className="leading-none">
              <span
                className={`block font-display font-semibold tracking-tight text-heading transition-all duration-300 ${
                  scrolled ? 'text-lg' : 'text-xl'
                }`}
              >
                JABALI TRAILS
              </span>
              <span className="mt-1 block font-label text-ink-subtle">
                Uganda &amp; East Africa
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`navlink ${isActive(link.href) ? 'navlink-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-1.5 lg:flex">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-line/20 bg-surface-raised px-3 py-2 text-xs font-medium text-ink-muted transition-all hover:border-terracotta/45 hover:text-heading"
              aria-label="Search expeditions, parks and guides"
            >
              <Search className="h-3.5 w-3.5 text-terracotta" />
              <span>Search</span>
              <kbd className="rounded border border-line/20 px-1 font-label text-[0.6rem] text-ink-subtle">
                ⌘K
              </kbd>
            </button>

            <label className="sr-only" htmlFor="nav-currency">
              Display currency
            </label>
            <select
              id="nav-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="rounded-full border border-line/20 bg-surface-raised px-2.5 py-2 pr-7 font-label text-ink-muted transition-colors hover:border-terracotta/45 hover:text-heading"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to daylight mode' : 'Switch to night mode'}
              title={theme === 'dark' ? 'Daylight field mode' : 'Night field mode'}
              className="grid h-9 w-9 place-items-center rounded-full border border-line/20 bg-surface-raised text-ink-muted transition-all hover:border-acacia/60 hover:text-acacia-dark"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Link
              href="/expeditions?view=saved"
              aria-label={`Saved expeditions (${wishlist.length})`}
              title="Your saved expeditions"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-line/20 bg-surface-raised text-ink-muted transition-all hover:border-terracotta/45 hover:text-terracotta"
            >
              <Heart
                className={`h-4 w-4 ${wishlist.length ? 'fill-terracotta text-terracotta' : ''}`}
              />
              {wishlist.length > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-1 place-items-center rounded-full bg-terracotta px-1 font-label text-[0.55rem] text-white">
                  {wishlist.length}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setLookupOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line/20 bg-surface-raised px-3 py-2 font-label text-ink-muted transition-all hover:border-canopy hover:text-heading"
            >
              <FileSearch className="h-3.5 w-3.5 text-terracotta" />
              My booking
            </button>

            <Link
              href="/booking"
              className="btn btn-primary ml-1 !px-4 !py-2.5 text-[0.82rem]"
            >
              <Calendar className="h-4 w-4" />
              Book expedition
            </Link>
          </div>

          {/* Mobile triggers */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full border border-line/20 text-ink-muted"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/booking"
              className="btn btn-primary !px-3.5 !py-2 text-xs"
            >
              <Calendar className="h-3.5 w-3.5" />
              Book
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="grid h-10 w-10 place-items-center rounded-full border border-line/20 text-heading transition-colors hover:bg-ink/5"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile sheet ──────────────────────────────────────────────── */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="animate-slide-down border-t border-line/10 bg-surface-raised px-4 pb-6 pt-3 shadow-elevated lg:hidden"
          >
            <div className="grid gap-1">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 font-display text-[0.95rem] font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'bg-canopy text-parchment'
                      : 'text-heading hover:bg-ink/5'
                  }`}
                  style={{ animation: `jb-fade .35s ease both`, animationDelay: `${i * 25}ms` }}
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-outline flex-1 !py-2.5 text-xs"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Daylight' : 'Night'}
              </button>
              <select
                aria-label="Display currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="field !w-auto !py-2.5 font-label"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
              <Link
                href="/expeditions?view=saved"
                className="btn btn-outline !px-3 !py-2.5"
                aria-label="Saved expeditions"
              >
                <Heart
                  className={`h-4 w-4 ${wishlist.length ? 'fill-terracotta text-terracotta' : ''}`}
                />
                {wishlist.length || ''}
              </Link>
            </div>

            <div className="mt-4 grid gap-2 border-t border-line/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setLookupOpen(true);
                }}
                className="btn btn-outline w-full !py-3 text-sm"
              >
                <FileSearch className="h-4 w-4 text-terracotta" />
                My booking / permit docket
              </button>
              <Link href="/contact" className="btn btn-solid w-full !py-3 text-sm">
                <Sparkles className="h-4 w-4 text-acacia" />
                Design a tailor-made safari
              </Link>
              <p className="mt-1 flex items-start gap-2 px-1 text-xs leading-relaxed text-ink-subtle">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-canopy" />
                Licensed UTB operator · AUTO member · direct UWA e-permit partner · Stripe-secured
                checkout.
              </p>
            </div>
          </div>
        )}
      </nav>

      {lookupOpen && <PermitLookupModal onClose={() => setLookupOpen(false)} />}
    </header>
  );
}
