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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [inquiries, setInquiries] = useState<Record<string, unknown>[]>([]);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  const loadData = async () => {
    let combined: BookingRecord[] = [];
    try {
      const raw = window.localStorage.getItem('jabali_trails_bookings_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) combined = parsed;
      }
    } catch {
      // Ignore
    }

    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bookings)) {
          for (const srvBooking of data.bookings) {
            if (
              !combined.some((b) => b.bookingReference === srvBooking.bookingReference)
            ) {
              combined.push(srvBooking);
            }
          }
        }
      }
    } catch {
      // Static Pages fallback
    }

    setBookings(combined);

    try {
      const inqRaw = window.localStorage.getItem('jabali_trails_inquiries_v1');
      if (inqRaw) {
        setInquiries(JSON.parse(inqRaw));
      }
    } catch {
      // Ignore
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
    setWebhookStatus(
      `Webhook ${res.eventType} processed for ${bookingRef} at ${new Date(
        res.processedAt
      ).toLocaleTimeString()}`
    );
    await loadData();
  };

  return (
    <div className="min-h-screen bg-parchment bg-topographic py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-canopy text-parchment rounded-3xl p-8 sm:p-10 shadow-elevated flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
              <Compass className="w-3.5 h-3.5" />
              KAMPALA &amp; BWINDI OPERATIONS CONSOLE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
              Field Inventory, Stripe Catalog &amp; Booking Ledger
            </h1>
            <p className="text-sm text-parchment/80 max-w-2xl">
              Admin-friendly operations view showing live bookings, UWA gorilla/chimpanzee permit allocations, Stripe Product IDs, and one-click webhook event testing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono-tech text-parchment"
            >
              <RefreshCw className="w-4 h-4 text-acacia" />
              <span>Refresh Ledger</span>
            </button>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold"
            >
              <Calendar className="w-4 h-4" />
              <span>Create Test Booking</span>
            </Link>
          </div>
        </div>

        {webhookStatus && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-mono-tech text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {webhookStatus}
            </span>
            <button
              type="button"
              onClick={() => setWebhookStatus(null)}
              className="underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Bookings Table */}
        <div className="bg-parchment-light rounded-3xl border border-canopy/15 p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-canopy">
                Active Safari Bookings &amp; Permit Holds ({bookings.length})
              </h2>
              <p className="text-xs text-bark-muted">
                Bookings created via Stripe Checkout, Stripe Payment Element, or 48h Inquiry Hold
              </p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-parchment border border-canopy/10 text-center space-y-3">
              <p className="text-sm text-bark-muted">
                No bookings recorded in this session yet. Launch the booking engine to test a Stripe Checkout or Payment Element reservation.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta text-white text-xs font-semibold"
              >
                <span>Open Booking Engine</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-canopy/15 font-mono-tech uppercase text-bark-muted">
                    <th className="py-3 px-3">Booking Ref</th>
                    <th className="py-3 px-3">Expedition</th>
                    <th className="py-3 px-3">Departure</th>
                    <th className="py-3 px-3">Lead Traveler</th>
                    <th className="py-3 px-3">Due / Paid</th>
                    <th className="py-3 px-3">Status &amp; UWA Docket</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canopy/10">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-parchment/60">
                      <td className="py-3.5 px-3 font-mono-tech font-bold text-canopy">
                        {b.bookingReference}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-canopy">
                        {b.expeditionTitle}
                      </td>
                      <td className="py-3.5 px-3 font-mono-tech">
                        {b.departureDate} ({b.guests} pax)
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-canopy">{b.leadGuest.fullName}</div>
                        <div className="text-[11px] text-bark-muted">{b.leadGuest.email}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono-tech font-semibold text-canopy">
                        ${b.pricing.payableNowUsd.toLocaleString()} USD
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono-tech text-[10px] font-bold ${
                            b.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-900'
                              : b.status === 'inquiry_hold'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                        {b.uwaPermitDocketNumber && (
                          <div className="font-mono-tech text-[10px] text-bark-muted mt-1">
                            {b.uwaPermitDocketNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        {b.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaidViaWebhook(b.bookingReference)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-canopy text-acacia font-mono-tech text-[11px]"
                          >
                            <Webhook className="w-3 h-3" />
                            <span>Simulate Webhook Paid</span>
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
          )}
        </div>

        {/* Stripe Product & UWA Permit Inventory Mapping Table */}
        <div className="bg-parchment-light rounded-3xl border border-canopy/15 p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-canopy flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-terracotta" />
                <span>Stripe Product Catalog &amp; UWA Sector Permit Quotas</span>
              </h2>
              <p className="text-xs text-bark-muted">
                Configured in <code>src/data/expeditions.ts</code> &amp; <code>src/lib/stripe.ts</code>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-canopy/15 font-mono-tech uppercase text-bark-muted">
                  <th className="py-3 px-3">Expedition</th>
                  <th className="py-3 px-3">Stripe Product ID</th>
                  <th className="py-3 px-3">Env Price Key</th>
                  <th className="py-3 px-3">Base Package</th>
                  <th className="py-3 px-3">UWA Permits</th>
                  <th className="py-3 px-3">Daily Sector Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canopy/10">
                {EXPEDITIONS.map((exp) => (
                  <tr key={exp.id} className="hover:bg-parchment/60">
                    <td className="py-3.5 px-3 font-serif font-semibold text-sm text-canopy">
                      {exp.title} ({exp.durationDays}D)
                    </td>
                    <td className="py-3.5 px-3 font-mono-tech text-bark">
                      {exp.stripeProductId}
                    </td>
                    <td className="py-3.5 px-3 font-mono-tech text-bark-muted">
                      {exp.stripePriceEnvKey}
                    </td>
                    <td className="py-3.5 px-3 font-mono-tech font-semibold text-canopy">
                      ${exp.basePriceUsd.toLocaleString()} USD
                    </td>
                    <td className="py-3.5 px-3 font-mono-tech text-terracotta">
                      {exp.gorillaPermitUsd + exp.chimpPermitUsd > 0
                        ? `+$${exp.gorillaPermitUsd + exp.chimpPermitUsd} USD`
                        : 'Included'}
                    </td>
                    <td className="py-3.5 px-3 font-mono-tech">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-parchment-dark text-canopy">
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

        {/* Custom Inquiries Log */}
        {inquiries.length > 0 && (
          <div className="bg-parchment-light rounded-3xl border border-canopy/15 p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="font-serif text-xl font-semibold text-canopy flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Custom Tailor-Made Inquiries ({inquiries.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiries.map((inq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-parchment border border-canopy/10 text-xs space-y-1"
                >
                  <div className="font-mono-tech font-bold text-canopy">
                    {String(inq.inquiryReference || 'JBL-INQ')} · {String(inq.fullName || '')}
                  </div>
                  <div className="text-bark-muted">
                    {String(inq.email || '')} · {String(inq.preferredMonth || '')} ({String(inq.durationDays || '')})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
