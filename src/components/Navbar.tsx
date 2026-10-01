'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Menu,
  X,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  MapPin,
  Sparkles,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/expeditions', label: 'Expeditions' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/about', label: 'About & Guides' },
  { href: '/booking', label: 'Plan & Book' },
  { href: '/contact', label: 'Custom Inquiry' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 no-print">
      {/* Top Field Telemetry Strip */}
      <div className="bg-canopy text-parchment/90 border-b border-white/10 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-mono-tech text-[11px] tracking-wider uppercase text-acacia">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              UWA Permit Desk: Live
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-parchment/75 font-mono-tech text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-acacia" />
              01°02&apos;S 29°41&apos;E · BWINDI &amp; KAMPALA FIELD HQ
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="hidden sm:inline text-parchment/75">
              Small Groups (Max 6) · 100% UWA Permit Price Transparency
            </span>
            <Link
              href="/booking"
              className="inline-flex items-center gap-1 text-acacia hover:text-parchment font-medium transition-colors"
            >
              <span>Check 2026/2027 Gorilla Permits</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav
        aria-label="Primary Navigation"
        className="bg-parchment/95 backdrop-blur-md border-b border-canopy/10 transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-canopy text-parchment flex items-center justify-center shadow-sm group-hover:bg-terracotta transition-colors">
              <Compass className="w-6 h-6 text-acacia group-hover:text-parchment transition-colors" />
            </div>
            <div>
              <span className="block font-serif text-xl sm:text-2xl font-semibold tracking-tight text-canopy leading-none">
                JABALI TRAILS
              </span>
              <span className="block font-mono-tech text-[10px] tracking-[0.2em] uppercase text-bark-muted mt-1">
                UGANDA &amp; EAST AFRICA
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-canopy text-parchment shadow-sm'
                      : 'text-bark hover:text-canopy hover:bg-parchment-dark/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action CTA */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Expedition</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 bg-terracotta text-white text-xs font-semibold px-3.5 py-2 rounded-lg"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-lg text-canopy hover:bg-parchment-dark/60 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-parchment-light border-b border-canopy/15 px-4 pt-3 pb-6 space-y-3 shadow-elevated">
            <div className="grid gap-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
                      isActive
                        ? 'bg-canopy text-parchment'
                        : 'text-bark hover:bg-parchment-dark'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-60" />
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-canopy/10 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs text-bark-muted px-2">
                <ShieldCheck className="w-4 h-4 text-canopy shrink-0" />
                <span>Licensed UWA Gorilla &amp; Chimpanzee Permit Outfitter · Stripe Secured</span>
              </div>
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-terracotta text-white font-semibold py-3 rounded-lg shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Real-Time Booking &amp; Permit Checker</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
