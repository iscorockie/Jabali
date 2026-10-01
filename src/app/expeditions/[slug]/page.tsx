import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EXPEDITIONS, getExpeditionBySlug } from '@/data/expeditions';
import { getMonthAvailability } from '@/lib/booking-store';
import ExpeditionQuickBookSidebar from '@/components/ExpeditionQuickBookSidebar';
import ExpeditionInteractiveItinerary from '@/components/ExpeditionInteractiveItinerary';
import ExpeditionGallery from '@/components/ExpeditionGallery';
import SeasonQuotaChart from '@/components/SeasonQuotaChart';
import DossierNav from '@/components/DossierNav';
import InteractiveUgandaMap from '@/components/InteractiveUgandaMap';
import FaqAccordion from '@/components/FaqAccordion';
import ShareActions from '@/components/ShareActions';
import WishlistButton from '@/components/WishlistButton';
import Reveal from '@/components/ui/Reveal';
import {
  Calendar,
  Users,
  Mountain,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Clock,
  Leaf,
  ArrowRight,
  Ticket,
  Compass,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  { id: 'brief', label: 'Expedition brief' },
  { id: 'itinerary', label: 'Day-by-day' },
  { id: 'inclusions', label: 'What you pay for' },
  { id: 'gallery', label: 'Field gallery' },
  { id: 'season', label: 'Season & quotas' },
  { id: 'faq', label: 'Permit FAQ' },
];

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const expedition = getExpeditionBySlug(params.slug);
  if (!expedition) return { title: 'Expedition not found' };
  return {
    title: `${expedition.title} (${expedition.durationDays} Days)`,
    description: expedition.summary,
    keywords: [
      expedition.title,
      expedition.primaryPark,
      'UWA gorilla permit',
      expedition.categoryLabel,
    ],
    alternates: { canonical: `/expeditions/${expedition.slug}` },
    openGraph: {
      title: `${expedition.title} — Jabali Trails Africa`,
      description: expedition.subtitle,
      type: 'article',
      images: [{ url: expedition.heroImage, width: 1200, height: 675, alt: expedition.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: expedition.title,
      description: expedition.subtitle,
    },
  };
}

export default function ExpeditionDetailPage({ params }: { params: { slug: string } }) {
  const expedition = getExpeditionBySlug(params.slug);
  if (!expedition) notFound();

  const now = new Date();
  const monthCursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const liveDays = getMonthAvailability(expedition.id, monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1);
  const openDays = liveDays.filter((d) => d.status !== 'past' && d.permitsRemaining > 0);
  const permitsNextMonth = openDays.reduce((sum, d) => sum + d.permitsRemaining, 0);
  const totalPermitUsd = expedition.gorillaPermitUsd + expedition.chimpPermitUsd;
  const related = EXPEDITIONS.filter(
    (e) => e.id !== expedition.id && (e.category === expedition.category || e.featured)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[60vh] flex-col justify-end overflow-hidden bg-canopy text-parchment grain">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expedition.heroImage}
            alt={expedition.title}
            className="anim-ken h-full w-full object-cover"
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(8,17,12,0.72) 0%, rgba(8,17,12,0.55) 40%, rgba(8,17,12,0.95) 100%)',
            }}
          />
        </div>

        <div className="wrap relative z-10 pb-12 pt-20 sm:pt-24">
          <Link
            href="/expeditions"
            className="group inline-flex items-center gap-1.5 font-label text-acacia transition-colors hover:text-parchment"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to all expeditions
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="chip !border-terracotta/60 !bg-terracotta !text-white">
              <Sparkles className="h-3 w-3" />
              {expedition.badge}
            </span>
            <span className="chip chip-onPanel">
              <Compass className="h-3 w-3 text-acacia" />
              {expedition.coordinates} · {expedition.primaryPark}
            </span>
            <span className="chip chip-onPanel !border-emerald-400/40 !bg-emerald-400/10 !text-emerald-300">
              <Ticket className="h-3 w-3" />
              {permitsNextMonth > 0
                ? `${permitsNextMonth} permits open · ${monthCursor.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })}`
                : 'Waitlist & 48-hour hold available'}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-hero font-display font-semibold text-parchment">
            {expedition.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-parchment/85 sm:text-lg">
            {expedition.subtitle}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { Icon: Calendar, label: 'Duration', value: `${expedition.durationDays}D / ${expedition.durationDays - 1}N` },
              { Icon: Users, label: 'Group size', value: `Max ${expedition.maxGroupSize} guests` },
              { Icon: Mountain, label: 'Physical grade', value: expedition.difficulty },
              {
                Icon: Clock,
                label: 'Trekking sector',
                value: expedition.trekkingSector || 'Savannah & Rift corridor',
              },
            ].map((spec) => (
              <div
                key={spec.label}
                className="rounded-2xl border border-white/15 bg-white/[0.07] p-3.5 backdrop-blur-md transition-colors hover:border-acacia/50"
              >
                <div className="font-label text-parchment/65">{spec.label}</div>
                <div className="mt-1.5 flex items-center gap-1.5 font-display text-sm font-semibold text-parchment">
                  <spec.Icon className="h-4 w-4 shrink-0 text-acacia" />
                  <span className="truncate">{spec.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-semibold text-parchment">
                ${expedition.basePriceUsd.toLocaleString()}
              </span>
              <span className="font-label text-parchment/70">
                per guest · land package
              </span>
              <span className="chip chip-onPanel !border-acacia/40 !text-acacia">
                {totalPermitUsd > 0
                  ? `+ $${totalPermitUsd.toLocaleString()} UWA permit at cost`
                  : 'All permits included'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 [&_button]:!border-white/25 [&_a]:!border-white/25 [&_.btn-outline]:!bg-white/10 [&_.btn-outline]:!text-parchment">
              <WishlistButton expeditionId={expedition.id} variant="icon" />
              <ShareActions title={`${expedition.title} — Jabali Trails Africa`} text={expedition.subtitle} />
              <Link href="#book" className="btn btn-primary">
                Reserve a place
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DossierNav sections={SECTIONS} />

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="wrap grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            {/* Brief */}
            <Reveal id="brief" className="card scroll-mt-40 space-y-5 p-6 sm:p-8">
              <span className="eyebrow">Expedition brief</span>
              <h2 className="text-h2 font-display font-semibold text-heading">
                About this journey
              </h2>
              <p className="text-base leading-relaxed text-ink-muted">{expedition.summary}</p>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                {expedition.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-start gap-3 rounded-2xl border border-line/10 bg-surface p-3.5 transition-colors hover:border-acacia/50"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                    <span className="text-sm leading-relaxed text-ink">{highlight}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-line/10 pt-5">
                <span className="inline-flex items-center gap-1.5 font-label text-ink-subtle">
                  <Leaf className="h-3.5 w-3.5 text-pos" />
                  Best months:
                </span>
                {expedition.bestMonths.map((m) => (
                  <span key={m} className="chip chip-pos">
                    {m}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Itinerary */}
            <Reveal id="itinerary" className="scroll-mt-40">
              <ExpeditionInteractiveItinerary expedition={expedition} />
            </Reveal>

            {/* Inclusions */}
            <Reveal id="inclusions" className="grid scroll-mt-40 gap-5 md:grid-cols-2">
              <div className="card space-y-4 border-pos/30 p-6">
                <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-heading">
                  <CheckCircle2 className="h-5 w-5 text-pos" />
                  Included in the base package
                </h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-ink-muted">
                  {expedition.included.map((inc) => (
                    <li key={inc} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pos" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card space-y-4 p-6">
                <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-heading">
                  <XCircle className="h-5 w-5 text-terracotta" />
                  Itemised separately
                </h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-ink-muted">
                  {expedition.excluded.map((exc) => (
                    <li key={exc} className="flex items-start gap-2.5">
                      <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
                <p className="rounded-xl border border-acacia/35 bg-acacia-light/70 p-3.5 text-xs leading-relaxed text-ink-muted">
                  <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-acacia-dark" />
                  Nothing is marked up: UWA permit fees, park entrance levies and the 5%
                  conservation levy are listed line-by-line on your invoice.
                </p>
              </div>
            </Reveal>

            {/* Gallery */}
            <Reveal id="gallery" className="scroll-mt-40">
              <ExpeditionGallery images={expedition.gallery} title={expedition.title} />
            </Reveal>

            {/* Season & quotas */}
            <Reveal id="season" className="scroll-mt-40 space-y-5">
              <SeasonQuotaChart expedition={expedition} />
              <InteractiveUgandaMap compact />
            </Reveal>

            {/* FAQ */}
            <Reveal id="faq" className="scroll-mt-40 space-y-4">
              <div>
                <span className="eyebrow">Permit &amp; payment questions</span>
                <h2 className="text-h2 mt-1.5 font-display font-semibold text-heading">
                  Read this before you commit a date
                </h2>
              </div>
              <FaqAccordion limitTo={['permits', 'payment']} showSearch={false} id="expedition-faq" />
            </Reveal>

            {/* Related */}
            <div className="space-y-5 pt-2">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-h3 font-display font-semibold text-heading">
                  Travelers also paired this with
                </h2>
                <Link href="/expeditions" className="btn btn-sm btn-outline">
                  All expeditions
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/expeditions/${rel.slug}`}
                    className="card card-hover group media-frame relative flex h-44 flex-col justify-end p-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rel.heroImage} alt={rel.title} loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-canopy/95 via-canopy/40 to-transparent" />
                    <div className="relative z-10">
                      <p className="font-label text-acacia">{rel.durationDays} days · from ${rel.basePriceUsd.toLocaleString()}</p>
                      <p className="mt-1 font-display text-sm font-semibold leading-snug text-parchment group-hover:text-acacia">
                        {rel.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky booking rail */}
          <aside id="book" className="space-y-5 scroll-mt-40 lg:col-span-4 lg:sticky lg:top-32">
            <ExpeditionQuickBookSidebar expedition={expedition} />

            <div className="card space-y-3 p-5">
              <p className="font-label text-terracotta">Hold instead of paying today</p>
              <p className="text-sm leading-relaxed text-ink-muted">
                We will provisionally reserve your sector and lodge for 48 hours at no cost while
                you confirm flights and travel companions.
              </p>
              <Link
                href={`/booking?expedition=${encodeURIComponent(expedition.id)}&mode=inquiry`}
                className="btn btn-outline w-full"
              >
                Request a 48-hour hold
              </Link>
              <Link href="/contact" className="btn btn-solid w-full">
                Tailor this itinerary
                <ArrowRight className="h-4 w-4 text-acacia" />
              </Link>
            </div>

            <div className="card space-y-3 p-5">
              <p className="font-label text-ink-subtle">Why guests book direct</p>
              {[
                'Permits held in your name within minutes of payment',
                'Sector-matched lodging — no pre-dawn road transfers',
                'Free date transfers up to 60 days before departure',
              ].map((line) => (
                <p key={line} className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pos" />
                  {line}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
