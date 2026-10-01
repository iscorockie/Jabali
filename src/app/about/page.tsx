'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { EXPEDITIONS, LEAD_GUIDES } from '@/data/expeditions';
import { submitInquiryUniversal } from '@/lib/client-booking-engine';
import {
  Compass,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  Award,
  Calculator,
  MessageSquare,
  CheckSquare,
  Square,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const PACKING_ITEMS = [
  { id: 'boots', category: 'Footwear', label: 'Broken-in waterproof hiking boots with ankle support (Bwindi steep ridges)' },
  { id: 'gaiters', category: 'Trail Gear', label: 'Breathable knee-high trail gaiters (protects against safari ants & mud)' },
  { id: 'gloves', category: 'Trail Gear', label: 'Lightweight gardening/trekking gloves (for gripping vines on descents)' },
  { id: 'rainjacket', category: 'Apparel', label: 'Gore-Tex or seam-sealed rain shell (Equatorial mist showers occur year-round)' },
  { id: 'neutral', category: 'Apparel', label: 'Long-sleeved olive, khaki, or tan shirts (avoid bright white or blue for tsetse flies)' },
  { id: 'drybag', category: 'Optics', label: 'Waterproof dry-bag or rain sleeve for telephoto lenses & 8x42 binoculars' },
  { id: 'yellowfever', category: 'Medical', label: 'Official Yellow Fever Vaccination Certificate (required at Entebbe Airport)' },
  { id: 'insect', category: 'Medical', label: 'DEET / Picaridin tropical insect repellent & personal malaria prophylaxis' },
];

export default function AboutPage() {
  // 1. Guide Filter & Direct Q&A Modal State
  const [guideSpecialtyFilter, setGuideSpecialtyFilter] = useState<string>('all');
  const [activeGuideForModal, setActiveGuideForModal] = useState<string | null>(null);
  const [qaName, setQaName] = useState('');
  const [qaEmail, setQaEmail] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaSubmitting, setQaSubmitting] = useState(false);
  const [qaConfirmation, setQaConfirmation] = useState<string | null>(null);

  // 2. Interactive 5% Conservation Impact Calculator State
  const [calcExpId, setCalcExpId] = useState<string>(EXPEDITIONS[0].id);
  const [calcGuests, setCalcGuests] = useState<number>(2);
  const [calcLuxury, setCalcLuxury] = useState<boolean>(false);

  // 3. Interactive Packing Checklist State
  const [checkedGear, setCheckedGear] = useState<string[]>([
    'boots',
    'gaiters',
    'yellowfever',
  ]);

  const toggleGear = (id: string) => {
    setCheckedGear((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedCalcExp = useMemo(
    () => EXPEDITIONS.find((e) => e.id === calcExpId) || EXPEDITIONS[0],
    [calcExpId]
  );

  const impactMetrics = useMemo(() => {
    const basePerGuest =
      selectedCalcExp.basePriceUsd +
      (calcLuxury ? selectedCalcExp.luxuryLodgeUpgradePerPersonUsd : 0);
    const totalLandPackage = basePerGuest * calcGuests;
    const totalPermits =
      (selectedCalcExp.gorillaPermitUsd + selectedCalcExp.chimpPermitUsd) *
      calcGuests;
    const fivePercentFund = Math.round(totalLandPackage * 0.05);
    const uwaCommunityShare = Math.round(totalPermits * 0.2); // UWA statutory 20% park entry/permit revenue share
    const gorillaDoctorsGrant = calcGuests * 50;
    const totalConservationImpact =
      fivePercentFund + uwaCommunityShare + gorillaDoctorsGrant;
    const rangerPatrolDays = Math.max(2, Math.round(fivePercentFund / 45));
    const indigenousTrees = Math.round(fivePercentFund / 8);

    return {
      totalLandPackage,
      totalPermits,
      fivePercentFund,
      uwaCommunityShare,
      gorillaDoctorsGrant,
      totalConservationImpact,
      rangerPatrolDays,
      indigenousTrees,
    };
  }, [selectedCalcExp, calcGuests, calcLuxury]);

  const filteredGuides = useMemo(() => {
    if (guideSpecialtyFilter === 'all') return LEAD_GUIDES;
    return LEAD_GUIDES.filter((g) =>
      g.specialties
        .join(' ')
        .toLowerCase()
        .includes(guideSpecialtyFilter.toLowerCase())
    );
  }, [guideSpecialtyFilter]);

  const handleSendGuideQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaName || !qaEmail || !qaQuestion) return;
    setQaSubmitting(true);
    try {
      const res = await submitInquiryUniversal({
        fullName: qaName,
        email: qaEmail,
        phone: 'Guide Q&A Dispatch',
        preferredMonth: '2026-11',
        durationDays: 'Custom Guide Consultation',
        guests: 2,
        budgetPerPerson: 'Direct Field Question',
        interests: [`Guide Question for ${activeGuideForModal}`],
        message: qaQuestion,
      });
      setQaConfirmation(res.inquiryReference);
    } finally {
      setQaSubmitting(false);
    }
  };

  const readinessPercent = Math.round(
    (checkedGear.length / PACKING_ITEMS.length) * 100
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative bg-canopy text-parchment py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="/images/bwindi-gorilla-closeup.jpg"
            alt="Mountain gorilla in Bwindi Impenetrable Forest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canopy via-canopy/85 to-canopy/65" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-label text-xs">
              <Compass className="w-3.5 h-3.5" />
              FOUNDED IN BUHOMA &amp; KAMPALA · EAST AFRICAN OWNED
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-tight">
              Rooted in the Forest. Built by the Trackers Who Walk It.
            </h1>
            <p className="text-parchment/85 text-base sm:text-lg leading-relaxed">
              Jabali—Swahili for &ldquo;strong as a rock&rdquo;—was founded by veteran Ugandan primatologists, ornithologists, and conservation logisticians with a singular conviction: East Africa’s most extraordinary wildlife encounters belong in small, unhurried groups led by local experts.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Values */}
      <section className="py-16 sm:py-24 bg-surface bg-topographic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="font-label text-xs uppercase tracking-widest text-terracotta font-semibold">
                Our Origin Story
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-heading">
                From UWA Ranger Outposts to Bespoke Field Expeditions
              </h2>
              <p className="text-ink-muted text-base leading-relaxed">
                For decades, travelers visiting Uganda booked through overseas brokers three layers removed from the actual trailheads of Bwindi, Kibale, and Kidepo. Too often, that meant mismatched gorilla permits requiring three-hour pre-dawn drives on muddy mountain roads, overcrowded vehicles, and little connection to the communities protecting the forest edge.
              </p>
              <p className="text-ink-muted text-base leading-relaxed">
                In 2015, former Uganda Wildlife Authority tracker Moses Tumusiime and Makerere University conservation biologist Grace Namatovu launched Jabali Trails Africa. By combining direct UWA permit desk allocation in Kampala with a privately owned fleet of custom 4x4 Land Cruisers and deep relationships with eco-sanctuaries across the Albertine Rift, we eliminated every middleman.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-surface-raised border border-line/12">
                  <div className="font-label text-2xl sm:text-3xl font-bold text-heading">
                    11+
                  </div>
                  <div className="text-xs text-ink-muted mt-1">
                    Seasons Operating Across Uganda
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-raised border border-line/12">
                  <div className="font-label text-2xl sm:text-3xl font-bold text-terracotta">
                    100%
                  </div>
                  <div className="text-xs text-ink-muted mt-1">
                    Ugandan &amp; East African Guide Team
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-raised border border-line/12">
                  <div className="font-label text-2xl sm:text-3xl font-bold text-heading">
                    $184K
                  </div>
                  <div className="text-xs text-ink-muted mt-1">
                    Direct Community Grants Since 2021
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="/images/bwindi-gorilla-rest.jpg"
                  alt="Mountain gorilla resting in Bwindi"
                  className="rounded-2xl h-64 w-full object-cover shadow-card"
                />
                <img
                  src="/images/kazinga-elephants.jpg"
                  alt="Elephants on the Kazinga Channel"
                  className="rounded-2xl h-56 w-full object-cover shadow-card"
                />
              </div>
              <div className="space-y-4 pt-6">
                <img
                  src="/images/safari-land-cruiser.jpg"
                  alt="Jabali 4x4 Safari Land Cruiser"
                  className="rounded-2xl h-56 w-full object-cover shadow-card"
                />
                <img
                  src="/images/luxury-lodge.jpg"
                  alt="Eco lodge overlooking wildlife"
                  className="rounded-2xl h-64 w-full object-cover shadow-card"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Lead Guides with Interactive Specialty Filter & Direct Q&A */}
      <section className="py-16 sm:py-24 bg-surface-raised border-y border-line/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="font-label text-xs uppercase tracking-widest text-terracotta font-semibold">
                Field Leadership
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-semibold text-heading mt-2">
                Meet Your Lead Field Naturalists
              </h2>
              <p className="text-ink-muted text-base mt-3">
                Filter our lead naturalist roster by field specialty or send a direct question to any guide via our Kampala radio &amp; operations desk.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Naturalists (3)' },
                { id: 'gorilla', label: 'Gorilla & Primate Trackers' },
                { id: 'bird', label: 'Ornithology & Rift Specialists' },
                { id: 'walking', label: 'Kidepo & Big Cat Trackers' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGuideSpecialtyFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    guideSpecialtyFilter === tab.id
                      ? 'bg-canopy text-parchment'
                      : 'bg-surface text-ink hover:bg-surface-sunk'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide) => {
              const displayName = guide.name.replace('-', ' ');
              return (
                <div
                  key={guide.name}
                  className="bg-surface rounded-2xl border border-line/15 overflow-hidden shadow-card flex flex-col"
                >
                  <div className="h-64 relative bg-canopy">
                    <img
                      src={guide.image}
                      alt={guide.role}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-canopy/85 backdrop-blur-md text-xs font-label text-acacia flex items-center justify-between">
                      <span>{guide.homeRegion}</span>
                      <span>{guide.experienceYears} Yrs</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-display text-2xl font-semibold text-heading capitalize">
                        {displayName}
                      </h3>
                      <div className="text-xs font-label text-terracotta font-semibold">
                        {guide.role}
                      </div>
                      <p className="text-sm text-ink-muted leading-relaxed">
                        {guide.bio}
                      </p>

                      <div className="pt-2">
                        <div className="text-[11px] font-label uppercase text-ink-subtle mb-1.5">
                          Specialties
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {guide.specialties.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-md bg-surface-sunk text-heading text-xs font-label"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-ink-muted font-label pt-1">
                        Languages:{' '}
                        <strong className="text-heading">
                          {guide.languages.join(', ')}
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <blockquote className="p-3.5 rounded-xl bg-surface-raised border-l-2 border-terracotta text-xs italic text-ink">
                        &ldquo;{guide.quote}&rdquo;
                      </blockquote>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveGuideForModal(displayName);
                          setQaConfirmation(null);
                          setQaQuestion('');
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-canopy hover:bg-canopy-moss text-parchment text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-acacia" />
                        <span className="capitalize">
                          Message {displayName.split(' ')[0]} Directly
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive 5% Conservation & Community Impact Calculator */}
      <section
        id="conservation"
        className="py-16 sm:py-24 bg-canopy-topographic text-parchment"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="font-label text-xs uppercase tracking-widest text-acacia flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>Interactive 2026 Conservation &amp; Community Ledger</span>
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold">
              Calculate Your Exact Conservation Impact
            </h2>
            <p className="text-parchment/80 text-base leading-relaxed">
              Select an expedition and party size below to see how your booking directly funds UWA park communities, Gorilla Doctors veterinary interventions, and anti-snare ranger patrols.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-10">
            {/* Controls */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <label className="block text-xs font-label uppercase text-acacia mb-1.5">
                  1. Select Expedition Itinerary
                </label>
                <select
                  value={calcExpId}
                  onChange={(e) => setCalcExpId(e.target.value)}
                  className="w-full rounded-xl bg-canopy border border-white/20 px-3.5 py-3 text-xs sm:text-sm font-semibold text-white"
                >
                  {EXPEDITIONS.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} ({exp.durationDays} Days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-label uppercase text-acacia mb-1.5">
                  2. Number of Travelers: <strong>{calcGuests} Guests</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={calcGuests}
                  onChange={(e) => setCalcGuests(Number(e.target.value))}
                  className="w-full accent-terracotta cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-label text-parchment/60 mt-1">
                  <span>1 Solo</span>
                  <span>2 Couple</span>
                  <span>4 Family</span>
                  <span>6 Full Group</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs text-parchment/90">
                  Include Premier Luxury Eco-Sanctuary Tier?
                </span>
                <button
                  type="button"
                  onClick={() => setCalcLuxury(!calcLuxury)}
                  className={`px-3 py-1 rounded-lg font-label text-xs font-semibold transition-all ${
                    calcLuxury
                      ? 'bg-acacia text-canopy'
                      : 'bg-white/10 text-parchment/75'
                  }`}
                >
                  {calcLuxury ? 'Included (+5% Grant)' : 'Standard Eco-Lodge'}
                </button>
              </div>
            </div>

            {/* Live Breakdown */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-canopy/90 border border-acacia/30 space-y-1">
                <span className="text-[11px] font-label uppercase text-acacia">
                  Jabali 5% Community Mandate
                </span>
                <div className="font-label text-3xl font-bold text-white">
                  ${impactMetrics.fivePercentFund.toLocaleString()} USD
                </div>
                <p className="text-xs text-parchment/75">
                  Transferred directly to Buhoma, Nkuringo &amp; Bigodi village cooperatives.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-canopy/90 border border-white/15 space-y-1">
                <span className="text-[11px] font-label uppercase text-emerald-400">
                  UWA 20% Statutory Revenue Share
                </span>
                <div className="font-label text-3xl font-bold text-white">
                  ${impactMetrics.uwaCommunityShare.toLocaleString()} USD
                </div>
                <p className="text-xs text-parchment/75">
                  Allocated from your official UWA permits to frontline parish councils.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-canopy/90 border border-white/15 space-y-1">
                <span className="text-[11px] font-label uppercase text-acacia">
                  Gorilla Doctors + Anti-Snare Patrols
                </span>
                <div className="font-label text-2xl font-bold text-white">
                  ${impactMetrics.gorillaDoctorsGrant} USD + {impactMetrics.rangerPatrolDays} Patrol Days
                </div>
                <p className="text-xs text-parchment/75">
                  Funds field veterinary care &amp; {impactMetrics.indigenousTrees} native tree saplings.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-terracotta/95 text-white space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-label uppercase text-white/85">
                    Total Verified Conservation Impact
                  </span>
                  <div className="font-label text-3xl font-bold">
                    ${impactMetrics.totalConservationImpact.toLocaleString()} USD
                  </div>
                </div>
                <Link
                  href={`/booking?expedition=${encodeURIComponent(
                    selectedCalcExp.id
                  )}&guests=${calcGuests}`}
                  className="inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-canopy text-acacia font-label text-xs font-semibold"
                >
                  <span>Book &amp; Lock This Grant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-acacia/20 text-acacia flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">
                1. Gorilla Doctors &amp; Veterinary Care
              </h3>
              <p className="text-sm text-parchment/75 leading-relaxed">
                We contribute $50 per gorilla trekker directly to Gorilla Doctors, the field veterinary team providing life-saving medical interventions to injured mountain gorillas across Bwindi and the Virunga Massif.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-acacia/20 text-acacia flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">
                2. Ride 4 a Woman &amp; Batwa Livelihoods
              </h3>
              <p className="text-sm text-parchment/75 leading-relaxed">
                In Buhoma and Nkuringo, we partner with women’s weaving and clean-water cooperatives and employ Batwa cultural interpreters at fair-trade professional day rates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-acacia/20 text-acacia flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">
                3. Kibale Snare Removal Patrols
              </h3>
              <p className="text-sm text-parchment/75 leading-relaxed">
                Each Primate Kingdom booking funds community ranger anti-snare patrols inside the Kibale Forest corridor, protecting chimpanzees and forest elephants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Bwindi & Equatorial Trekking Gear Readiness Checklist */}
      <section className="py-16 sm:py-24 bg-surface bg-topographic">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-label text-xs uppercase tracking-widest text-terracotta font-semibold">
                Interactive Field Preparation
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-heading mt-1">
                Bwindi &amp; Albertine Rift Gear Readiness Checklist
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Check off your essential equatorial rainforest gear before landing at Entebbe International Airport (EBB).
              </p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-canopy text-parchment font-label text-xs shrink-0">
              Field Readiness: <strong className="text-acacia">{readinessPercent}%</strong> ({checkedGear.length}/{PACKING_ITEMS.length} Packed)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PACKING_ITEMS.map((item) => {
              const isChecked = checkedGear.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleGear(item.id)}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                    isChecked
                      ? 'bg-pos-soft/90 border-pos/30 text-heading'
                      : 'bg-surface-raised border-line/15 text-ink hover:border-line/40'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-pos shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-ink-muted shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-[10px] font-label uppercase text-terracotta block">
                      {item.category}
                    </span>
                    <span className="text-xs sm:text-sm font-medium leading-snug">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Direct Guide Question Modal */}
      {activeGuideForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-raised rounded-3xl border border-line/20 max-w-lg w-full shadow-elevated overflow-hidden">
            <div className="bg-canopy text-parchment px-6 py-5 flex items-center justify-between">
              <div>
                <span className="font-label text-xs text-acacia uppercase">
                  Kampala &amp; Bwindi Radio Dispatch
                </span>
                <h3 className="font-display text-2xl font-semibold capitalize">
                  Ask {activeGuideForModal} a Question
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuideForModal(null)}
                className="p-1.5 rounded-lg text-parchment/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {qaConfirmation ? (
                <div className="space-y-4 text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-pos mx-auto" />
                  <h4 className="font-display text-2xl text-heading">
                    Field Message Logged ({qaConfirmation})
                  </h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Your question for <strong className="capitalize">{activeGuideForModal}</strong> has been logged in our Kampala server ledger (<code>/api/inquiries</code>). Expect a personal response within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveGuideForModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-canopy text-parchment text-xs font-semibold"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendGuideQuestion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={qaName}
                      onChange={(e) => setQaName(e.target.value)}
                      placeholder="Dr. Elena Vance"
                      className="w-full rounded-xl bg-field border border-line/20 px-3.5 py-2.5 text-xs text-heading"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={qaEmail}
                      onChange={(e) => setQaEmail(e.target.value)}
                      placeholder="elena@example.com"
                      className="w-full rounded-xl bg-field border border-line/20 px-3.5 py-2.5 text-xs text-heading"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                      Question for <span className="capitalize">{activeGuideForModal}</span> *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={qaQuestion}
                      onChange={(e) => setQaQuestion(e.target.value)}
                      placeholder="Ask about Bwindi trail steepness, gorilla photography lenses, or birding checklists..."
                      className="w-full rounded-xl bg-field border border-line/20 p-3.5 text-xs text-heading"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={qaSubmitting}
                    className="w-full py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {qaSubmitting ? 'Dispatching to Field Desk...' : 'Send Question to Guide'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
