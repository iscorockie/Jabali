import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldCheck,
  Users,
  Binoculars,
  HeartHandshake,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileCheck2,
  Leaf,
  ChevronDown,
  Ticket,
  ArrowUpRight,
} from 'lucide-react';
import { EXPEDITIONS, DESTINATIONS, LEAD_GUIDES } from '@/data/expeditions';
import { listBookings, getMonthAvailability } from '@/lib/booking-store';
import { withBasePath } from '@/lib/base-path';
import ExpeditionCard from '@/components/ExpeditionCard';
import HeroQuickBookingBar from '@/components/HeroQuickBookingBar';
import InteractiveUgandaMap from '@/components/InteractiveUgandaMap';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import FaqAccordion from '@/components/FaqAccordion';
import Reveal from '@/components/ui/Reveal';
import Stat from '@/components/ui/Stat';
import { formatDateShort } from '@/lib/format';

export const dynamic = 'force-dynamic';

const CREDENTIAL_TICKER = [
  'UTB licensed operator · UTB/TO/2026/0419',
  'AUTO accredited member',
  'Direct UWA e-permit desk (Buhoma · Ruhija · Rushaga · Nkuringo)',
  '1,100+ logged silverback observation hours',
  '98.6% primate sighting success over 11 seasons',
  'AMREF Flying Doctors air-evacuation cover on every departure',
  '5% of land revenue to Gorilla Doctors & snare removal',
  'Stripe-secured checkout · 48-hour complimentary permit holds',
];

