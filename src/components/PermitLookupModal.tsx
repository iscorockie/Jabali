'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BookingRecord } from '@/lib/pricing';
import { fetchBookingUniversal } from '@/lib/client-booking-engine';
import {
  Search,
  X,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface PermitLookupModalProps {
  onClose: () => void;
}

export default function PermitLookupModal({ onClose }: PermitLookupModalProps) {
  const [query, setQuery] = useState('');
  const [recentBookings, setRecentBookings] = useState<BookingRecord[]>([]);
  const [lookupResult, setLookupResult] = useState<BookingRecord | null>(null);
  const [searching, setSearching] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'
      );
      if (!dialog || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };
  }, [onClose]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('jabali_trails_bookings_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentBookings(parsed.slice(0, 5));
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const reference = query.trim();
    if (!reference || searching) return;
    setSearching(true);
    setLookupResult(null);
    setLookupMessage(null);
    try {
      const found = await fetchBookingUniversal({ ref: reference });
      setLookupResult(found);
      if (!found) {
        setLookupMessage('No booking found with that reference. Please check your confirmation email and try again.');
      }
    } catch {
      setLookupMessage('Unable to check your booking right now. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="permit-lookup-title"
        className="bg-surface-raised rounded-2xl border border-line/20 max-w-lg w-full shadow-elevated overflow-hidden my-8"
      >
        <div className="bg-canopy text-parchment px-6 py-5 flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] uppercase tracking-wider text-acacia flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" />
              UWA Permit &amp; Expedition Dossier Lookup
            </span>
            <h3
              id="permit-lookup-title"
              className="font-display text-xl font-semibold text-white mt-0.5"
            >
              Track Your Safari Reservation
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-parchment/75 hover:text-white hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleLookup} aria-busy={searching} className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <label htmlFor="permit-lookup-query" className="sr-only">Booking reference</label>
              <input
                ref={inputRef}
                id="permit-lookup-query"
                type="text"
                autoComplete="off"
                required
                disabled={searching}
                placeholder="Enter Booking Ref (e.g. JBL-2026-8419)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLookupResult(null);
                  setLookupMessage(null);
                }}
                className="w-full rounded-xl bg-field border border-field-line pl-9 pr-3.5 py-2.5 text-sm font-label text-heading"
              />
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" aria-hidden="true" />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-semibold transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {searching ? 'Checking...' : 'Find Dossier'}
            </button>
          </form>

          {lookupMessage && (
            <p role="alert" className="rounded-xl bg-surface border border-line/15 p-4 text-sm text-ink">
              {lookupMessage}
            </p>
          )}

          {lookupResult && (
            <div className="p-4 rounded-xl bg-surface border border-line/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs font-bold text-heading">
                  {lookupResult.bookingReference}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-label bg-pos-soft text-pos font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {lookupResult.status.toUpperCase()}
                </span>
              </div>
              <div className="font-display font-semibold text-base text-heading">
                {lookupResult.expeditionTitle}
              </div>
              <div className="text-xs text-ink-muted font-label">
                Departure: {lookupResult.departureDate} · {lookupResult.guests} Guest(s) ·{' '}
                {lookupResult.leadGuest.fullName}
              </div>
              <div className="pt-2 flex gap-2">
                <Link
                  href={`${lookupResult.status === 'pending_payment' ? '/booking/checkout' : '/booking/success'}?ref=${encodeURIComponent(
                    lookupResult.bookingReference
                  )}`}
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-canopy text-parchment text-xs font-semibold"
                >
                  <span>{lookupResult.status === 'pending_payment' ? 'Continue to Checkout' : 'Open Full Safari Dossier'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-acacia" />
                </Link>
              </div>
            </div>
          )}

          {recentBookings.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-line/10">
              <div className="text-xs font-label uppercase text-ink-muted">
                Recent Session Bookings ({recentBookings.length})
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-field border border-line/12 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label text-xs font-bold text-heading">
                          {b.bookingReference}
                        </span>
                        <span className="text-[10px] font-label px-2 py-0.5 rounded bg-surface-sunk text-heading">
                          {b.status === 'paid' ? 'PAID' : b.status === 'inquiry_hold' ? '48H HOLD' : 'PENDING'}
                        </span>
                      </div>
                      <div className="text-xs text-ink-muted truncate max-w-[230px]">
                        {b.expeditionTitle} ({b.departureDate})
                      </div>
                    </div>
                    <Link
                      href={
                        b.status === 'pending_payment'
                          ? `/booking/checkout?ref=${encodeURIComponent(b.bookingReference)}`
                          : `/booking/success?ref=${encodeURIComponent(b.bookingReference)}`
                      }
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-lg bg-terracotta text-white text-xs font-semibold shrink-0"
                    >
                      {b.status === 'pending_payment' ? 'Pay Now' : 'View'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-line/10 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-pos" />
              UWA E-Permit Sync Active
            </span>
            <Link
              href="/admin"
              onClick={onClose}
              className="font-label text-terracotta hover:underline flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Open Admin Operations Console</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
