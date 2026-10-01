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
  ArrowUp,
  Loader2,
  Instagram,
  Youtube,
  Linkedin,
} from 'lucide-react';
import { useSite } from '@/components/providers/SiteProvider';
import { EXPEDITIONS } from '@/data/expeditions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export default function Footer() {
  const { pushToast } = useSite();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{
    tone: 'ok' | 'err';
    message: string;
  } | null>(null);
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!EMAIL_RE.test(email)) {
      setNewsletterStatus({ tone: 'err', message: 'Enter a valid email so we can send permit alerts.' });
      return;
    }
    setSubmittingNewsletter(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          interest: 'UWA Permit Alerts & Field Dispatches',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNewsletterStatus({
          tone: 'err',
          message: data?.error || 'Unable to subscribe right now — please retry.',
        });
      } else {
        setNewsletterStatus({
          tone: 'ok',
          message: data?.message || 'Subscribed to Jabali Field Dispatches & UWA Permit Alerts.',
        });
        pushToast({
          tone: 'success',
          title: 'Field Dispatches subscribed',
          message: 'We will email you when gorilla permit quotas open in your window.',
        });
        setNewsletterEmail('');
      }
    } catch {
      setNewsletterStatus({
        tone: 'err',
        message: 'Connection dropped — your email was not saved. Please retry.',
      });
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  return (
    <footer className="bg-canopy-topographic grain relative text-parchment">
      {/* Conservation pledge banner */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.03]">
        <div className="wrap py-9">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="flex items-start gap-4 lg:col-span-9">
              <div className="mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-acacia/40 bg-acacia/15">
                <HeartHandshake className="h-6 w-6 text-acacia" />
              </div>
              <div>
                <span className="font-label text-acacia">
                  The Jabali 5% field conservation mandate
                </span>
                <h3 className="mt-1 font-display text-xl text-parchment sm:text-2xl">
                  Every expedition directly funds habitat protection &amp; community livelihoods
                </h3>
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-parchment/75">
                  Beyond the Uganda Wildlife Authority’s 20% community revenue-sharing from every
                  $800 gorilla permit, Jabali Trails allocates 5% of all land safari revenues to
                  Gorilla Doctors, the Kibale Snare Removal Project, and Ride 4 a Woman in Buhoma.
                </p>
              </div>
            </div>
            <div className="flex lg:justify-end">
              <Link
                href="/about#conservation"
                className="btn btn-onPanel w-full text-sm lg:w-auto"
              >
                Read the 2026 impact ledger
                <ArrowUpRight className="h-4 w-4 text-acacia" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="wrap relative z-10 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="space-y-5 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-acacia/40 bg-acacia/15 transition-colors group-hover:bg-acacia/25">
                <Compass className="h-6 w-6 text-acacia" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-2xl font-semibold tracking-tight text-parchment">
                  JABALI TRAILS
                </span>
                <span className="mt-1 block font-label text-acacia">Uganda &amp; East Africa</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-parchment/75">
              Thoughtful, small-group and private guided expeditions across Uganda’s Albertine
              Rift rainforests, the Victoria Nile, Karamoja, and the Great Rift savannahs of East
              Africa.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
              <label htmlFor="footer-newsletter" className="block font-label text-acacia">
                UWA seasonal permit &amp; field dispatches
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  aria-invalid={newsletterStatus?.tone === 'err' || undefined}
                  placeholder="you@example.com"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus) setNewsletterStatus(null);
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs text-parchment outline-none transition-colors placeholder:text-parchment/45 focus:border-acacia focus:bg-white/[0.14]"
                />
                <button
                  type="submit"
                  disabled={submittingNewsletter}
                  className="btn btn-primary !px-3.5 !py-2.5 text-xs disabled:opacity-70"
                >
                  {submittingNewsletter ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Join
                </button>
              </div>
              {newsletterStatus ? (
                <p
                  role="status"
                  className={`text-xs font-medium ${
                    newsletterStatus.tone === 'ok' ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {newsletterStatus.message}
                </p>
              ) : null}
            </form>

            <div className="flex items-center gap-2 pt-1">
              {[
                { label: 'Instagram', href: 'https://instagram.com', Icon: Instagram },
                { label: 'YouTube', href: 'https://youtube.com', Icon: Youtube },
                { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
              ].map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Jabali Trails Africa on ${label}`}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-parchment/70 transition-all hover:-translate-y-0.5 hover:border-acacia/60 hover:text-acacia"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="space-y-2 pt-1 text-xs text-parchment/80">
              {[
                'Licensed by Uganda Tourism Board (UTB/TO/2026/0419)',
                'Accredited member — Association of Uganda Tour Operators (AUTO)',
                'Direct UWA e-permit portal partner (Bwindi & Kibale)',
              ].map((line) => (
                <div key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acacia" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature expeditions */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="font-label text-acacia">Signature expeditions</h4>
            <ul className="space-y-2.5 text-sm text-parchment/80">
              {EXPEDITIONS.slice(0, 6).map((exp) => (
                <li key={exp.id}>
                  <Link
                    href={`/expeditions/${exp.slug}`}
                    className="link-underline inline-flex text-left hover:text-acacia"
                  >
                    {exp.title}
                    <span className="ml-1 font-label text-parchment/45">{exp.durationDays}D</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="font-label text-acacia">Plan &amp; explore</h4>
            <ul className="space-y-2.5 text-sm text-parchment/80">
              {[
                { href: '/expeditions', label: 'All expeditions' },
                { href: '/destinations', label: 'National parks' },
                { href: '/about', label: 'Story & guides' },
                { href: '/about#conservation', label: 'Conservation ledger' },
                { href: '/booking', label: 'Real-time booking' },
                { href: '/booking#permit-guide', label: 'UWA permit guide' },
                { href: '/booking#packing-list', label: 'Packing checklist' },
                { href: '/contact', label: 'Tailor-made inquiry' },
                { href: '/admin', label: 'Ops console' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline hover:text-acacia">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Offices */}
          <div className="space-y-4 lg:col-span-3">
            <h4 className="font-label text-acacia">Field dispatch &amp; offices</h4>
            <div className="space-y-3 text-sm text-parchment/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-acacia" />
                <div>
                  <strong className="block font-medium text-parchment">Kampala operations hub</strong>
                  <span>Plot 14 Kololo Hill Drive, Kampala, Uganda</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-acacia" />
                <div>
                  <strong className="block font-medium text-parchment">Bwindi trailhead desk</strong>
                  <span>Buhoma Sector Gate Road, Kanungu District</span>
                </div>
              </div>
              <a
                href="tel:+256772841920"
                className="flex items-center gap-2.5 transition-colors hover:text-acacia"
              >
                <Phone className="h-4 w-4 shrink-0 text-acacia" />
                <span className="font-label">+256 (0) 772 841 920</span>
              </a>
              <a
                href="mailto:expeditions@jabalitrails.africa"
                className="flex items-center gap-2.5 transition-colors hover:text-acacia"
              >
                <Mail className="h-4 w-4 shrink-0 text-acacia" />
                <span className="font-label">expeditions@jabalitrails.africa</span>
              </a>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 pt-2">
              <CreditCard className="h-5 w-5 shrink-0 text-acacia" />
              <div className="text-xs text-parchment/80">
                <strong className="block text-parchment">Stripe global payments</strong>
                <span>256-bit encrypted checkout · UWA permit escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="wrap relative z-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-xs text-parchment/60 sm:flex-row">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-acacia" />
          <span>
            © {new Date().getFullYear()} Jabali Trails Africa Ltd. All rights reserved. AMREF
            Flying Doctors evacuation partner.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/booking" className="link-underline hover:text-parchment">
            Booking terms &amp; permit policy
          </Link>
          <Link href="/contact" className="link-underline hover:text-parchment">
            24/7 satellite emergency desk
          </Link>
          <Link href="/admin" className="font-label text-acacia hover:text-parchment">
            Ops console
          </Link>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-parchment/75 transition-colors hover:border-acacia/60 hover:text-acacia"
          >
            <ArrowUp className="h-3 w-3" />
            Top
          </button>
        </div>
      </div>
    </footer>
  );
}
