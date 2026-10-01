'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EXPEDITIONS } from '@/data/expeditions';
import { BookingRecord } from '@/lib/pricing';
import { triggerWebhookUniversal } from '@/lib/client-booking-engine';
import {
  ShieldCheck,
  CreditCard,
  Webhook,
  CheckCircle2,
  Calendar,
  Users,
  Compass,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Search,
  Download,
  Lock,
  KeyRound,
  ChevronDown,
  BarChart3,
  TrendingUp,
  X,
  Loader2,
} from 'lucide-react';
import Stat from '@/components/ui/Stat';
import { downloadFile, toCsv, formatDateLong } from '@/lib/format';
import { useSite, CURRENCIES } from '@/components/providers/SiteProvider';

interface InquiryItem {
  inquiryReference: string;
  createdAt: string;
  status: 'new' | 'proposal_sent' | 'converted';
  fullName: string;
  email: string;
  phone: string;
  preferredMonth: string;
  durationDays: string;
  guests: number;
  budgetPerPerson: string;
  interests: string[];
}

interface WebhookEventItem {
  id: string;
  eventType: string;
  bookingReference: string;
  stripeObjectId: string;
  status: string;
  processedAt: string;
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live UWA Permit Quota Override Form State
  const [quotaExpId, setQuotaExpId] = useState(EXPEDITIONS[0].id);
  const [quotaDate, setQuotaDate] = useState('2026-11-18');
  const [quotaPermits, setQuotaPermits] = useState(6);

