import React from 'react';
import Link from 'next/link';
import { LEAD_GUIDES } from '@/data/expeditions';
import { withBasePath } from '@/lib/base-path';
import {
  Compass,
  HeartHandshake,
  ShieldCheck,
  Users,
  Binoculars,
  ArrowRight,
  Award,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const metadata = {
  title: 'About Us, Our Ugandan Naturalist Guides & Conservation Ethos',
  description:
    'Learn how Jabali Trails Africa was founded by Ugandan field primatologists and how our 5% Conservation Mandate supports Bwindi and Kibale communities.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-parchment">
      {/* Hero */}
      <section className="relative bg-canopy text-parchment py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src={withBasePath('/images/bwindi-gorilla-closeup.jpg')}
            alt="Mountain gorilla in Bwindi Impenetrable Forest"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canopy via-canopy/85 to-canopy/65" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
              <Compass className="w-3.5 h-3.5" />
              FOUNDED IN BUHOMA &amp; KAMPALA · EAST AFRICAN OWNED
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-tight">
              Rooted in the Forest. Built by the Trackers Who Walk It.
            </h1>
            <p className="text-parchment/85 text-base sm:text-lg leading-relaxed">
              Jabali—Swahili for &ldquo;strong as a rock&rdquo;—was founded by veteran Ugandan primatologists, ornithologists, and conservation logisticians with a singular conviction: East Africa’s most extraordinary wildlife encounters belong in small, unhurried groups led by local experts.
            </p>
          </div>
        </div>
      </section>

      {/* Story & Values */}
      <section className="py-16 sm:py-24 bg-parchment bg-topographic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="font-mono-tech text-xs uppercase tracking-widest text-terracotta font-semibold">
                Our Origin Story
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-canopy">
                From UWA Ranger Outposts to Bespoke Field Expeditions
              </h2>
              <p className="text-bark-muted text-base leading-relaxed">
                For decades, travelers visiting Uganda booked through overseas brokers three layers removed from the actual trailheads of Bwindi, Kibale, and Kidepo. Too often, that meant mismatched gorilla permits requiring three-hour pre-dawn drives on muddy mountain roads, overcrowded vehicles, and little connection to the communities protecting the forest edge.
              </p>
              <p className="text-bark-muted text-base leading-relaxed">
                In 2015, former Uganda Wildlife Authority tracker Moses Tumusiime and Makerere University conservation biologist Grace Namatovu launched Jabali Trails Africa. By combining direct UWA permit desk allocation in Kampala with a privately owned fleet of custom 4x4 Land Cruisers and deep relationships with eco-sanctuaries across the Albertine Rift, we eliminated every middleman.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-parchment-light border border-canopy/12">
                  <div className="font-mono-tech text-2xl sm:text-3xl font-bold text-canopy">11+</div>
                  <div className="text-xs text-bark-muted mt-1">Seasons Operating Across Uganda</div>
                </div>
                <div className="p-4 rounded-2xl bg-parchment-light border border-canopy/12">
                  <div className="font-mono-tech text-2xl sm:text-3xl font-bold text-terracotta">100%</div>
                  <div className="text-xs text-bark-muted mt-1">Ugandan &amp; East African Guide Team</div>
                </div>
                <div className="p-4 rounded-2xl bg-parchment-light border border-canopy/12">
                  <div className="font-mono-tech text-2xl sm:text-3xl font-bold text-canopy">$184K</div>
                  <div className="text-xs text-bark-muted mt-1">Direct Community Grants Since 2021</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src={withBasePath('/images/bwindi-gorilla-rest.jpg')}
                  alt="Mountain gorilla resting in Bwindi"
                  className="rounded-2xl h-64 w-full object-cover shadow-card"
                />
                <img
                  src={withBasePath('/images/kazinga-elephants.jpg')}
                  alt="Elephants on the Kazinga Channel"
                  className="rounded-2xl h-56 w-full object-cover shadow-card"
                />
              </div>
              <div className="space-y-4 pt-6">
                <img
                  src={withBasePath('/images/safari-land-cruiser.jpg')}
                  alt="Jabali 4x4 Safari Land Cruiser"
                  className="rounded-2xl h-56 w-full object-cover shadow-card"
                />
                <img
                  src={withBasePath('/images/luxury-lodge.jpg')}
                  alt="Eco lodge overlooking wildlife"
                  className="rounded-2xl h-64 w-full object-cover shadow-card"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Lead Guides */}
      <section className="py-16 sm:py-24 bg-parchment-light border-y border-canopy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl">
            <span className="font-mono-tech text-xs uppercase tracking-widest text-terracotta font-semibold">
              Field Leadership
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-canopy mt-2">
              Meet Your Lead Field Naturalists
            </h2>
            <p className="text-bark-muted text-base mt-3">
              Every Jabali guide holds Uganda Wildlife Authority certification, wilderness first-responder training, and specialist credentials in primatology or East African ornithology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {LEAD_GUIDES.map((guide) => (
              <div
                key={guide.name}
                className="bg-parchment rounded-2xl border border-canopy/15 overflow-hidden shadow-card flex flex-col"
              >
                <div className="h-64 relative bg-canopy">
                  <img
                    src={guide.image}
                    alt={guide.role}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-canopy/85 backdrop-blur-md text-xs font-mono-tech text-acacia flex items-center justify-between">
                    <span>{guide.homeRegion}</span>
                    <span>{guide.experienceYears} Yrs</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-serif text-2xl font-semibold text-canopy capitalize">
                      {guide.name.replace('-', ' ')}
                    </h3>
                    <div className="text-xs font-mono-tech text-terracotta font-semibold">
                      {guide.role}
                    </div>
                    <p className="text-sm text-bark-muted leading-relaxed">{guide.bio}</p>

                    <div className="pt-2">
                      <div className="text-[11px] font-mono-tech uppercase text-bark-subtle mb-1.5">
                        Specialties
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {guide.specialties.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-parchment-dark text-canopy text-xs font-mono-tech"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-bark-muted font-mono-tech pt-1">
                      Languages: <strong className="text-canopy">{guide.languages.join(', ')}</strong>
                    </div>
                  </div>

                  <blockquote className="p-3.5 rounded-xl bg-parchment-light border-l-2 border-terracotta text-xs italic text-bark">
                    &ldquo;{guide.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conservation & Impact Section */}
      <section id="conservation" className="py-16 sm:py-24 bg-canopy-topographic text-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="font-mono-tech text-xs uppercase tracking-widest text-acacia">
              2026 Conservation &amp; Community Ledger
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold">
              Where Every Expedition Dollar Goes
            </h2>
            <p className="text-parchment/80 text-base leading-relaxed">
              True conservation only succeeds when the communities living alongside Bwindi, Kibale, and Kidepo thrive directly from wildlife protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-acacia/20 text-acacia flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-white">
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
              <h3 className="font-serif text-xl font-semibold text-white">
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
              <h3 className="font-serif text-xl font-semibold text-white">
                3. Kibale Snare Removal Patrols
              </h3>
              <p className="text-sm text-parchment/75 leading-relaxed">
                Each Primate Kingdom booking funds 3 days of community ranger anti-snare patrols inside the Kibale Forest corridor, protecting chimpanzees and forest elephants.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm transition-all"
            >
              <span>Book a Conservation-Led Expedition</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/expeditions"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-parchment font-semibold text-sm transition-all"
            >
              <span>Browse Sample Itineraries</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