export default function HomePage() {
  const featuredExpeditions = EXPEDITIONS.filter((e) => e.featured);
  const activeBookings = listBookings();

  // Live permit telemetry across the whole catalogue for the coming 3 months.
  const today = new Date();
  const windowMonths: { year: number; month: number }[] = [1, 2, 3].map((offset) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + offset, 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  });

  let permitsOpen = 0;
  let openDates = 0;
  let nextOpenDate: string | null = null;
  windowMonths.forEach(({ year, month }) => {
    EXPEDITIONS.forEach((exp) => {
      getMonthAvailability(exp.id, year, month).forEach((day) => {
        if (day.status !== 'past' && day.permitsRemaining > 0) {
          permitsOpen += day.permitsRemaining;
          openDates += 1;
          if (!nextOpenDate || day.date < nextOpenDate) nextOpenDate = day.date;
        }
      });
    });
  });

  const pendingDockets = activeBookings.filter((b) => b.status !== 'cancelled').length;
  const bwindi = EXPEDITIONS[0];

  return (
    <div>
      {/* ══════════════════════════════════════════════════════════════════════
          1 · HERO — Bwindi equatorial field editorial
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-canopy text-parchment grain">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath('/images/bwindi-silverback.jpg')}
            alt="Silverback mountain gorilla in Bwindi Impenetrable National Park, Uganda"
            className="anim-ken h-full w-full object-cover object-center"

            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, rgba(8,17,12,0.94) 0%, rgba(10,20,14,0.82) 42%, rgba(11,22,15,0.5) 70%, rgba(11,22,15,0.72) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canopy to-transparent" />
        </div>

        <div className="wrap relative z-10 pb-12 pt-14 sm:pt-20 lg:pb-16 lg:pt-24">
          <div className="grid items-start gap-10 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="chip chip-onPanel !border-acacia/40 !bg-acacia/15 !text-acacia">
                  <Compass className="h-3 w-3" />
                  01°02&apos;S 29°41&apos;E · Bwindi Impenetrable Forest
                </span>
                <Link
                  href="/booking"
                  className="chip chip-onPanel link-underline !border-white/20 hover:!text-acacia"
                >
                  {permitsOpen > 0
                    ? `${permitsOpen} permits open across 3 months`
                    : 'Join the permit waitlist'}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              <h1 className="text-hero font-display font-semibold text-parchment">
                Where the equatorial mist
                <span className="block text-acacia">parts for the wild.</span>
              </h1>

              <p className="max-w-2xl text-[1.02rem] leading-relaxed text-parchment/85 sm:text-lg">
                Jabali Trails Africa crafts intimate, conservation-led expeditions across Uganda
                and East Africa — tracking mountain gorillas in Bwindi, following wild
                chimpanzees through Kibale’s ironwood canopy, and walking the frontier of Kidepo
                Valley with Uganda’s finest field naturalists.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/booking" className="btn btn-primary btn-lg">
                  <Calendar className="h-4 w-4" />
                  Check permits &amp; book
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/expeditions" className="btn btn-onPanel btn-lg">
                  Explore 6 expeditions
                </Link>
              </div>

              <dl className="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/15 pt-6 sm:grid-cols-4">
                {[
                  { k: '98.6%', v: 'Primate sighting success' },
                  { k: 'Max 6', v: 'Travelers per Land Cruiser' },
                  { k: '$800', v: 'UWA permit at face value' },
                  { k: '11 yrs', v: 'Guiding the Albertine Rift' },
                ].map((item) => (
                  <div key={item.k}>
                    <dt className="font-display text-xl font-semibold text-acacia sm:text-2xl">
                      {item.k}
                    </dt>
                    <dd className="mt-0.5 font-label text-parchment/60">{item.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right: live field dossier card */}
            <div className="xl:col-span-5 xl:pl-4">
              <div className="relative rounded-3xl border border-white/15 bg-canopy/70 p-5 shadow-deep backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-label text-acacia">Today at the trailhead</p>
                    <p className="mt-1 font-display text-lg font-semibold text-parchment">
                      Buhoma sector · Rushegura family
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 font-label text-emerald-300">
                    <span className="anim-pulse-ring h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Desk online
                  </span>
                </div>

                <div className="media-frame mt-4 h-40 rounded-2xl border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={withBasePath('/images/bwindi-gorilla-family.jpg')}
                    alt="Mountain gorilla family foraging in Bwindi"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-x-3 bottom-2.5 rounded-lg bg-black/55 px-2.5 py-1.5 font-label text-parchment backdrop-blur">
                    Mubare · Rushegura · Habinyanja · Nkuringo
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 text-sm text-parchment/85">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
                    <span className="inline-flex items-center gap-2 font-label text-parchment/60">
                      <Ticket className="h-3.5 w-3.5 text-acacia" />
                      Open trek dates
                    </span>
                    <span className="font-display text-lg font-semibold text-acacia">{openDates}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
                    <span className="inline-flex items-center gap-2 font-label text-parchment/60">
                      <Calendar className="h-3.5 w-3.5 text-acacia" />
                      Next window
                    </span>
                    <span className="font-display text-sm font-semibold text-parchment">
                      {nextOpenDate ? formatDateShort(nextOpenDate) : 'Waitlist only'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 font-label text-parchment/60">
                      <FileCheck2 className="h-3.5 w-3.5 text-acacia" />
                      Active dockets
                    </span>
                    <span className="font-display text-sm font-semibold text-parchment">
                      {pendingDockets} live
                    </span>
                  </div>
                </div>

                <Link href="/booking" className="btn btn-gold mt-4 w-full text-sm">
                  Open the permit calendar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick booking bar */}
          <div className="mt-10 sm:mt-14">
            <HeroQuickBookingBar />
          </div>

          <div className="mt-8 flex items-center justify-center lg:mt-10">
            <a
              href="#featured"
              className="group inline-flex flex-col items-center gap-1 font-label text-parchment/55 transition-colors hover:text-acacia"
            >
              Scroll to the catalogue
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </div>

        {/* Credentials marquee */}
        <div className="marquee-mask relative z-10 overflow-hidden border-y border-white/10 bg-canopy-moss/80 py-2.5 backdrop-blur">
          <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
            {[...CREDENTIAL_TICKER, ...CREDENTIAL_TICKER].map((line, i) => (
              <span key={`${line}-${i}`} className="inline-flex items-center gap-3 font-label text-parchment/60">
                <Leaf className="h-3 w-3 text-acacia" />
                {line}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2 · AUTHORITY BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-line/10 bg-surface-raised">
        <div className="wrap grid grid-cols-1 gap-px overflow-hidden py-0 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icon: FileCheck2,
              title: `Direct UWA permit desk`,
              copy: `Real-time sector-matched Bwindi & Kibale allocation · ${permitsOpen} permits visible for the next quarter`,
            },
            {
              Icon: Users,
              title: 'Intimate small groups',
              copy: 'Capped at 6 guests per custom 4x4 Land Cruiser — or 100% private charter on any date',
            },
            {
              Icon: Binoculars,
              title: 'Primatologist led',
              copy: '12+ years average tracking experience across Uganda’s ten national parks',
            },
            {
              Icon: HeartHandshake,
              title: '5% conservation mandate',
              copy: 'Direct funding to Gorilla Doctors, snare removal & Buhoma women’s co-ops',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group flex items-start gap-3.5 border-line/10 px-5 py-6 transition-colors hover:bg-acacia-light/50 sm:border-r lg:px-6"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canopy text-acacia transition-transform duration-500 group-hover:-translate-y-0.5">
                <item.Icon className="h-4 w-4" />
              </span>
              <div>
                <div className="font-label text-heading">{item.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3 · FEATURED EXPEDITIONS
         ══════════════════════════════════════════════════════════════════════ */}
      <section id="featured" className="section bg-surface bg-topographic">
        <div className="wrap">
          <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-3">
              <span className="eyebrow">Curated field itineraries · 2026 / 2027 season</span>
              <h2 className="text-h2 font-display font-semibold text-heading">
                Signature guided expeditions
              </h2>
              <p className="lede">
                Every itinerary pairs handpicked forest and savannah sanctuaries with transparent
                UWA permit allocation and instant online booking — no hidden markups, no
                pre-dawn road marathons.
              </p>
            </div>
            <Link href="/expeditions" className="btn btn-outline self-start md:self-auto">
              View all {EXPEDITIONS.length} expeditions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {featuredExpeditions.map((exp, i) => (
              <ExpeditionCard key={exp.id} expedition={exp} index={i} />
            ))}
          </Reveal>

          {/* Permit transparency callout */}
          <Reveal className="card mt-10 grid grid-cols-1 items-center gap-6 border-acacia/35 bg-acacia-light/70 p-6 sm:p-8 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-8">
              <span className="eyebrow !text-acacia-dark">
                <ShieldCheck className="h-4 w-4 text-terracotta" />
                How Uganda Wildlife Authority permits work
              </span>
              <h3 className="text-h3 font-display font-semibold text-heading">
                Why gorilla ($800) and chimpanzee ($250) permits are itemised separately
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Gorilla permits are capped by UWA at 8 visitors per habituated family per day.
                Rather than burying that fee inside an opaque package rate, we pass it through at
                face value — $800 Foreign Non-Resident / $700 Foreign Resident / $80 EAC citizen —
                and lock your trekking sector to the lodge you stay at (Buhoma, Ruhija, Rushaga or
                Nkuringo) so you never lose an hour of trekking to a mountain road transfer.
              </p>
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <Link href="/booking" className="btn btn-solid">
                Check live permit calendar
                <ArrowRight className="h-4 w-4 text-acacia" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4 · THE JABALI FIELD STANDARD
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-canopy-topographic grain relative text-parchment">
        <div className="wrap relative z-10 py-20 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <span className="eyebrow !text-acacia">The Jabali field standard</span>
              <h2 className="text-h2 font-display font-semibold text-parchment">
                Crafted by Ugandan naturalists who know every ridge by name.
              </h2>
              <p className="text-parchment/80 leading-relaxed">
                Whether you are crouching in the emerald undergrowth of Bwindi as a silverback
                passes three metres away, or reading lion spoor on Kidepo’s dry sand rivers, the
                quality of your guide defines every moment in the field.
              </p>

              <div className="space-y-3 pt-1">
                {[
                  {
                    n: '01',
                    title: 'Sector-matched lodges and permits',
                    copy: 'Bwindi’s four sectors are separated by hours of mountain road. Your lodge always sits at the exact trailhead of your UWA permit sector.',
                  },
                  {
                    n: '02',
                    title: 'Extended 4x4 Cruisers & Swarovski optics',
                    copy: 'Custom 70-Series Land Cruisers with pop-up roofs, inverter ports at every seat, cold-storage drawer and shared binoculars.',
                  },
                  {
                    n: '03',
                    title: 'Community porters & reformed poacher trackers',
                    copy: 'Paid trail porters on every trek route, direct household income for families living on the forest boundary.',
                  },
                ].map((row) => (
                  <div
                    key={row.n}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:border-acacia/40 hover:bg-white/[0.07]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-acacia/20 font-display text-sm font-bold text-acacia">
                      {row.n}
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold text-parchment">
                        {row.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-parchment/70">{row.copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-3">
                <Link href="/about" className="btn btn-gold">
                  Meet the lead naturalists
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn btn-onPanel">
                  Design a private charter
                </Link>
              </div>
            </div>

            {/* Asymmetric photo collage */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-7 space-y-4">
                  <Reveal className="media-frame relative h-72 rounded-2xl border border-white/15 shadow-deep sm:h-80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={withBasePath('/images/bwindi-gorilla-infant.jpg')}
                      alt="Infant mountain gorilla in Bwindi Impenetrable Forest"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/60 px-2.5 py-1.5 font-label text-parchment backdrop-blur">
                      Rushegura family · Buhoma sector
                    </div>
                  </Reveal>
                  <div className="rounded-2xl border border-acacia/30 bg-canopy-moss p-5">
                    <Stat
                      onDark
                      value={98.6}
                      decimals={1}
                      suffix="%"
                      label="Sighting success rate"
                      note="Across all Bwindi gorilla & Kibale chimpanzee treks over 11 seasons."
                    />
                  </div>
                </div>

                <div className="col-span-5 space-y-4">
                  <div className="rounded-2xl bg-terracotta p-5 text-white anim-float">
                    <div className="font-display text-2xl font-semibold sm:text-3xl">Max 6</div>
                    <div className="mt-1 text-xs leading-relaxed text-white/90">
                      Travelers per vehicle — every guest gets a window and a roof hatch.
                    </div>
                  </div>
                  <Reveal delay={80} className="media-frame relative h-64 rounded-2xl border border-white/15 shadow-deep sm:h-72">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={withBasePath('/images/safari-land-cruiser.jpg')}
                      alt="Jabali custom 4x4 safari Land Cruiser"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/60 px-2.5 py-1.5 font-label text-parchment backdrop-blur">
                      4x4 extended Land Cruiser fleet
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5 · DESTINATIONS + CORRIDOR MAP
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-surface-raised border-y border-line/10">
        <div className="wrap">
          <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-3">
              <span className="eyebrow">Albertine Rift to the Serengeti plains</span>
              <h2 className="text-h2 font-display font-semibold text-heading">
                Our core expedition territories
              </h2>
              <p className="lede">
                Where West African tropical jungle meets East African savannah. Explore Uganda’s
                flagship national parks and seamless fly-in extensions into Tanzania and Kenya.
              </p>
            </div>
            <Link href="/destinations" className="btn btn-solid self-start md:self-auto">
              Explore all {DESTINATIONS.length} destinations
              <ArrowRight className="h-4 w-4 text-acacia" />
            </Link>
          </Reveal>

          <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.slice(0, 6).map((dest, i) => (
              <Link
                key={dest.id}
                href={`/destinations#${dest.slug}`}
                className={`media-frame group relative flex h-80 flex-col justify-end p-6 rounded-2xl border border-white/10 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-deep ${
                  i === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  loading="lazy"
                  decoding="async"
                />
                <div className="scrim-bottom absolute inset-0" />
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip chip-onPanel !bg-acacia/20 !border-acacia/40 !text-acacia">
                      {dest.country}
                    </span>
                    <span className="font-label text-parchment/70">{dest.coordinates}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-white transition-colors group-hover:text-acacia">
                    {dest.name}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-parchment/85">
                    {dest.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dest.signatureSpecies.slice(0, 2).map((sp) => (
                      <span
                        key={sp}
                        className="rounded bg-white/10 px-2 py-0.5 font-label text-parchment"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>

          <Reveal className="mt-12">
            <InteractiveUgandaMap />
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6 · GUIDES
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-surface">
        <div className="wrap">
          <Reveal className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <span className="eyebrow">Ugandan primatologists &amp; trackers</span>
            <h2 className="text-h2 font-display font-semibold text-heading">
              Led by the people who call these forests home
            </h2>
            <p className="lede">
              Three senior guides, thirty-three combined years of UWA ranger and research field
              time, and a network of 40 assistant naturalists, boatmen and Ik interpreters.
            </p>
          </Reveal>

          <Reveal className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {LEAD_GUIDES.map((guide) => (
              <article
                key={guide.name}
                className="card card-hover group flex flex-col overflow-hidden"
              >
                <div className="media-frame relative h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guide.image}
                    alt={`${guide.role} for Jabali Trails Africa`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canopy/90 via-transparent to-transparent" />
                  <div className="absolute inset-x-4 bottom-3 font-label text-acacia">
                    {guide.experienceYears} years in field · {guide.homeRegion}
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                  <div>
                    <h3 className="font-display text-xl font-semibold capitalize text-heading">
                      {guide.name.replace(/-/g, ' ')}
                    </h3>
                    <p className="mt-0.5 font-label text-terracotta">{guide.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">{guide.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {guide.languages.slice(0, 3).map((lang) => (
                        <span key={lang} className="chip">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <blockquote className="rounded-xl border-l-2 border-acacia bg-surface-sunk/70 p-3.5 text-xs italic leading-relaxed text-ink">
                    “{guide.quote}”
                  </blockquote>
                </div>
              </article>
            ))}
          </Reveal>

          <div className="mt-10 text-center">
            <Link href="/about#guides" className="btn btn-outline">
              <MapPin className="h-4 w-4 text-terracotta" />
              Full guide roster, specialties &amp; ask-a-guide form
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7 · GUEST DISPATCHES (carousel)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="section border-y border-line/10 bg-surface-raised bg-topographic">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center">
          <Reveal className="space-y-4 lg:col-span-4">
            <span className="eyebrow">Verified guest dispatches</span>
            <h2 className="text-h2 font-display font-semibold text-heading">
              Notes from the trailhead
            </h2>
            <p className="lede">
              Unedited post-expedition reports from travelers who trekked Bwindi, Kibale and
              Kidepo with us this season. Every review is tied to a booking reference.
            </p>
            <ul className="space-y-2.5 pt-1">
              {[
                '4.9 / 5 average across 612 completed expeditions',
                '97% of guests trek the same day their permit is issued',
                'Zero permit failures since the desk opened in 2015',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pos" />
                  {line}
                </li>
              ))}
            </ul>
            <Link href="/expeditions" className="btn btn-outline !py-2.5 text-xs">
              Browse itineraries
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-8">
            <TestimonialCarousel />
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          8 · FAQ
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-surface">
        <div className="wrap grid gap-10 lg:grid-cols-12">
          <Reveal className="space-y-4 lg:col-span-4">
            <span className="eyebrow">Before you book</span>
            <h2 className="text-h2 font-display font-semibold text-heading">
              Field questions, answered plainly
            </h2>
            <p className="lede">
              Permit mechanics, fitness reality, children’s age rules, deposits and date
              transfers — the same answers our Kampala desk gives on the phone.
            </p>
            <div className="rounded-2xl border border-acacia/35 bg-acacia-light/70 p-5">
              <p className="font-label text-acacia-dark">Still unsure about your window?</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                We will check the UWA portal manually for your exact dates and reply within 4
                hours, including a sector strategy for your fitness level.
              </p>
              <Link href="/contact" className="btn btn-primary mt-3.5 !py-2.5 text-xs">
                <Sparkles className="h-4 w-4" />
                Ask the permit desk
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-8">
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          9 · FINAL CONVERSION
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-surface-sunk pb-20 pt-4 sm:pb-24">
        <div className="wrap">
          <Reveal className="panel bg-canopy-topographic grain relative p-8 shadow-deep sm:p-12">
            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-8">
                <span className="chip chip-onPanel !border-acacia/40 !bg-acacia/15 !text-acacia">
                  <Sparkles className="h-3.5 w-3.5" />
                  2026 &amp; 2027 UWA gorilla permits now open
                </span>
                <h2 className="text-h2 font-display font-semibold text-parchment">
                  Ready to lock your Bwindi gorilla or Kibale chimpanzee permits?
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-parchment/80">
                  Check live sector availability, itemise your exact total, then reserve instantly
                  through Stripe — or place a complimentary 48-hour hold while you confirm
                  flights. Base package from {bwindi.basePriceUsd.toLocaleString()} USD per guest.
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 font-label text-parchment/75">
                  {[
                    '30% deposit + permits option',
                    'Stripe 256-bit encrypted checkout',
                    'Free date transfer up to 60 days out',
                  ].map((line) => (
                    <span key={line} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-acacia" />
                      {line}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
                <Link href="/booking" className="btn btn-primary btn-lg w-full">
                  <Calendar className="h-4 w-4" />
                  Open booking engine
                </Link>
                <Link href="/contact" className="btn btn-onPanel btn-lg w-full">
                  <MapPin className="h-4 w-4 text-acacia" />
                  Tailor-made inquiry
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
