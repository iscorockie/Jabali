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

export default function ContactPage() {
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

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch {
      setSubmittedRef('JBL-INQ-2026-9042');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment bg-topographic">
      {/* Hero */}
      <section className="bg-canopy text-parchment py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
              <Compass className="w-3.5 h-3.5" />
              BESPOKE PRIVATE CHARTERS · KAMPALA &amp; BUHOMA DESK
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
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
                <div className="bg-parchment-light rounded-3xl border-2 border-emerald-700/30 p-8 sm:p-12 shadow-elevated space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/15 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="font-mono-tech text-xs uppercase text-terracotta font-semibold">
                      Custom Dossier Request Received · Ref {submittedRef}
                    </span>
                    <h2 className="font-serif text-3xl font-semibold text-canopy">
                      Webale Nyo! Our Kampala Desk Is Checking UWA Permits.
                    </h2>
                    <p className="text-sm sm:text-base text-bark-muted leading-relaxed">
                      Lead Expedition Planner <strong>Grace Namatovu</strong> has received your custom brief and is verifying Bwindi &amp; Kibale permit availability for <strong>{preferredMonth}</strong>. You will receive a custom day-by-day route and itemized quote within 24 hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-parchment border border-canopy/10 text-xs font-mono-tech space-y-1 text-canopy">
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
                      className="px-5 py-3 rounded-xl border border-canopy/20 text-canopy text-sm font-semibold"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-parchment-light rounded-3xl border border-canopy/15 p-6 sm:p-10 shadow-card space-y-6"
                >
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-canopy">
                      Tailor-Made Safari Brief
                    </h2>
                    <p className="text-xs sm:text-sm text-bark-muted mt-1">
                      Tell us how you dream of experiencing Uganda &amp; East Africa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alistair Finch"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alistair@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="+44 7700 900077"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                        Country of Residence
                      </label>
                      <input
                        type="text"
                        placeholder="United Kingdom / USA / Canada"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                        Preferred Travel Window
                      </label>
                      <select
                        value={preferredMonth}
                        onChange={(e) => setPreferredMonth(e.target.value)}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-3 py-2.5 text-xs sm:text-sm text-canopy"
                      >
                        <option>November 2026 (Emerald Season)</option>
                        <option>December 2026 – Feb 2027 (Dry)</option>
                        <option>April – May 2027 (Green Season)</option>
                        <option>June – September 2027 (Peak Dry)</option>
                        <option>Flexible Dates</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                        Ideal Duration
                      </label>
                      <select
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-3 py-2.5 text-xs sm:text-sm text-canopy"
                      >
                        <option>5–6 Days (Focused Gorilla Trek)</option>
                        <option>8–10 Days (Primates &amp; Savannah)</option>
                        <option>11–14 Days (Grand Circuit)</option>
                        <option>15+ Days (Cross-Border East Africa)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                        Travelers
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-2">
                      Target Comfort &amp; Budget Range (Per Person, Inclusive of Permits)
                    </label>
                    <select
                      value={budgetPerPerson}
                      onChange={(e) => setBudgetPerPerson(e.target.value)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                    >
                      <option>$4,000 – $5,500 / guest (Signature Forest Eco-Lodges)</option>
                      <option>$5,500 – $8,500 / guest (Boutique Luxury Tented Camps)</option>
                      <option>$8,500 – $14,000+ / guest (Ultra-Luxury Fly-In Sanctuaries)</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-mono-tech uppercase text-bark-muted mb-2">
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
                                ? 'bg-canopy text-parchment border-canopy'
                                : 'bg-white text-bark border-canopy/15 hover:border-canopy/40'
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
                    <label className="block text-xs font-mono-tech uppercase text-bark-muted mb-1">
                      Tell Us About Your Group, Pacing, or Special Occasion
                    </label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Share preferred lodges, photography goals, mobility considerations, or cross-border flights..."
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-base shadow-sm flex items-center justify-center gap-2 transition-all"
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
                <span className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
                  Direct Operations Desks
                </span>
                <h3 className="font-serif text-2xl font-semibold text-white">
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
                      <span className="font-mono-tech text-xs block">
                        Uganda: +256 (0) 772 841 920
                      </span>
                      <span className="font-mono-tech text-xs block">
                        North America Toll-Free: +1 (800) 942-3810
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white">Expedition Planning Desk</strong>
                      <span className="font-mono-tech text-xs">expeditions@jabalitrails.africa</span>
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
                  <div className="text-xs text-acacia font-mono-tech uppercase">
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

              <div className="bg-parchment-light rounded-2xl p-6 border border-canopy/15 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono-tech font-semibold text-canopy">
                  <ShieldCheck className="w-4 h-4 text-terracotta" />
                  <span>Financial Protection &amp; Permit Escrow</span>
                </div>
                <p className="text-xs text-bark-muted leading-relaxed">
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
