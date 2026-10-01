import React from 'react';
import Link from 'next/link';
import { EXPEDITIONS, DESTINATIONS, TESTIMONIALS, LEAD_GUIDES } from '@/data/expeditions';
import { withBasePath } from '@/lib/base-path';
import ExpeditionCard from '@/components/ExpeditionCard';
import HeroQuickBookingBar from '@/components/HeroQuickBookingBar';
import InteractiveUgandaMap from '@/components/InteractiveUgandaMap';
import {
  Compass,
  ShieldCheck,
  Users,
  Binoculars,
  HeartHandshake,
  ArrowRight,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

export default function HomePage() {
  const featuredExpeditions = EXPEDITIONS.filter((e) => e.featured);

  return (
    <div className="space-y-0">
      {/* =====================================================================
          1. HERO SECTION — BWINDI EQUATORIAL FIELD EDITORIAL
         ===================================================================== */}
      <section className="relative min-h-[88vh] flex flex-col justify-between bg-canopy text-parchment overflow-hidden">
        {/* Background Image + Multi-Stop Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={withBasePath('/images/bwindi-silverback.jpg')}
            alt="Silverback Mountain Gorilla in Bwindi Impenetrable National Park, Uganda"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(17,34,24,0.48) 0%, rgba(17,34,24,0.68) 55%, rgba(17,34,24,0.96) 100%)',
            }}
          />
        </div>

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12">
          <div className="max-w-3xl space-y-6">
            {/* Field Telemetry Pill */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-acacia/40 text-xs font-mono-tech text-acacia">
              <Compass className="w-3.5 h-3.5" />
              <span>01°02&apos;S 29°41&apos;E · BWINDI IMPENETRABLE FOREST &amp; GREAT RIFT</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[64px] font-semibold tracking-tight text-parchment leading-[1.06]">
              Where the Equatorial Mist Parts for the Wild.
            </h1>

            <p className="text-base sm:text-xl text-parchment/90 leading-relaxed max-w-2xl font-normal">
              Jabali Trails Africa crafts intimate, conservation-driven expeditions across Uganda and East Africa. Track mountain gorillas in Bwindi, follow wild chimpanzees through Kibale’s ironwood canopy, and walk the untamed frontiers of Kidepo Valley with Uganda’s finest field naturalists.
            </p>

            {/* Primary Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-base shadow-elevated transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span>Check Permits &amp; Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/expeditions"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-parchment font-semibold text-base transition-all"
              >
                <span>Explore 2026/2027 Expeditions</span>
              </Link>
            </div>
          </div>

          {/* Quick Booking Bar */}
          <div className="mt-12 sm:mt-16">
            <HeroQuickBookingBar />
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. AUTHORITY & FIELD CREDENTIALS BAR
         ===================================================================== */}
      <section className="bg-canopy-moss text-parchment border-y border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <FileCheck2 className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
              <div>
                <div className="font-mono-tech text-xs uppercase tracking-wider text-acacia">
                  Direct UWA Permit Desk
                </div>
                <p className="text-xs text-parchment/80 mt-0.5">
                  Real-time sector-matched Bwindi ($800) &amp; Kibale ($250) permits
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
              <div>
                <div className="font-mono-tech text-xs uppercase tracking-wider text-acacia">
                  Intimate Small Groups
                </div>
                <p className="text-xs text-parchment/80 mt-0.5">
                  Capped at 6 guests per custom 4x4 Land Cruiser—or 100% private charter
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Binoculars className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
              <div>
                <div className="font-mono-tech text-xs uppercase tracking-wider text-acacia">
                  Primatologist Led
                </div>
                <p className="text-xs text-parchment/80 mt-0.5">
                  12+ years average tracking experience across Uganda’s 10 national parks
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-acacia shrink-0 mt-0.5" />
              <div>
                <div className="font-mono-tech text-xs uppercase tracking-wider text-acacia">
                  5% Conservation Mandate
                </div>
                <p className="text-xs text-parchment/80 mt-0.5">
                  Direct funding to Gorilla Doctors, snare removal &amp; Buhoma women’s co-ops
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FEATURED EXPEDITIONS
         ===================================================================== */}
      <section className="py-20 sm:py-24 bg-parchment bg-topographic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-terracotta font-semibold">
                Curated Field Itineraries · 2026 / 2027 Season
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-canopy mt-2 tracking-tight">
                Signature Guided Expeditions
              </h2>
              <p className="text-bark-muted text-base sm:text-lg mt-3 max-w-2xl">
                Every itinerary pairs handpicked forest and savannah sanctuaries with transparent UWA permit allocation and instant online booking via Stripe.
              </p>
            </div>
            <Link
              href="/expeditions"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-canopy/20 hover:bg-canopy hover:text-parchment text-canopy font-semibold text-sm transition-all self-start md:self-auto"
            >
              <span>View All 6 Expeditions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredExpeditions.map((exp) => (
              <ExpeditionCard key={exp.id} expedition={exp} />
            ))}
          </div>

          {/* Transparent Permit Explainer Callout */}
          <div className="mt-12 rounded-2xl bg-parchment-light border border-acacia/40 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-wider text-acacia-dark">
                  <ShieldCheck className="w-4 h-4 text-terracotta" />
                  <span>How Uganda Wildlife Authority (UWA) Permits Work</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-canopy">
                  Why We Itemize Gorilla ($800) &amp; Chimpanzee ($250) Permits Separately
                </h3>
                <p className="text-sm text-bark-muted leading-relaxed">
                  Mountain gorilla permits are strictly regulated by the Uganda Wildlife Authority (capped at 8 visitors per habituated family per day). Unlike operators who hide permit markups inside opaque package rates, Jabali Trails passes 100% of the official UWA permit fee straight through at face value ($800 Foreign Non-Resident / $700 Foreign Resident / $80 EAC Citizen) and locks your exact trekking sector (Buhoma, Ruhija, Rushaga, or Nkuringo) to match your lodge.
                </p>
              </div>
              <div className="lg:col-span-4 flex lg:justify-end">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-canopy hover:bg-canopy-moss text-parchment text-sm font-semibold transition-all"
                >
                  <span>Check Live Permit Calendar</span>
                  <ArrowRight className="w-4 h-4 text-acacia" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. WHY JABALI TRAILS ("THE FIELD STANDARD")
         ===================================================================== */}
      <section className="py-20 sm:py-24 bg-canopy-topographic text-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Editorial Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-acacia">
                The Jabali Field Standard
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight">
                Crafted by Ugandan Naturalists Who Know Every Ridge by Name.
              </h2>
              <p className="text-parchment/80 text-base leading-relaxed">
                Whether you are crouching quietly in the emerald undergrowth of Bwindi as a silverback passes three meters away, or tracking lions on foot across Kidepo’s dry sand rivers, the quality of your guide defines every moment in the field.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-acacia/20 text-acacia flex items-center justify-center shrink-0 font-mono-tech text-sm font-bold">
                    01
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-parchment">
                      Sector-Matched Lodges &amp; Permits (Zero Pre-Dawn Road Marathons)
                    </h3>
                    <p className="text-xs sm:text-sm text-parchment/75 mt-1 leading-relaxed">
                      Bwindi has four trekking sectors separated by hours of mountain roads. We guarantee your lodge is located at the exact trailhead of your UWA permit sector.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-acacia/20 text-acacia flex items-center justify-center shrink-0 font-mono-tech text-sm font-bold">
                    02
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-parchment">
                      Custom Extended 4x4 Land Cruisers &amp; Swarovski Optics
                    </h3>
                    <p className="text-xs sm:text-sm text-parchment/75 mt-1 leading-relaxed">
                      Every vehicle is a custom-fitted Toyota Land Cruiser 70-Series with pop-up roof hatches, dual-battery inverter ports at every seat, cold-storage drawer, and shared Swarovski binoculars.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-acacia/20 text-acacia flex items-center justify-center shrink-0 font-mono-tech text-sm font-bold">
                    03
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-parchment">
                      100% Community Porters &amp; Reformed Poacher Trackers
                    </h3>
                    <p className="text-xs sm:text-sm text-parchment/75 mt-1 leading-relaxed">
                      We fund personal trail porters for our guests in Bwindi and Kibale—providing direct household income to families living along the forest boundary.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-acacia hover:bg-acacia-dark text-canopy font-semibold text-sm transition-all"
                >
                  <span>Meet Our Lead Naturalists</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 text-parchment font-semibold text-sm transition-all"
                >
                  <span>Design a Private Charter</span>
                </Link>
              </div>
            </div>

            {/* Right Asymmetric Photo Collage */}
            <div className="lg:col-span-6 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-7 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/15 shadow-elevated h-72 sm:h-80 relative">
                  <img
                    src={withBasePath('/images/bwindi-gorilla-infant.jpg')}
                    alt="Infant mountain gorilla in Bwindi Impenetrable Forest"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-black/65 backdrop-blur-md text-[11px] font-mono-tech text-parchment">
                    RUSHEGURA FAMILY · BUHOMA SECTOR
                  </div>
                </div>
                <div className="rounded-2xl bg-canopy-moss border border-acacia/30 p-5">
                  <div className="font-mono-tech text-2xl sm:text-3xl font-bold text-acacia">
                    98.6%
                  </div>
                  <div className="text-xs text-parchment/80 mt-1">
                    Sighting success rate across all Bwindi gorilla &amp; Kibale chimpanzee treks over 11 seasons.
                  </div>
                </div>
              </div>

              <div className="col-span-5 space-y-4">
                <div className="rounded-2xl bg-terracotta p-5 text-white">
                  <div className="font-mono-tech text-2xl sm:text-3xl font-bold">Max 6</div>
                  <div className="text-xs text-white/90 mt-1">
                    Travelers per vehicle on scheduled departures—every guest gets a window &amp; roof hatch.
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/15 shadow-elevated h-64 sm:h-72 relative">
                  <img
                    src={withBasePath('/images/safari-land-cruiser.jpg')}
                    alt="Jabali custom 4x4 safari Land Cruiser in East Africa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-black/65 backdrop-blur-md text-[11px] font-mono-tech text-parchment">
                    4X4 EXTENDED LAND CRUISER FLEET
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. DESTINATIONS TEASER — UGANDA & EAST AFRICA BIOMES
         ===================================================================== */}
      <section className="py-20 sm:py-24 bg-parchment-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-terracotta font-semibold">
                Albertine Rift to the Serengeti Plains
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-canopy mt-2 tracking-tight">
                Our Core Expedition Territories
              </h2>
              <p className="text-bark-muted text-base sm:text-lg mt-3 max-w-2xl">
                Where West African tropical jungle meets East African savannah. Explore Uganda’s flagship national parks and seamless fly-in extensions to Tanzania and Kenya.
              </p>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-canopy text-parchment hover:bg-canopy-moss font-semibold text-sm transition-all self-start md:self-auto"
            >
              <span>Explore All 6 Destinations</span>
              <ArrowRight className="w-4 h-4 text-acacia" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.slice(0, 6).map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations#${dest.slug}`}
                className="group relative rounded-2xl overflow-hidden h-80 flex flex-col justify-end p-6 bg-canopy shadow-card hover:shadow-elevated transition-all"
              >
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canopy/95 via-canopy/45 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono-tech bg-acacia/25 border border-acacia/40 text-acacia">
                      {dest.country}
                    </span>
                    <span className="font-mono-tech text-[11px] text-parchment/75">
                      {dest.coordinates}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-white group-hover:text-acacia transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-parchment/85 line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {dest.signatureSpecies.slice(0, 2).map((sp, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-white/10 text-parchment"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Interactive Uganda & East Africa Bush Flight Corridor Map */}
          <div className="mt-14">
            <InteractiveUgandaMap />
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. LEAD GUIDES SPOTLIGHT & GUEST FIELD DISPATCHES
         ===================================================================== */}
      <section className="py-20 sm:py-24 bg-parchment border-t border-canopy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Guides Preview */}
          <div>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-terracotta font-semibold">
                Ugandan Primatologists &amp; Trackers
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-canopy mt-2">
                Led by the People Who Call These Forests Home
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {LEAD_GUIDES.map((guide) => (
                <div
                  key={guide.name}
                  className="bg-parchment-light rounded-2xl border border-canopy/12 overflow-hidden shadow-card flex flex-col"
                >
                  <div className="h-56 relative overflow-hidden bg-canopy">
                    <img
                      src={guide.image}
                      alt={guide.role}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canopy/85 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-parchment">
                      <span className="font-mono-tech text-[11px] text-acacia uppercase">
                        {guide.experienceYears} Years in Field · {guide.homeRegion}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-canopy capitalize">
                        {guide.name.replace('-', ' ')}
                      </h3>
                      <p className="text-xs font-mono-tech text-terracotta mt-0.5">{guide.role}</p>
                      <p className="text-sm text-bark-muted mt-3 leading-relaxed">{guide.bio}</p>
                    </div>
                    <blockquote className="p-3.5 rounded-xl bg-parchment-dark/60 border-l-2 border-acacia text-xs italic text-bark">
                      &ldquo;{guide.quote}&rdquo;
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="font-mono-tech text-xs uppercase tracking-[0.2em] text-terracotta font-semibold">
                Verified Guest Dispatches
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-canopy mt-2">
                Notes from the Trailhead
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.id}
                  className="bg-parchment-light rounded-2xl p-6 sm:p-7 border border-canopy/12 shadow-card flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-acacia">
                      {Array.from({ length: item.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-acacia text-acacia" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-bark leading-relaxed italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                  <div className="pt-4 border-t border-canopy/10">
                    <div className="font-serif font-semibold text-canopy">{item.guest}</div>
                    <div className="text-xs text-bark-muted">{item.origin}</div>
                    <div className="text-[11px] font-mono-tech text-terracotta mt-1">
                      {item.expedition} · {item.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. FINAL CONVERSION BANNER
         ===================================================================== */}
      <section className="py-16 sm:py-20 bg-parchment-dark border-t border-canopy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-canopy text-parchment p-8 sm:p-14 shadow-elevated relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  2026 &amp; 2027 UWA Gorilla Permits Now Open
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight">
                  Ready to Lock Your Bwindi Gorilla or Kibale Chimp Permits?
                </h2>
                <p className="text-parchment/80 text-base sm:text-lg max-w-2xl">
                  Use our real-time booking engine to check live sector permit availability, calculate your exact expedition total, and reserve immediately via Stripe Checkout—or place a complimentary 48-hour custom inquiry hold.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-parchment/80 font-mono-tech">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-acacia" />
                    30% Deposit + Permit Option
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-acacia" />
                    Stripe 256-Bit Encrypted Checkout
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-acacia" />
                    Free Date Transfer Up to 60 Days Out
                  </span>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  href="/booking"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-base shadow-sm transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Open Real-Time Booking Engine</span>
                </Link>
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-parchment font-semibold text-base transition-all"
                >
                  <MapPin className="w-5 h-5 text-acacia" />
                  <span>Request Custom Tailor-Made Trip</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
