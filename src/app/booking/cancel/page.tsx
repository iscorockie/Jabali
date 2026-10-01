'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Phone,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';

function BookingCancelContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';

  return (
    <div className="min-h-screen bg-parchment bg-topographic py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-parchment-light rounded-3xl border border-canopy/15 p-8 sm:p-12 shadow-elevated space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-700" />
        </div>

        <div className="space-y-2">
          <span className="font-mono-tech text-xs uppercase tracking-widest text-terracotta font-semibold">
            Stripe Checkout Paused {ref ? `· Ref ${ref}` : ''}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-canopy">
            No Charge Was Made to Your Card
          </h1>
          <p className="text-sm sm:text-base text-bark-muted leading-relaxed">
            Your payment session was cancelled before completion. Because Uganda Wildlife Authority (UWA) mountain gorilla and chimpanzee permits are held in real time, your selected dates remain open for immediate re-booking or a complimentary 48-hour inquiry hold.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-parchment border border-canopy/10 space-y-2 text-xs text-bark-muted">
          <div className="flex items-center gap-2 font-semibold text-canopy">
            <ShieldCheck className="w-4 h-4 text-terracotta" />
            <span>Need to pay via International Bank Wire or Corporate Card?</span>
          </div>
          <p>
            Select the <strong>48-Hour Inquiry Hold</strong> option on the booking page to lock your UWA permit quota while our Kampala finance desk issues an official wire invoice.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/booking"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-semibold text-sm shadow-sm transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Return &amp; Retry Stripe Checkout</span>
          </Link>
          <Link
            href="/booking?mode=inquiry"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-canopy hover:bg-canopy-moss text-parchment font-semibold text-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-acacia" />
            <span>Place 48h Permit Hold Instead</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-canopy/10 flex flex-wrap items-center justify-between gap-2 text-xs text-bark-muted">
          <Link
            href="/expeditions"
            className="inline-flex items-center gap-1 hover:text-canopy font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Expeditions</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 font-mono-tech">
            <Phone className="w-3.5 h-3.5 text-terracotta" />
            Kampala Desk: +256 (0) 772 841 920
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BookingCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-parchment" />}>
      <BookingCancelContent />
    </Suspense>
  );
}
