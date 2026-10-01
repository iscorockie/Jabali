'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

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
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-label text-parchment"
            >
              <RefreshCw className="w-4 h-4 text-acacia" />
              <span>Sync Server Ledger</span>
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

        {/* 1. Live Bookings Table */}
        <div className="bg-surface-raised rounded-3xl border border-line/15 p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-heading">
                Active Safari Bookings &amp; UWA Permit Dockets ({bookings.length})
              </h2>
              <p className="text-xs text-ink-muted">
                Backed by <code>/api/bookings</code> &amp; <code>/api/webhooks/stripe</code>
              </p>
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
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface/60">
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
