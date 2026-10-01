'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  HeartHandshake,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Send,
} from 'lucide-react';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubmittingNewsletter(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          interest: 'UWA Permit Alerts & Field Dispatches',
        }),
      });
      const data = await res.json();
      setNewsletterStatus(
        data.message || 'Subscribed to Jabali Field Dispatches & UWA Permit Alerts.'
      );
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('Subscribed to Jabali Field Dispatches.');
      setNewsletterEmail('');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  return (
    <footer className="bg-canopy-topographic text-parchment border-t border-white/10 no-print">
      {/* Conservation Pledge Banner */}
      <div className="border-b border-white/10 bg-canopy-moss/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-acacia/20 border border-acacia/40 flex items-center justify-center shrink-0 mt-0.5">
                <HeartHandshake className="w-6 h-6 text-acacia" />
              </div>
              <div>
                <span className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
                  The Jabali 5% Field Conservation Mandate
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-parchment mt-1">
                  Every Expedition Directly Funds Habitat Protection &amp; Community Livelihoods
                </h3>
                <p className="text-sm text-parchment/75 mt-1.5 max-w-3xl leading-relaxed">
                  Beyond the Uganda Wildlife Authority’s 20% community revenue-sharing from every $800 gorilla permit, Jabali Trails allocates 5% of all land safari revenues to Gorilla Doctors, the Kibale Snare Removal Project, and Ride 4 a Woman in Buhoma.
                </p>
              </div>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                href="/about#conservation"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-medium text-parchment transition-all"
              >
                <span>Read 2026 Impact Ledger</span>
                <ArrowUpRight className="w-4 h-4 text-acacia" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand, Credentials & Newsletter */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-acacia/20 border border-acacia/40 flex items-center justify-center">
                <Compass className="w-6 h-6 text-acacia" />
              </div>
              <div>
                <span className="block font-serif text-2xl font-semibold tracking-tight text-parchment leading-none">
                  JABALI TRAILS
                </span>
                <span className="block font-mono-tech text-[10px] tracking-[0.2em] uppercase text-acacia mt-1">
                  UGANDA &amp; EAST AFRICA
                </span>
              </div>
            </Link>

            <p className="text-sm text-parchment/75 leading-relaxed">
              Thoughtful, small-group and private guided expeditions across Uganda’s Albertine Rift rainforests, the Victoria Nile, Karamoja, and the Great Rift savannahs of East Africa.
            </p>

            {/* Field Dispatch Newsletter Form */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
              <label
                htmlFor="footer-newsletter"
                className="block font-mono-tech text-[11px] uppercase tracking-wider text-acacia"
              >
                UWA Seasonal Permit &amp; Field Dispatches
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  placeholder="Enter your email for permit alerts..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs text-parchment placeholder:text-parchment/50 focus:outline-none focus:border-acacia"
                />
                <button
                  type="submit"
                  disabled={submittingNewsletter}
                  className="px-3.5 py-2 rounded-lg bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold inline-flex items-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Join</span>
                </button>
              </div>
              {newsletterStatus && (
                <p className="text-xs text-emerald-400 font-mono-tech">{newsletterStatus}</p>
              )}
            </form>

            <div className="pt-2 space-y-2 text-xs text-parchment/80 font-mono-tech">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-acacia shrink-0" />
                <span>Licensed by Uganda Tourism Board (UTB/TO/2026/0419)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-acacia shrink-0" />
                <span>Accredited Member — Assoc. of Uganda Tour Operators (AUTO)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-acacia shrink-0" />
                <span>Direct UWA E-Permit Portal Partner (Bwindi &amp; Kibale)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Signature Expeditions */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
              Signature Expeditions
            </h4>
            <ul className="space-y-2.5 text-sm text-parchment/80">
              <li>
                <Link
                  href="/expeditions/bwindi-mist-mountain-gorillas"
                  className="hover:text-acacia transition-colors"
                >
                  Bwindi Mist &amp; Mountain Gorillas (5D)
                </Link>
              </li>
              <li>
                <Link
                  href="/expeditions/primate-kingdom-kibale-chimps-bwindi-gorillas"
                  className="hover:text-acacia transition-colors"
                >
                  Primate Kingdom: Chimps &amp; Gorillas (8D)
                </Link>
              </li>
              <li>
                <Link
                  href="/expeditions/great-rift-nile-safari-murchison-queen-elizabeth"
                  className="hover:text-acacia transition-colors"
                >
                  Great Rift &amp; Victoria Nile Safari (7D)
                </Link>
              </li>
              <li>
                <Link
                  href="/expeditions/kidepo-valley-karamoja-walking-expedition"
                  className="hover:text-acacia transition-colors"
                >
                  Kidepo Valley Walking Expedition (6D)
                </Link>
              </li>
              <li>
                <Link
                  href="/expeditions/ultimate-pearl-of-africa-grand-circuit"
                  className="hover:text-acacia transition-colors"
                >
                  Ultimate Pearl of Africa Circuit (12D)
                </Link>
              </li>
              <li>
                <Link
                  href="/expeditions/east-africa-bwindi-gorillas-serengeti-migration"
                  className="hover:text-acacia transition-colors"
                >
                  Bwindi &amp; Serengeti Fly-In (10D)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Destinations & Planning */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-parchment/80">
              <li>
                <Link href="/destinations" className="hover:text-acacia transition-colors">
                  Uganda National Parks
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-acacia transition-colors">
                  Our Story &amp; Field Guides
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-acacia transition-colors">
                  Real-Time Permit &amp; Booking
                </Link>
              </li>
              <li>
                <Link href="/booking#permit-guide" className="hover:text-acacia transition-colors">
                  UWA Gorilla Permit Guide
                </Link>
              </li>
              <li>
                <Link href="/booking#packing-list" className="hover:text-acacia transition-colors">
                  Rainforest Packing Checklist
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-acacia transition-colors">
                  Tailor-Made Private Safaris
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-acacia text-acacia/90 transition-colors">
                  Admin &amp; Operations Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Field Offices & Contact */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
              Field Dispatch &amp; Offices
            </h4>
            <div className="space-y-3 text-sm text-parchment/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-acacia shrink-0 mt-1" />
                <div>
                  <strong className="block text-parchment font-medium">Kampala Operations Hub</strong>
                  <span>Plot 14 Kololo Hill Drive, Kampala, Uganda</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-acacia shrink-0 mt-1" />
                <div>
                  <strong className="block text-parchment font-medium">Bwindi Trailhead Desk</strong>
                  <span>Buhoma Sector Gate Road, Kanungu District</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-acacia shrink-0" />
                <span className="font-mono-tech text-xs">+256 (0) 772 841 920 · +1 (800) 942-3810</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-acacia shrink-0" />
                <span className="font-mono-tech text-xs">expeditions@jabalitrails.africa</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-acacia shrink-0" />
                <div className="text-xs text-parchment/80">
                  <strong className="block text-parchment">Stripe Global Payments</strong>
                  <span>256-bit encrypted Checkout &amp; UWA Permit Escrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Trust Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-parchment/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-acacia" />
            <span>
              © {new Date().getFullYear()} Jabali Trails Africa Ltd. All rights reserved. AMREF Flying Doctors Evacuation Partner.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-acacia hover:text-parchment font-mono-tech transition-colors">
              Admin &amp; Permit Console
            </Link>
            <Link href="/booking" className="hover:text-parchment transition-colors">
              Booking Terms &amp; UWA Permit Policy
            </Link>
            <Link href="/contact" className="hover:text-parchment transition-colors">
              24/7 Satellite Emergency Desk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