  /* ── Ops access gate (client-side demo lock) ───────────────────────────── */
  const OPS_PASSCODE = 'jabali2026';
  const [passcode, setPasscode] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem('jabali_ops_unlocked') === '1') setUnlocked(true);
    } catch {
      /* private mode */
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === OPS_PASSCODE) {
      setUnlocked(true);
      setGateError(null);
      try {
        window.sessionStorage.setItem('jabali_ops_unlocked', '1');
      } catch {
        /* ignore */
      }
    } else {
      setGateError('That passcode does not match the Kampala ops desk credential.');
    }
  };

  /* ── Ledger filters, KPIs & exports ────────────────────────────────────── */
  const { money } = useSite();
  const [ledgerQuery, setLedgerQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingRecord['status']>('all');
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  const filteredBookings = useMemo(() => {
    const q = ledgerQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (!q) return true;
      return [
        b.bookingReference,
        b.expeditionTitle,
        b.leadGuest?.fullName,
        b.leadGuest?.email,
        b.uwaPermitDocketNumber || '',
        b.departureDate,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [bookings, ledgerQuery, statusFilter]);

  const kpis = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'cancelled');
    const collected = active
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + (b.pricing?.payableNowUsd || 0), 0);
    const pipeline = active
      .filter((b) => b.status !== 'paid')
      .reduce((sum, b) => sum + (b.pricing?.payableNowUsd || 0), 0);
    const permits = active
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + b.guests, 0);
    const partySize = active.length
      ? active.reduce((sum, b) => sum + b.guests, 0) / active.length
      : 0;
    const converted = inquiries.filter((i) => i.status === 'converted').length;
    const conversion = inquiries.length ? Math.round((converted / inquiries.length) * 100) : 0;
    return { collected, pipeline, permits, partySize, conversion, active: active.length };
  }, [bookings, inquiries]);

  const revenueByExpedition = useMemo(() => {
    const map = new Map<string, number>();
    bookings
      .filter((b) => b.status !== 'cancelled')
      .forEach((b) => {
        const label = b.expeditionTitle.split(':')[0];
        map.set(label, (map.get(label) || 0) + (b.pricing?.totalTripCostUsd || 0));
      });
    const rows = Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    const max = Math.max(1, ...rows.map((r) => r.value));
    return rows.sort((a, b) => b.value - a.value).map((r) => ({ ...r, pctOfMax: (r.value / max) * 100 }));
  }, [bookings]);

  const handleExportBookingsCsv = () => {
    if (!filteredBookings.length) {
      setStatusMessage('Nothing to export with the current filters.');
      return;
    }
    const rows = filteredBookings.map((b) => ({
      reference: b.bookingReference,
      status: b.status,
      expedition: b.expeditionTitle,
      departure: b.departureDate,
      return: b.endDate,
      guests: b.guests,
      safariStyle: b.safariStyle,
      accommodationTier: b.accommodationTier,
      residency: b.residencyStatus,
      paymentPlan: b.paymentPlan,
      leadTraveler: b.leadGuest?.fullName,
      email: b.leadGuest?.email,
      phone: b.leadGuest?.phone,
      nationality: b.leadGuest?.nationality,
      passport: b.leadGuest?.passportNumber || '',
      companions: (b.leadGuest?.companions || []).map((c) => c.fullName).join(' | '),
      uwaDocket: b.uwaPermitDocketNumber || '',
      totalUsd: b.pricing?.totalTripCostUsd || 0,
      payableNowUsd: b.pricing?.payableNowUsd || 0,
      balanceUsd: b.pricing?.remainingBalanceUsd || 0,
      createdAt: b.createdAt,
    }));
    downloadFile(
      `jabali-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows),
      'text/csv'
    );
    setStatusMessage(`Exported ${rows.length} booking dossiers to CSV.`);
  };

  const loadData = async () => {
    try {
      const [bkRes, inqRes, whRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/inquiries'),
        fetch('/api/webhooks/stripe'),
      ]);

      if (bkRes.ok) {
        const bkData = await bkRes.json();
        if (Array.isArray(bkData.bookings)) {
          setBookings(bkData.bookings);
        }
      }
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        if (Array.isArray(inqData.inquiries)) {
          setInquiries(inqData.inquiries);
        }
      }
      if (whRes.ok) {
        const whData = await whRes.json();
        if (Array.isArray(whData.events)) {
          setWebhookEvents(whData.events);
        }
      }
    } catch {
      // Fallback to localStorage if offline
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkPaidViaWebhook = async (bookingRef: string) => {
    const res = await triggerWebhookUniversal({
      bookingReference: bookingRef,
      eventType: 'checkout.session.completed',
    });
    setStatusMessage(
      `Stripe Webhook (${res.eventType}) processed for ${bookingRef} at ${new Date(
        res.processedAt
      ).toLocaleTimeString()}`
    );
    await loadData();
  };

  const handleCancelBooking = async (bookingRef: string) => {
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: bookingRef,
        status: 'cancelled',
      }),
    });
    setStatusMessage(
      `Booking ${bookingRef} cancelled and UWA permits released back to sector inventory.`
    );
    await loadData();
  };

  const handleUpdateInquiryStatus = async (
    inquiryReference: string,
    status: InquiryItem['status']
  ) => {
    await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryReference, status }),
    });
    setStatusMessage(`Inquiry ${inquiryReference} updated to ${status.toUpperCase()}.`);
    await loadData();
  };

  const handleOverrideQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expeditionId: quotaExpId,
        date: quotaDate,
        permits: quotaPermits,
      }),
    });
    if (res.ok) {
      setStatusMessage(
        `UWA daily permit quota for ${quotaDate} updated to ${quotaPermits} permits.`
      );
    }
  };

  if (!unlocked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-canopy-topographic grain px-4 py-16">
        <form
          onSubmit={handleUnlock}
          className="anim-scale-in relative z-10 w-full max-w-md space-y-5 rounded-3xl border border-white/15 bg-canopy/80 p-7 text-parchment shadow-deep backdrop-blur-xl"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-acacia/40 bg-acacia/15 text-acacia">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <p className="font-label text-acacia">Kampala &amp; Bwindi operations desk</p>
            <h1 className="mt-1.5 font-display text-2xl font-semibold text-parchment">
              Ops console access
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-parchment/75">
              This dashboard exposes guest manifests, passport references and permit dockets.
              Enter the desk passcode to continue.
            </p>
          </div>

          <div>
            <label htmlFor="ops-passcode" className="field-label !text-parchment/70">
              <KeyRound className="h-3.5 w-3.5 text-acacia" />
              Desk passcode
            </label>
            <input
              id="ops-passcode"
              type="password"
              autoComplete="current-password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (gateError) setGateError(null);
              }}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 text-sm text-parchment outline-none transition-colors placeholder:text-parchment/40 focus:border-acacia"
            />
            {gateError ? (
              <p className="mt-2 text-xs font-medium text-red-300">{gateError}</p>
            ) : null}
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center">
            <ShieldCheck className="h-4 w-4" />
            Unlock operations console
          </button>

          <p className="rounded-xl border border-acacia/30 bg-acacia/10 px-3.5 py-2.5 text-[0.7rem] leading-relaxed text-parchment/75">
            Demo environment: the passcode is <strong className="text-acacia">jabali2026</strong>.
            Real deployments should back this gate with SSO or a signed server session.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface bg-topographic py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-canopy text-parchment rounded-3xl p-8 sm:p-10 shadow-elevated flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-label text-xs">
              <Compass className="w-3.5 h-3.5" />
              KAMPALA &amp; BWINDI OPERATIONS CONSOLE
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
              Field Inventory, Stripe Webhooks &amp; Booking Ledger
            </h1>
            <p className="text-sm text-parchment/80 max-w-2xl">
              Live server-backed operations dashboard for managing bookings, overriding daily UWA gorilla/chimp permit quotas, tracking Stripe webhook events, and updating custom safari inquiries.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                await loadData();
                setStatusMessage(`Ledger synced at ${new Date().toLocaleTimeString()}.`);
              }}
              className="btn btn-onPanel !py-2.5 text-xs"
            >
              <RefreshCw className="w-4 h-4 text-acacia" />
              Sync server ledger
            </button>
            <button
              type="button"
              onClick={handleExportBookingsCsv}
              className="btn btn-onPanel !py-2.5 text-xs"
            >
              <Download className="w-4 h-4 text-acacia" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  window.sessionStorage.removeItem('jabali_ops_unlocked');
                } catch {
                  /* ignore */
                }
                setUnlocked(false);
                setPasscode('');
              }}
              className="btn btn-onPanel !py-2.5 text-xs"
            >
              <Lock className="w-4 h-4 text-acacia" />
              Lock
            </button>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold"
            >
              <Calendar className="w-4 h-4" />
              <span>Create New Booking</span>
            </Link>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-2xl bg-pos-soft border border-pos/30 text-xs font-label text-pos flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pos" />
              {statusMessage}
            </span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Collected · paid dockets',
              value: Math.round(kpis.collected),
              prefix: '',
              suffix: ' USD',
              decimals: 0,
              note: `${bookings.filter((b) => b.status === 'paid').length} settled Stripe sessions`,
              icon: <CreditCard className="h-4 w-4" />,
            },
            {
              label: 'Pending pipeline',
              value: Math.round(kpis.pipeline),
              prefix: '',
              suffix: ' USD',
              decimals: 0,
              note: `${bookings.filter((b) => b.status === 'pending_payment').length} awaiting payment · ${bookings.filter((b) => b.status === 'inquiry_hold').length} holds`,
              icon: <Loader2 className="h-4 w-4" />,
            },
            {
              label: 'Permits registered',
              value: kpis.permits,
              prefix: '',
              suffix: '',
              decimals: 0,
              note: `Across active departures · avg party ${kpis.partySize.toFixed(1)}`,
              icon: <Users className="h-4 w-4" />,
            },
            {
              label: 'Inquiry → booking',
              value: kpis.conversion,
              prefix: '',
              suffix: '%',
              decimals: 0,
              note: `${inquiries.length} briefs this season`,
              icon: <TrendingUp className="h-4 w-4" />,
            },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-label text-ink-subtle">{kpi.label}</p>
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-canopy text-acacia">
                  {kpi.icon}
                </span>
              </div>
              <Stat
                className="mt-3"
                value={kpi.value}
                prefix={kpi.prefix}
                suffix={kpi.suffix}
                decimals={kpi.decimals}
                note={kpi.note}
              />
            </div>
          ))}
        </div>

        {/* 2. Revenue split */}
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 font-label text-terracotta">
                <BarChart3 className="h-3.5 w-3.5" />
                Ledger by expedition
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-heading">
                Gross trip value on the books
              </h2>
            </div>
            <span className="chip">
              {money(revenueByExpedition.reduce((sum, r) => sum + r.value, 0))} total
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {revenueByExpedition.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No bookings on the ledger yet — create one from the booking engine to see it here.
              </p>
            ) : (
              revenueByExpedition.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate font-display text-xs font-semibold text-heading sm:w-64">
                    {row.label}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-terracotta to-acacia transition-[width] duration-700"
                      style={{ width: `${row.pctOfMax}%` }}
                    />
                  </span>
                  <span className="w-24 shrink-0 text-right font-label text-ink-muted">
                    {money(row.value)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Live Bookings Table */}
        <div className="bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-heading">
                Active safari bookings &amp; UWA permit dockets ({filteredBookings.length}
                {filteredBookings.length !== bookings.length ? ` of ${bookings.length}` : ''})
              </h2>
              <p className="text-xs text-ink-muted">
                Backed by <code>/api/bookings</code> &amp; <code>/api/webhooks/stripe</code>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-subtle" />
                <input
                  type="search"
                  value={ledgerQuery}
                  onChange={(e) => setLedgerQuery(e.target.value)}
                  placeholder="Reference, guest, email, docket…"
                  aria-label="Search bookings"
                  className="field !w-60 !py-2 pl-8 text-xs"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="field !w-auto !py-2 text-xs"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="pending_payment">Pending payment</option>
                <option value="inquiry_hold">Inquiry hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button type="button" onClick={handleExportBookingsCsv} className="btn btn-sm btn-outline">
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line/15 font-label uppercase text-ink-muted">
                  <th className="py-3 px-3">Booking Ref</th>
                  <th className="py-3 px-3">Expedition</th>
                  <th className="py-3 px-3">Departure</th>
                  <th className="py-3 px-3">Lead Traveler</th>
                  <th className="py-3 px-3">Due / Paid</th>
                  <th className="py-3 px-3">Status &amp; UWA Docket</th>
                  <th className="py-3 px-3 text-right">Operations Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {filteredBookings.map((b) => (
                  <React.Fragment key={b.id}>
                  <tr className="hover:bg-surface/60">
                    <td className="py-3.5 px-3 font-label font-bold text-heading">
                      {b.bookingReference}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-heading">
                      {b.expeditionTitle}
                    </td>
                    <td className="py-3.5 px-3 font-label">
                      {b.departureDate} ({b.guests} pax)
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-heading">{b.leadGuest.fullName}</div>
                      <div className="text-[11px] text-ink-muted">{b.leadGuest.email}</div>
                    </td>
                    <td className="py-3.5 px-3 font-label font-semibold text-heading">
                      ${b.pricing.payableNowUsd.toLocaleString()} USD
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label text-[10px] font-bold ${
                          b.status === 'paid'
                            ? 'bg-pos-soft text-pos'
                            : b.status === 'inquiry_hold'
                            ? 'bg-warn-soft text-warn'
                            : b.status === 'cancelled'
                            ? 'bg-neg-soft text-neg'
                            : 'bg-surface-sunk text-ink-muted'
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                      {b.uwaPermitDocketNumber && (
                        <div className="font-label text-[10px] text-ink-muted mt-1">
                          {b.uwaPermitDocketNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {b.status !== 'paid' && b.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaidViaWebhook(b.bookingReference)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-canopy text-acacia font-label text-[11px]"
                        >
                          <Webhook className="w-3 h-3" />
                          <span>Webhook Paid</span>
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.bookingReference)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neg/35 text-neg font-label text-[11px]"
                        >
                          <span>Release Permits</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedRef(expandedRef === b.bookingReference ? null : b.bookingReference)
                        }
                        aria-expanded={expandedRef === b.bookingReference}
                        className="inline-flex items-center gap-1 rounded-lg border border-line/20 px-2.5 py-1.5 font-label text-[11px] text-ink transition-colors hover:border-terracotta/50 hover:text-terracotta"
                      >
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            expandedRef === b.bookingReference ? 'rotate-180' : ''
                          }`}
                        />
                        Details
                      </button>
                      <Link
                        href={`/booking/success?ref=${encodeURIComponent(
                          b.bookingReference
                        )}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-terracotta text-white font-semibold text-[11px]"
                      >
                        <span>Dossier</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>

                  {expandedRef === b.bookingReference ? (
                    <tr className="bg-surface/70">
                      <td colSpan={7} className="px-3 py-5">
                        <div className="grid gap-5 lg:grid-cols-3">
                          <div className="space-y-2">
                            <p className="font-label text-terracotta">Party manifest</p>
                            <div className="space-y-1.5 text-xs text-ink">
                              <p className="font-semibold text-heading">
                                {b.leadGuest?.fullName} · lead traveler
                              </p>
                              <p className="text-ink-muted">
                                {b.leadGuest?.email} · {b.leadGuest?.phone}
                              </p>
                              <p className="text-ink-muted">
                                {b.leadGuest?.nationality}
                                {b.leadGuest?.passportNumber ? ` · passport ${b.leadGuest.passportNumber}` : ''}
                              </p>
                              <p className="text-ink-muted">Pace: {b.leadGuest?.fitnessLevel}</p>
                              {(b.leadGuest?.companions || []).map((c, i) => (
                                <p key={`${c.fullName}-${i}`} className="text-ink-muted">
                                  Guest {i + 2}: <span className="text-heading">{c.fullName}</span>
                                  {c.passportNumber ? ` · ${c.passportNumber}` : ' · passport pending'}
                                </p>
                              ))}
                              {b.leadGuest?.dietaryOrMedicalNotes ? (
                                <p className="rounded-lg border border-line/12 bg-surface px-2.5 py-2 text-ink-muted">
                                  {b.leadGuest.dietaryOrMedicalNotes}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-label text-terracotta">Itemised ledger</p>
                            <div className="text-xs text-ink-muted">
                              <div className="ledger-row">
                                <span>Land package ({b.guests} × {money(b.pricing?.effectiveBasePerPersonUsd || 0)})</span>
                                <span className="text-heading">{money(b.pricing?.safariPackageSubtotalUsd || 0)}</span>
                              </div>
                              {b.pricing?.isGreenSeason ? (
                                <div className="ledger-row">
                                  <span>Emerald season discount</span>
                                  <span className="text-pos">
                                    −{money((b.pricing?.greenSeasonDiscountPerPersonUsd || 0) * b.guests)}
                                  </span>
                                </div>
                              ) : null}
                              <div className="ledger-row">
                                <span>UWA permits</span>
                                <span className="text-heading">{money(b.pricing?.permitsSubtotalUsd || 0)}</span>
                              </div>
                              {(b.pricing?.privateUpgradeSubtotalUsd || 0) > 0 ? (
                                <div className="ledger-row">
                                  <span>Private 4x4 charter</span>
                                  <span className="text-heading">{money(b.pricing.privateUpgradeSubtotalUsd)}</span>
                                </div>
                              ) : null}
                              {(b.pricing?.luxuryUpgradeSubtotalUsd || 0) > 0 ? (
                                <div className="ledger-row">
                                  <span>Premier luxury tier</span>
                                  <span className="text-heading">{money(b.pricing.luxuryUpgradeSubtotalUsd)}</span>
                                </div>
                              ) : null}
                              {(b.pricing?.selectedAddons || []).map((addon) => (
                                <div key={addon.id} className="ledger-row">
                                  <span>{addon.name}</span>
                                  <span className="text-heading">{money(addon.totalUsd)}</span>
                                </div>
                              ))}
                              <div className="ledger-row font-semibold text-heading">
                                <span>Total trip value</span>
                                <span>{money(b.pricing?.totalTripCostUsd || 0)}</span>
                              </div>
                              <div className="ledger-row">
                                <span>Paid now</span>
                                <span className="text-heading">{money(b.pricing?.payableNowUsd || 0)}</span>
                              </div>
                              <div className="ledger-row">
                                <span>Balance due 60 days out</span>
                                <span className="text-ink-muted">{money(b.pricing?.remainingBalanceUsd || 0)}</span>
                              </div>
                              <div className="ledger-row">
                                <span>5% conservation levy</span>
                                <span className="text-pos">{money(b.pricing?.conservationPledgeIncludedUsd || 0)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-label text-terracotta">Stripe &amp; timing</p>
                            <div className="space-y-1.5 font-label text-ink-muted">
                              <p>Method: {b.paymentMethod}</p>
                              <p>Plan: {b.paymentPlan}</p>
                              <p>Style: {b.safariStyle} · {b.accommodationTier}</p>
                              <p>Residency: {b.residencyStatus}</p>
                              <p>Departure: {formatDateLong(b.departureDate)}</p>
                              <p>Return: {formatDateLong(b.endDate)}</p>
                              {b.stripeSessionId ? <p className="break-all">Session: {b.stripeSessionId}</p> : null}
                              {b.stripePaymentIntentId ? (
                                <p className="break-all">Intent: {b.stripePaymentIntentId}</p>
                              ) : null}
                              <p>Created: {new Date(b.createdAt).toLocaleString()}</p>
                              <p>Updated: {new Date(b.updatedAt).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <Link
                                href={`/booking?expedition=${encodeURIComponent(
                                  b.expeditionId
                                )}&date=${b.departureDate}&guests=${b.guests}`}
                                className="btn btn-sm btn-outline"
                              >
                                Re-quote in engine
                              </Link>
                              <a
                                href={`mailto:${b.leadGuest?.email}?subject=${encodeURIComponent(
                                  `Jabali Trails — ${b.bookingReference}`
                                )}`}
                                className="btn btn-sm btn-solid"
                              >
                                Email guest
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Live UWA Permit Quota Override & Webhook Event Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* UWA Permit Quota Override Form */}
          <form
            onSubmit={handleOverrideQuota}
            className="lg:col-span-5 bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-8 shadow-card space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-label uppercase text-terracotta font-semibold">
              <Sliders className="w-4 h-4" />
              <span>Live UWA Sector Quota Control (`POST /api/availability`)</span>
            </div>
            <h3 className="font-display text-xl font-semibold text-heading">
              Adjust Daily Gorilla / Chimp Permit Allocation
            </h3>
            <p className="text-xs text-ink-muted">
              Update the base permit quota for any specific date and expedition. Changes reflect immediately on the live booking calendar.
            </p>

            <div>
              <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                Select Expedition
              </label>
              <select
                value={quotaExpId}
                onChange={(e) => setQuotaExpId(e.target.value)}
                className="w-full rounded-xl bg-field border border-line/20 px-3 py-2.5 text-xs font-semibold text-heading"
              >
                {EXPEDITIONS.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={quotaDate}
                  onChange={(e) => setQuotaDate(e.target.value)}
                  className="w-full rounded-xl bg-field border border-line/20 px-3 py-2 text-xs font-label text-heading"
                />
              </div>
              <div>
                <label className="block text-xs font-label uppercase text-ink-muted mb-1">
                  Permit Quota (0 = Sold Out)
                </label>
                <input
                  type="number"
                  min={0}
                  max={16}
                  value={quotaPermits}
                  onChange={(e) => setQuotaPermits(Number(e.target.value))}
                  className="w-full rounded-xl bg-field border border-line/20 px-3 py-2 text-xs font-label text-heading"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-canopy hover:bg-canopy-moss text-parchment text-xs font-semibold transition-all"
            >
              Save Live UWA Permit Quota
            </button>
          </form>

          {/* Live Stripe Webhook Event Log */}
          <div className="lg:col-span-7 bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-label uppercase text-terracotta font-semibold">
                  <Webhook className="w-4 h-4" />
                  <span>Stripe Webhook Event Log (`/api/webhooks/stripe`)</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-heading mt-1">
                  Recent Payment &amp; Session Events ({webhookEvents.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {webhookEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-surface border border-line/10 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-label font-bold text-heading">
                      {ev.eventType} → <span className="text-terracotta">{ev.bookingReference}</span>
                    </div>
                    <div className="font-label text-[11px] text-ink-muted">
                      Event ID: {ev.id} · Object: {ev.stripeObjectId}
                    </div>
                  </div>
                  <div className="text-right font-label text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-pos-soft text-pos font-semibold">
                      200 OK ({ev.status})
                    </span>
                    <div className="text-ink-muted mt-0.5">
                      {new Date(ev.processedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Custom Tailor-Made Inquiries Workflow */}
        <div className="bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-8 shadow-card space-y-4">
          <h2 className="font-display text-2xl font-semibold text-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-pos" />
            <span>Custom Tailor-Made Safari Inquiries ({inquiries.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inquiries.map((inq) => (
              <div
                key={inq.inquiryReference}
                className="p-5 rounded-2xl bg-surface border border-line/12 text-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label font-bold text-heading text-sm">
                    {inq.inquiryReference} · {inq.fullName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-acacia-light border border-acacia/40 font-label text-[10px] font-bold text-heading uppercase">
                    {inq.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-ink-muted">
                  {inq.email} · {inq.preferredMonth} ({inq.durationDays}) · {inq.guests} Guests
                </div>
                <div className="flex flex-wrap gap-1">
                  {(inq.interests || []).map((intItem, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-field border border-line/10 font-label text-[10px]"
                    >
                      {intItem}
                    </span>
                  ))}
                </div>
                <div className="pt-2 border-t border-line/10 flex items-center gap-2">
                  <span className="text-[11px] font-label text-ink-muted">Set Status:</span>
                  {(['new', 'proposal_sent', 'converted'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateInquiryStatus(inq.inquiryReference, st)}
                      className={`px-2.5 py-1 rounded-md font-label text-[10px] uppercase ${
                        inq.status === st
                          ? 'bg-canopy text-acacia font-bold'
                          : 'bg-field border border-line/15 text-ink hover:border-line'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Stripe Product Catalog Mapping */}
        <div className="bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-heading flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-terracotta" />
                <span>Stripe Product Catalog &amp; Default UWA Sector Permit Quotas</span>
              </h2>
              <p className="text-xs text-ink-muted">
                Configured in <code>src/data/expeditions.ts</code> &amp; <code>src/lib/stripe.ts</code>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line/15 font-label uppercase text-ink-muted">
                  <th className="py-3 px-3">Expedition</th>
                  <th className="py-3 px-3">Stripe Product ID</th>
                  <th className="py-3 px-3">Env Price Key</th>
                  <th className="py-3 px-3">Base Package</th>
                  <th className="py-3 px-3">UWA Permits</th>
                  <th className="py-3 px-3">Daily Sector Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {EXPEDITIONS.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface/60">
                    <td className="py-3.5 px-3 font-display font-semibold text-sm text-heading">
                      {exp.title} ({exp.durationDays}D)
                    </td>
                    <td className="py-3.5 px-3 font-label text-ink">
                      {exp.stripeProductId}
                    </td>
                    <td className="py-3.5 px-3 font-label text-ink-muted">
                      {exp.stripePriceEnvKey}
                    </td>
                    <td className="py-3.5 px-3 font-label font-semibold text-heading">
                      ${exp.basePriceUsd.toLocaleString()} USD
                    </td>
                    <td className="py-3.5 px-3 font-label text-terracotta">
                      {exp.gorillaPermitUsd + exp.chimpPermitUsd > 0
                        ? `+$${exp.gorillaPermitUsd + exp.chimpPermitUsd} USD`
                        : 'Included'}
                    </td>
                    <td className="py-3.5 px-3 font-label">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-surface-sunk text-heading">
                        <Users className="w-3 h-3 text-terracotta" />
                        {exp.dailyPermitQuota} permits/day ({exp.trekkingSector})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
