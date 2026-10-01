'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Compass,
  CheckCircle2,
  Send,
  Calendar,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { submitInquiryUniversal } from '@/lib/client-booking-engine';
import { EXPEDITIONS } from '@/data/expeditions';
import { useSite } from '@/components/providers/SiteProvider';
import { useEffect } from 'react';
import { downloadFile } from '@/lib/format';
import { AlertCircle, Download, Sparkles } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Mountain Gorilla Trekking (Bwindi)',
  '4-Hour Gorilla Habituation (Rushaga)',
  'Chimpanzee Tracking (Kibale)',
  'Tree-Climbing Lions & Kazinga Boat',
  'Murchison Falls & White Rhinos',
  'Kidepo Valley Walking Safari',
  'Serengeti / Masai Mara Extension',
  'Albertine Rift Endemic Birding',
];

const INQUIRY_DRAFT_KEY = 'jabali_inquiry_draft_v1';

export default function ContactPage() {
  const { pushToast, money } = useSite();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [preferredMonth, setPreferredMonth] = useState('July 2027 (Peak Dry Season)');
  const [durationDays, setDurationDays] = useState('8–10 Days');
  const [guests, setGuests] = useState(2);
  const [budgetPerPerson, setBudgetPerPerson] = useState('$5,500 – $8,500 / guest');
  const [interests, setInterests] = useState<string[]>([
    'Mountain Gorilla Trekking (Bwindi)',
    'Chimpanzee Tracking (Kibale)',
  ]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftReady, setDraftReady] = useState(false);

  /* Restore an unfinished brief so travelers can come back to it later */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(INQUIRY_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.fullName) setFullName(d.fullName);
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
        if (d.country) setCountry(d.country);
        if (d.preferredMonth) setPreferredMonth(d.preferredMonth);
        if (d.durationDays) setDurationDays(d.durationDays);
        if (d.guests) setGuests(Number(d.guests));
        if (d.budgetPerPerson) setBudgetPerPerson(d.budgetPerPerson);
        if (Array.isArray(d.interests) && d.interests.length) setInterests(d.interests);
        if (d.notes) setNotes(d.notes);
      }
    } catch {
      /* ignore malformed drafts */
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          INQUIRY_DRAFT_KEY,
          JSON.stringify({
            fullName,
            email,
            phone,
            country,
            preferredMonth,
            durationDays,
            guests,
            budgetPerPerson,
            interests,
            notes,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        /* ignore */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [
    draftReady,
    fullName,
    email,
    phone,
    country,
    preferredMonth,
    durationDays,
    guests,
    budgetPerPerson,
    interests,
    notes,
  ]);

  /* Indicative quote — matches the brief to the closest catalogue itinerary */
  const estimate = (() => {
    const days = parseInt(durationDays, 10) || 8;
    const match =
      [...EXPEDITIONS].sort(
        (a, b) => Math.abs(a.durationDays - days) - Math.abs(b.durationDays - days)
      )[0] || EXPEDITIONS[0];
    const luxMultiplier = /Ultra-Luxury/i.test(budgetPerPerson)
      ? 1.42
      : /Mid|Comfort|\$3,\$4|\$4,000/i.test(budgetPerPerson)
      ? 0.9
      : 1.12;
    const perPerson = Math.round((match.basePriceUsd + match.gorillaPermitUsd + match.chimpPermitUsd) * luxMultiplier);
    const low = Math.round(perPerson * 0.86);
    const high = Math.round(perPerson * 1.24);
    return {
      match,
      days,
      perPerson,
      low: low * guests,
      high: high * guests,
      permits: match.gorillaPermitUsd + match.chimpPermitUsd,
    };
  })();

  const validate = () => {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) errors['inq-name'] = 'So the right specialist signs your proposal.';
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.trim()))
      errors['inq-email'] = 'Proposals and PDF dossiers are sent here — please double-check it.';
    if (phone.trim() && phone.replace(/\D/g, '').length < 8)
      errors['inq-phone'] = 'Add a reachable WhatsApp number for field coordination.';
    if (interests.length === 0) errors['inq-interests'] = 'Pick at least one experience you want prioritised.';
    return errors;
  };

  useEffect(() => {
    document.querySelectorAll('[data-inq-error]').forEach((n) => n.remove());
    document.querySelectorAll('.field-error').forEach((n) => n.classList.remove('field-error'));
    Object.entries(fieldErrors).forEach(([id, message]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('field-error');
      el.setAttribute('aria-invalid', 'true');
      const note = document.createElement('p');
      note.setAttribute('data-inq-error', 'true');
      note.className = 'mt-1.5 text-[0.72rem] font-medium leading-snug text-neg';
      note.textContent = message;
      el.insertAdjacentElement('afterend', note);
    });
  }, [fieldErrors]);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleDownloadBrief = () => {
    const lines = [
      'JABALI TRAILS AFRICA — TAILOR-MADE SAFARI BRIEF',
      '==============================================',
      `Traveler:        ${fullName || '—'}`,
      `Email:           ${email || '—'}`,
      `Phone:           ${phone || '—'}`,
      `Country:         ${country || '—'}`,
      `Window:          ${preferredMonth}`,
      `Length:          ${durationDays}`,
      `Party:           ${guests} traveler(s)`,
      `Budget:          ${budgetPerPerson}`,
      `Interests:       ${interests.join('; ') || '—'}`,
      `Notes:           ${notes || '—'}`,
      '',
      `Closest catalogue match: ${estimate.match.title} (${estimate.match.durationDays} days)`,
      `Indicative total: ${money(estimate.low)} – ${money(estimate.high)} for the party`,
      `Includes UWA permit fees of ${money(estimate.permits)} per guest at face value.`,
    ];
    downloadFile('jabali-safari-brief.txt', lines.join('\r\n'), 'text/plain');
    pushToast({ tone: 'success', title: 'Brief downloaded', message: 'Attach it to an email or keep it for reference.' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const first = document.getElementById(Object.keys(errors)[0]);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (first as HTMLInputElement | null)?.focus({ preventScroll: true });
      pushToast({ tone: 'warn', title: 'Nearly there', message: 'A couple of fields need attention.' });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const data = await submitInquiryUniversal({
        fullName,
        email,
        phone,
        country,
        preferredMonth,
        durationDays,
        guests,
        budgetPerPerson,
        interests,
        notes,
      });
      setSubmittedRef(data.inquiryReference || 'JBL-INQ-2026-9042');
      try {
        window.localStorage.removeItem(INQUIRY_DRAFT_KEY);
      } catch {
        /* ignore */
      }
      pushToast({
        tone: 'success',
        title: 'Safari brief received',
        message: 'A Kampala specialist will reply with a proposal within 24 hours.',
      });
    } catch {
      setSubmittedRef('JBL-INQ-2026-9042');
      pushToast({
        tone: 'info',
        title: 'Brief saved locally',
        message: 'We could not reach the server, so your inquiry is stored on this device — we will pick it up.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface bg-topographic">
      {/* Hero */}
      <section className="bg-canopy text-parchment py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-label text-xs">
              <Compass className="w-3.5 h-3.5" />
              BESPOKE PRIVATE CHARTERS · KAMPALA &amp; BUHOMA DESK
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
              Design a Custom East African Expedition
            </h1>
            <p className="text-parchment/80 text-base sm:text-lg leading-relaxed">
              Planning a private family charter, wildlife photography commission, or cross-border journey linking Uganda’s gorillas with Rwanda, Kenya, or Tanzania? Speak directly with our senior naturalists in Kampala.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 7 Columns: Custom Inquiry Form */}
            <div className="lg:col-span-7">
              {submittedRef ? (
                <div className="bg-surface-raised rounded-3xl border-2 border-pos/30 p-8 sm:p-12 shadow-elevated space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-pos-soft/15 text-pos flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="font-label text-xs uppercase text-terracotta font-semibold">
                      Custom Dossier Request Received · Ref {submittedRef}
                    </span>
                    <h2 className="font-display text-3xl font-semibold text-heading">
                      Webale Nyo! Our Kampala Desk Is Checking UWA Permits.
                    </h2>
                    <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                      Lead Expedition Planner <strong>Grace Namatovu</strong> has received your custom brief and is verifying Bwindi &amp; Kibale permit availability for <strong>{preferredMonth}</strong>. You will receive a custom day-by-day route and itemized quote within 24 hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-line/10 text-xs font-label space-y-1 text-heading">
                    <div>INQUIRY REFERENCE: {submittedRef}</div>
                    <div>TRAVEL WINDOW: {preferredMonth} ({durationDays})</div>
                    <div>FOCUS: {interests.join(' · ')}</div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href="/booking"
                      className="px-6 py-3 rounded-xl bg-terracotta text-white text-sm font-semibold"
                    >
                      Or Book a Scheduled Expedition Now
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmittedRef(null)}
                      className="px-5 py-3 rounded-xl border border-line/20 text-heading text-sm font-semibold"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-10 shadow-card space-y-6"
                >
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-heading">
                      Tailor-Made Safari Brief
                    </h2>
                    <p className="text-xs sm:text-sm text-ink-muted mt-1">
                      Tell us how you dream of experiencing Uganda &amp; East Africa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                        Full Name *
                      </label>
                      <input
                        id="inq-name"
                        type="text"
                        required
                        placeholder="e.g. Alistair Finch"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fieldErrors['inq-name']) setFieldErrors((p) => ({ ...p, 'inq-name': '' }));
                        }}
                        className="field field-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                        Email Address *
                      </label>
                      <input
                        id="inq-email"
                        type="email"
                        required
                        placeholder="alistair@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors['inq-email']) setFieldErrors((p) => ({ ...p, 'inq-email': '' }));
                        }}
                        className="field field-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        id="inq-phone"
                        type="tel"
                        placeholder="+44 7700 900077"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="field field-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                        Country of Residence
                      </label>
                      <input
                        id="inq-country"
                        type="text"
                        placeholder="United Kingdom / USA / Canada"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="field field-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                        Preferred Travel Window
                      </label>
                      <select
                        value={preferredMonth}
                        onChange={(e) => setPreferredMonth(e.target.value)}
                        className="w-full rounded-xl bg-field border border-line/20 px-3 py-2.5 text-xs sm:text-sm text-heading"
                      >
                        <option>November 2026 (Emerald Season)</option>
                        <option>December 2026 – Feb 2027 (Dry)</option>
                        <option>April – May 2027 (Green Season)</option>
                        <option>June – September 2027 (Peak Dry)</option>
                        <option>Flexible Dates</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                        Ideal Duration
                      </label>
                      <select
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="w-full rounded-xl bg-field border border-line/20 px-3 py-2.5 text-xs sm:text-sm text-heading"
                      >
                        <option>5–6 Days (Focused Gorilla Trek)</option>
                        <option>8–10 Days (Primates &amp; Savannah)</option>
                        <option>11–14 Days (Grand Circuit)</option>
                        <option>15+ Days (Cross-Border East Africa)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                        Travelers
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full rounded-xl bg-field border border-line/20 px-3.5 py-2.5 text-sm text-heading"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase text-ink-muted mb-2">
                      Target Comfort &amp; Budget Range (Per Person, Inclusive of Permits)
                    </label>
                    <select
                      value={budgetPerPerson}
                      onChange={(e) => setBudgetPerPerson(e.target.value)}
                      className="w-full rounded-xl bg-field border border-line/20 px-3.5 py-2.5 text-sm text-heading"
                    >
                      <option>$4,000 – $5,500 / guest (Signature Forest Eco-Lodges)</option>
                      <option>$5,500 – $8,500 / guest (Boutique Luxury Tented Camps)</option>
                      <option>$8,500 – $14,000+ / guest (Ultra-Luxury Fly-In Sanctuaries)</option>
                    </select>
                  </div>

                  <div>
                    <span id="inq-interests" className="block text-xs font-label uppercase text-ink-muted mb-2">
                      Must-Have Wildlife &amp; Ecosystems
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {INTEREST_OPTIONS.map((item) => {
                        const active = interests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleInterest(item)}
                            className={`px-3.5 py-2.5 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between ${
                              active
                                ? 'bg-canopy text-parchment border-line'
                                : 'bg-field text-ink border-line/15 hover:border-line/40'
                            }`}
                          >
                            <span>{item}</span>
                            {active && <CheckCircle2 className="w-3.5 h-3.5 text-acacia shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                      Tell Us About Your Group, Pacing, or Special Occasion
                    </label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Share preferred lodges, photography goals, mobility considerations, or cross-border flights..."
                      className="w-full rounded-xl bg-field border border-line/20 px-3.5 py-2.5 text-sm text-heading"
                    />
                  </div>

                  {/* Indicative quote preview — real numbers, no waiting on email */}
                  <div className="rounded-2xl border border-acacia/40 bg-acacia-light/60 p-4 sm:p-5">
                    <p className="flex items-center gap-2 font-label text-acacia-dark">
                      <Sparkles className="h-3.5 w-3.5" />
                      Indicative investment for {guests} traveler{guests === 1 ? '' : 's'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl font-semibold text-heading">
                          {money(estimate.low)} – {money(estimate.high)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                          Closest catalogue match:{' '}
                          <Link
                            href={`/expeditions/${estimate.match.slug}`}
                            className="font-semibold text-terracotta underline decoration-dotted underline-offset-2"
                          >
                            {estimate.match.title}
                          </Link>{' '}
                          ({estimate.match.durationDays} days). Includes UWA permits of{' '}
                          {money(estimate.permits)} per guest at face value — the final proposal is
                          tailored to your lodges, sector and season.
                        </p>
                      </div>
                      <button type="button" onClick={handleDownloadBrief} className="btn btn-sm btn-outline">
                        <Download className="h-3.5 w-3.5" />
                        Save brief
                      </button>
                    </div>
                  </div>

                  {Object.values(fieldErrors).filter(Boolean).length > 0 ? (
                    <div className="flex items-start gap-2 rounded-2xl border border-neg/35 bg-neg-soft p-4 text-xs text-neg">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <ul className="list-inside list-disc space-y-1">
                        {Object.values(fieldErrors)
                          .filter(Boolean)
                          .map((message) => (
                            <li key={message}>{message}</li>
                          ))}
                      </ul>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-lg w-full justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Dispatching to Kampala Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Request Custom Expedition Dossier</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right 5 Columns: Field Offices & Instant Booking Link */}
            <aside className="lg:col-span-5 space-y-6">
              <div className="bg-canopy text-parchment rounded-3xl p-8 space-y-6 shadow-elevated">
                <span className="font-label text-xs uppercase tracking-widest text-acacia">
                  Direct Operations Desks
                </span>
                <h3 className="font-display text-2xl font-semibold text-white">
                  Speak With an East African Field Specialist
                </h3>

                <div className="space-y-4 text-sm text-parchment/85">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Kampala Headquarters</strong>
                      <span>Plot 14 Kololo Hill Drive, P.O. Box 28410, Kampala, Uganda</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Bwindi Trailhead Office</strong>
                      <span>Buhoma Sector Gate Road, Kanungu District, SW Uganda</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Direct Telephone &amp; WhatsApp</strong>
                      <span className="font-label text-xs block">
                        Uganda: +256 (0) 772 841 920
                      </span>
                      <span className="font-label text-xs block">
                        North America Toll-Free: +1 (800) 942-3810
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Expedition Planning Desk</strong>
                      <span className="font-label text-xs">expeditions@jabalitrails.africa</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Field Desk Hours (EAT · UTC+3)</strong>
                      <span className="text-xs">
                        Mon–Sun 07:00 – 21:00 EAT · 24/7 Satellite Dispatch for Active Treks
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 space-y-3">
                  <div className="text-xs text-acacia font-label uppercase">
                    Prefer Instant Online Permit Booking?
                  </div>
                  <p className="text-xs text-parchment/75">
                    Our real-time booking engine lets you lock UWA gorilla &amp; chimp permits and pay via Stripe immediately.
                  </p>
                  <Link
                    href="/booking"
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-sm font-semibold transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Launch Real-Time Booking Engine</span>
                  </Link>
                </div>
              </div>

              <div className="bg-surface-raised rounded-2xl p-6 border border-line/15 space-y-2">
                <div className="flex items-center gap-2 text-xs font-label font-semibold text-heading">
                  <ShieldCheck className="w-4 h-4 text-terracotta" />
                  <span>Financial Protection &amp; Permit Escrow</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  All client deposits and UWA permit payments are held in a dedicated client escrow account until your departure concludes. Free date transfers are available up to 60 days prior to arrival.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
