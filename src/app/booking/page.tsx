'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BOOKING_ADDONS, EXPEDITIONS, getExpeditionById } from '@/data/expeditions';
import {
  AccommodationTier,
  DayAvailability,
  PaymentGatewayMode,
  PaymentPlan,
  ResidencyStatus,
  SafariStyle,
  calculateBookingPricing,
} from '@/lib/pricing';
import {
  fetchAvailabilityUniversal,
  createCheckoutUniversal,
  createPaymentIntentUniversal,
} from '@/lib/client-booking-engine';
import StripeEmbeddedPaymentModal from '@/components/StripeEmbeddedPaymentModal';
import {
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  Compass,
  AlertCircle,
  Loader2,
  Briefcase,
  FileText,
  HelpCircle,
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const PACKING_ITEMS = [
  { id: 'boots', item: 'Waterproof ankle-high hiking boots (broken in before Bwindi)' },
  { id: 'gaiters', item: 'Breathable trail gaiters & thick merino trekking socks (tuck trousers in for safari ants)' },
  { id: 'gloves', item: 'Lightweight gardening/trekking gloves (protects hands from thorny vines & nettles)' },
  { id: 'rain', item: 'Packable Gore-Tex rain jacket & waterproof camera dry-bag' },
  { id: 'neutral', item: 'Long-sleeved neutral bush shirts (olive, khaki, tan — avoid bright blue which attracts tsetse flies)' },
  { id: 'yellowfever', item: 'Yellow Fever Vaccination Certificate & Passport (6+ months validity for Entebbe arrival)' },
];

function BookingEngineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialExpeditionId =
    searchParams.get('expedition') && getExpeditionById(searchParams.get('expedition')!)
      ? searchParams.get('expedition')!
      : EXPEDITIONS[0].id;

  const initialDate = searchParams.get('date') || '2026-11-14';
  const initialGuests = Number(searchParams.get('guests')) || 2;
  const initialMode = searchParams.get('mode') === 'inquiry' ? 'inquiry-hold' : 'stripe-checkout';

  const [expeditionId, setExpeditionId] = useState<string>(initialExpeditionId);
  const [departureDate, setDepartureDate] = useState<string>(initialDate);
  const [calendarYear, setCalendarYear] = useState<number>(() => {
    const y = parseInt(initialDate.split('-')[0], 10);
    return isNaN(y) ? 2026 : y;
  });
  const [calendarMonth, setCalendarMonth] = useState<number>(() => {
    const m = parseInt(initialDate.split('-')[1], 10);
    return isNaN(m) ? 11 : m;
  });

  const [availabilityDays, setAvailabilityDays] = useState<DayAvailability[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState<boolean>(false);

  const [guests, setGuests] = useState<number>(initialGuests);
  const [safariStyle, setSafariStyle] = useState<SafariStyle>('shared');
  const [accommodationTier, setAccommodationTier] = useState<AccommodationTier>('signature');
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>('foreign-non-resident');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>('deposit-plus-permits');
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentGatewayMode>(
    initialMode as PaymentGatewayMode
  );
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'UGX'>('USD');

  const currencyInfo = useMemo(() => {
    switch (displayCurrency) {
      case 'EUR':
        return { symbol: '€', rate: 0.92, code: 'EUR' };
      case 'GBP':
        return { symbol: '£', rate: 0.78, code: 'GBP' };
      case 'UGX':
        return { symbol: 'USh ', rate: 3720, code: 'UGX' };
      default:
        return { symbol: '$', rate: 1, code: 'USD' };
    }
  }, [displayCurrency]);

  const formatAmount = (usd: number) => {
    const converted = Math.round(usd * currencyInfo.rate);
    return `${currencyInfo.symbol}${converted.toLocaleString()}`;
  };

  // Guest Manifest State
  const [fullName, setFullName] = useState('Dr. Clara Reynolds');
  const [email, setEmail] = useState('clara.reynolds@example.com');
  const [phone, setPhone] = useState('+1 (415) 890-4321');
  const [nationality, setNationality] = useState('United States');
  const [passportNumber, setPassportNumber] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Moderate (Regular Hiker)');
  const [dietaryOrMedicalNotes, setDietaryOrMedicalNotes] = useState('');

  // Submission & Embedded Payment Modal State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [embeddedModalData, setEmbeddedModalData] = useState<{
    clientSecret: string;
    paymentIntentId: string;
    bookingReference: string;
    payableNowUsd: number;
    mode: string;
  } | null>(null);

  // Interactive Packing List State
  const [checkedGear, setCheckedGear] = useState<Record<string, boolean>>({
    boots: true,
    yellowfever: true,
  });

  const selectedExpedition = useMemo(
    () => getExpeditionById(expeditionId) || EXPEDITIONS[0],
    [expeditionId]
  );

  // Fetch Real-Time Calendar Availability (Works on both Server API and Static GitHub Pages)
  useEffect(() => {
    let active = true;
    setLoadingCalendar(true);
    fetchAvailabilityUniversal(expeditionId, calendarYear, calendarMonth)
      .then((days) => {
        if (!active) return;
        setAvailabilityDays(days);
        const currentSelected = days.find(
          (d: DayAvailability) => d.date === departureDate
        );
        if (currentSelected && currentSelected.status === 'sold-out') {
          const firstAvailable = days.find(
            (d: DayAvailability) => d.status === 'available' || d.status === 'limited'
          );
          if (firstAvailable) {
            setDepartureDate(firstAvailable.date);
          }
        }
      })
      .finally(() => {
        if (active) setLoadingCalendar(false);
      });

    return () => {
      active = false;
    };
  }, [expeditionId, calendarYear, calendarMonth, departureDate]);

  const selectedDayInfo = useMemo(() => {
    return availabilityDays.find((d) => d.date === departureDate);
  }, [availabilityDays, departureDate]);

  const pricing = useMemo(() => {
    return calculateBookingPricing({
      expeditionId,
      departureDate,
      guests,
      safariStyle,
      accommodationTier,
      residencyStatus,
      paymentPlan,
      addonIds,
    });
  }, [
    expeditionId,
    departureDate,
    guests,
    safariStyle,
    accommodationTier,
    residencyStatus,
    paymentPlan,
    addonIds,
  ]);

  const handleToggleAddon = (id: string) => {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarYear((y) => y - 1);
      setCalendarMonth(12);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarYear((y) => y + 1);
      setCalendarMonth(1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const firstDayWeekday = useMemo(() => {
    return new Date(Date.UTC(calendarYear, calendarMonth - 1, 1)).getUTCDay();
  }, [calendarYear, calendarMonth]);

  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      expeditionId,
      departureDate,
      guests,
      safariStyle,
      accommodationTier,
      residencyStatus,
      paymentPlan,
      addonIds,
      paymentMethod,
      leadGuest: {
        fullName,
        email,
        phone,
        nationality,
        passportNumber,
        fitnessLevel,
        dietaryOrMedicalNotes,
      },
    };

    try {
      if (paymentMethod === 'stripe-elements') {
        const data = await createPaymentIntentUniversal(payload);
        setEmbeddedModalData({
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
          bookingReference: data.bookingReference,
          payableNowUsd: data.payableNowUsd,
          mode: data.mode,
        });
        setSubmitting(false);
        return;
      }

      // Stripe Hosted Checkout OR 48-Hour Inquiry Hold
      const data = await createCheckoutUniversal(payload);

      if (data.checkoutUrl.startsWith('http')) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(data.checkoutUrl);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'An unexpected booking error occurred.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment bg-topographic">
      {/* Page Header */}
      <section className="bg-canopy text-parchment py-12 sm:py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acacia/20 border border-acacia/40 text-acacia font-mono-tech text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                REAL-TIME UWA PERMIT QUOTA &amp; STRIPE PAYMENT ENGINE
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight">
                Plan Your Expedition &amp; Lock Permits
              </h1>
              <p className="text-parchment/80 text-sm sm:text-base leading-relaxed">
                Select your expedition, pick an available departure date from our live UWA permit calendar, customize your safari tier, and complete your reservation securely via Stripe Checkout or Embedded Payment Element.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-mono-tech">
              <div className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-acacia" />
                <span>Official UWA Permit Escrow</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Stripe 256-Bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Engine Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleCompleteBooking}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
          >
            {/* LEFT 7 COLUMNS: 3-STEP INTERACTIVE CONFIGURATOR */}
            <div className="lg:col-span-7 space-y-8">
              {/* STEP 1: EXPEDITION & REAL-TIME PERMIT CALENDAR */}
              <div className="bg-parchment-light rounded-2xl border border-canopy/15 p-6 sm:p-8 shadow-card space-y-6">
                <div className="flex items-center justify-between border-b border-canopy/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-canopy text-acacia font-mono-tech text-sm font-bold flex items-center justify-center">
                      01
                    </span>
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-semibold text-canopy">
                        Select Expedition &amp; Departure Date
                      </h2>
                      <p className="text-xs text-bark-muted">
                        Live Uganda Wildlife Authority (UWA) daily sector permit quota
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expedition Selector */}
                <div>
                  <label
                    htmlFor="booking-expedition-select"
                    className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2"
                  >
                    Choose Guided Expedition Itinerary
                  </label>
                  <select
                    id="booking-expedition-select"
                    value={expeditionId}
                    onChange={(e) => setExpeditionId(e.target.value)}
                    className="w-full rounded-xl bg-white border-2 border-canopy/20 px-4 py-3.5 text-sm sm:text-base font-semibold text-canopy focus:outline-none focus:border-terracotta"
                  >
                    {EXPEDITIONS.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.title} — {exp.durationDays} Days (From ${exp.basePriceUsd.toLocaleString()}{' '}
                        {exp.gorillaPermitUsd > 0 ? `+ $${exp.gorillaPermitUsd} Gorilla Permit` : ''})
                      </option>
                    ))}
                  </select>

                  {/* Selected Expedition Quick Summary Strip */}
                  <div className="mt-3 p-3.5 rounded-xl bg-parchment border border-canopy/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-canopy font-medium">
                      <Compass className="w-4 h-4 text-terracotta shrink-0" />
                      <span>
                        {selectedExpedition.primaryPark} ·{' '}
                        <span className="font-mono-tech text-bark-muted">
                          {selectedExpedition.trekkingSector}
                        </span>
                      </span>
                    </div>
                    <span className="font-mono-tech text-emerald-800 font-semibold">
                      {selectedExpedition.permitSummary}
                    </span>
                  </div>
                </div>

                {/* Interactive Availability Calendar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted">
                        Real-Time Departure &amp; Permit Calendar
                      </span>
                      <span className="text-xs text-bark-subtle">
                        Click any available date to lock your departure window
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg border border-canopy/15 hover:bg-parchment-dark text-canopy"
                        aria-label="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-serif font-semibold text-base text-canopy min-w-[140px] text-center">
                        {MONTH_NAMES[calendarMonth - 1]} {calendarYear}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg border border-canopy/15 hover:bg-parchment-dark text-canopy"
                        aria-label="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono-tech text-bark-muted bg-parchment px-3.5 py-2 rounded-lg border border-canopy/8">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      Available (4–8 Permits)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Limited (1–3 Permits Left)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      Sold Out / Locked
                    </span>
                    <span className="ml-auto text-emerald-800 font-semibold">
                      Apr, May &amp; Nov = Emerald Season Discount (-$
                      {selectedExpedition.greenSeasonDiscountUsd}/pp)
                    </span>
                  </div>

                  {/* Calendar Grid */}
                  <div className="bg-white rounded-xl border border-canopy/15 p-3 sm:p-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-mono-tech uppercase text-bark-muted pb-2 border-b border-canopy/10">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>

                    {loadingCalendar ? (
                      <div className="py-12 flex items-center justify-center gap-2 text-sm text-bark-muted">
                        <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
                        <span>Syncing UWA sector permit inventory...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-7 gap-1.5 pt-2">
                        {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="h-14 sm:h-16" />
                        ))}

                        {availabilityDays.map((dayObj) => {
                          const dayNum = parseInt(dayObj.date.split('-')[2], 10);
                          const isSelected = dayObj.date === departureDate;
                          const isDisabled =
                            dayObj.status === 'sold-out' || dayObj.status === 'past';

                          return (
                            <button
                              key={dayObj.date}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setDepartureDate(dayObj.date)}
                              className={`h-14 sm:h-16 rounded-lg p-1.5 flex flex-col justify-between text-left border transition-all ${
                                isSelected
                                  ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta shadow-sm'
                                  : isDisabled
                                  ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-65'
                                  : dayObj.status === 'limited'
                                  ? 'bg-amber-50/70 hover:bg-amber-100/80 text-canopy border-amber-300'
                                  : 'bg-emerald-50/50 hover:bg-emerald-100/70 text-canopy border-emerald-200/80'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-mono-tech text-xs font-bold">
                                  {dayNum}
                                </span>
                                {dayObj.isGreenSeason && !isDisabled && (
                                  <span
                                    className={`text-[9px] font-mono-tech px-1 rounded ${
                                      isSelected
                                        ? 'bg-acacia text-canopy'
                                        : 'bg-emerald-700 text-white'
                                    }`}
                                  >
                                    GREEN
                                  </span>
                                )}
                              </div>

                              <div className="text-[10px] font-mono-tech leading-tight truncate w-full">
                                {dayObj.status === 'past' ? (
                                  <span>Past</span>
                                ) : dayObj.status === 'sold-out' ? (
                                  <span className="text-stone-400">Sold Out</span>
                                ) : (
                                  <span
                                    className={
                                      isSelected
                                        ? 'text-acacia font-semibold'
                                        : dayObj.status === 'limited'
                                        ? 'text-amber-800 font-semibold'
                                        : 'text-emerald-800'
                                    }
                                  >
                                    {dayObj.permitsRemaining} left
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected Date Status Banner */}
                  <div className="p-3.5 rounded-xl bg-canopy/5 border border-canopy/15 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-bark-muted">Selected Departure: </span>
                      <strong className="font-mono-tech text-canopy">
                        {departureDate} → {pricing.endDate}
                      </strong>{' '}
                      <span className="px-2 py-0.5 rounded bg-parchment-dark font-mono-tech text-[11px] text-canopy ml-1">
                        {pricing.seasonName}
                      </span>
                    </div>
                    {selectedDayInfo && selectedDayInfo.permitsRemaining > 0 && (
                      <span className="font-mono-tech text-emerald-800 font-semibold">
                        ✓ {selectedDayInfo.permitsRemaining} UWA permits confirmed available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 2: GROUP SIZE, SAFARI STYLE, RESIDENCY & UPGRADES */}
              <div className="bg-parchment-light rounded-2xl border border-canopy/15 p-6 sm:p-8 shadow-card space-y-6">
                <div className="flex items-center gap-3 border-b border-canopy/10 pb-4">
                  <span className="w-8 h-8 rounded-lg bg-canopy text-acacia font-mono-tech text-sm font-bold flex items-center justify-center">
                    02
                  </span>
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-semibold text-canopy">
                      Configure Group, Permits &amp; Safari Tier
                    </h2>
                    <p className="text-xs text-bark-muted">
                      Tailor your vehicle privacy, lodge tier, and official UWA permit category
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Number of Guests */}
                  <div>
                    <label
                      htmlFor="booking-guests"
                      className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2"
                    >
                      Number of Travelers
                    </label>
                    <div className="relative">
                      <select
                        id="booking-guests"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full rounded-xl bg-white border border-canopy/20 px-4 py-3 text-sm font-semibold text-canopy"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'Traveler' : 'Travelers'}
                          </option>
                        ))}
                      </select>
                      <Users className="w-4 h-4 text-terracotta absolute right-9 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* UWA Residency Category */}
                  <div>
                    <label
                      htmlFor="booking-residency"
                      className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2"
                    >
                      UWA Permit Residency Category
                    </label>
                    <select
                      id="booking-residency"
                      value={residencyStatus}
                      onChange={(e) => setResidencyStatus(e.target.value as ResidencyStatus)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-4 py-3 text-sm font-semibold text-canopy"
                    >
                      <option value="foreign-non-resident">
                        Foreign Non-Resident ($800 Gorilla / $250 Chimp)
                      </option>
                      <option value="foreign-resident">
                        East Africa Foreign Resident ($700 Gorilla / $200 Chimp)
                      </option>
                      <option value="eac-citizen">
                        East African Community Citizen ($80 Gorilla / $30 Chimp)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Safari Style: Shared Small Group vs Private 4x4 */}
                <div>
                  <span className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2">
                    Safari Vehicle &amp; Guiding Mode
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSafariStyle('shared')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        safariStyle === 'shared'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15 hover:border-canopy/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-base">
                          Small-Group Departure
                        </span>
                        <span className="font-mono-tech text-xs text-acacia">Included</span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          safariStyle === 'shared' ? 'text-parchment/80' : 'text-bark-muted'
                        }`}
                      >
                        Capped at max 6 guests per extended 4x4 Land Cruiser. Window seat guaranteed.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSafariStyle('private')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        safariStyle === 'private'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15 hover:border-canopy/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-base">
                          Private 4x4 Charter
                        </span>
                        <span className="font-mono-tech text-xs text-acacia">
                          +${selectedExpedition.privateVehicleUpgradePerPersonUsd}/pp
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          safariStyle === 'private' ? 'text-parchment/80' : 'text-bark-muted'
                        }`}
                      >
                        Exclusive vehicle &amp; private lead naturalist solely for your party.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Accommodation Tier */}
                <div>
                  <span className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2">
                    Sanctuary &amp; Lodge Tier
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccommodationTier('signature')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        accommodationTier === 'signature'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15 hover:border-canopy/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-base">
                          Signature Forest Eco-Lodges
                        </span>
                        <span className="font-mono-tech text-xs text-acacia">Base Tier</span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          accommodationTier === 'signature'
                            ? 'text-parchment/80'
                            : 'text-bark-muted'
                        }`}
                      >
                        Authentic, handpicked timbered lodges &amp; tented camps at the park gates.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccommodationTier('luxury')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        accommodationTier === 'luxury'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15 hover:border-canopy/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-base">
                          Premier Luxury Sanctuaries
                        </span>
                        <span className="font-mono-tech text-xs text-acacia">
                          +${selectedExpedition.luxuryLodgeUpgradePerPersonUsd}/pp
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          accommodationTier === 'luxury'
                            ? 'text-parchment/80'
                            : 'text-bark-muted'
                        }`}
                      >
                        Clouds Mountain Gorilla Lodge, Nile Safari Lodge &amp; Kyambura Gorge suites.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Optional Add-ons */}
                <div>
                  <span className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2">
                    Optional Field Upgrades &amp; Bush Flights
                  </span>
                  <div className="space-y-2.5">
                    {BOOKING_ADDONS.map((addon) => {
                      const isChecked = addonIds.includes(addon.id);
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-acacia-light border-acacia shadow-sm'
                              : 'bg-white border-canopy/15 hover:border-canopy/35'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAddon(addon.id)}
                            className="mt-1 h-4 w-4 rounded border-canopy text-terracotta focus:ring-terracotta"
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-serif font-semibold text-sm text-canopy">
                                {addon.name}
                              </span>
                              <span className="font-mono-tech text-xs font-bold text-terracotta">
                                +${addon.priceUsd}/pp
                              </span>
                            </div>
                            <p className="text-xs text-bark-muted mt-1 leading-relaxed">
                              {addon.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Plan Selector */}
                <div>
                  <span className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2">
                    Payment Schedule
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentPlan('deposit-plus-permits')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentPlan === 'deposit-plus-permits'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-sm">
                          30% Deposit + 100% UWA Permits
                        </span>
                        <span className="font-mono-tech text-xs text-acacia">Recommended</span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          paymentPlan === 'deposit-plus-permits'
                            ? 'text-parchment/80'
                            : 'text-bark-muted'
                        }`}
                      >
                        Secures your UWA permits immediately; balance due 60 days before departure.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentPlan('full')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentPlan === 'full'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-sm">
                          100% Full Expedition Settlement
                        </span>
                        <span className="font-mono-tech text-xs text-acacia">Single Payment</span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          paymentPlan === 'full' ? 'text-parchment/80' : 'text-bark-muted'
                        }`}
                      >
                        Pay the complete safari package and permit total in one Stripe transaction.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3: GUEST MANIFEST & STRIPE PAYMENT METHOD */}
              <div className="bg-parchment-light rounded-2xl border border-canopy/15 p-6 sm:p-8 shadow-card space-y-6">
                <div className="flex items-center gap-3 border-b border-canopy/10 pb-4">
                  <span className="w-8 h-8 rounded-lg bg-canopy text-acacia font-mono-tech text-sm font-bold flex items-center justify-center">
                    03
                  </span>
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-semibold text-canopy">
                      Lead Traveler Details &amp; Stripe Payment
                    </h2>
                    <p className="text-xs text-bark-muted">
                      Used for official UWA permit registration and your Stripe booking receipt
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="guest-name"
                      className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                    >
                      Lead Traveler Full Name (As on Passport) *
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guest-email"
                      className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                    >
                      Email Address (For Dossier &amp; Receipt) *
                    </label>
                    <input
                      id="guest-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guest-phone"
                      className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                    >
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      id="guest-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guest-nationality"
                      className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                    >
                      Passport Nationality *
                    </label>
                    <input
                      id="guest-nationality"
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guest-passport"
                      className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                    >
                      Passport Number (Optional — can provide later for UWA)
                    </label>
                    <input
                      id="guest-passport"
                      type="text"
                      placeholder="e.g. N8492019"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm font-mono-tech text-canopy"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="guest-fitness"
                      className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                    >
                      Trekking Pace Preference (For Gorilla Group Allocation)
                    </label>
                    <select
                      id="guest-fitness"
                      value={fitnessLevel}
                      onChange={(e) => setFitnessLevel(e.target.value)}
                      className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2.5 text-sm text-canopy"
                    >
                      <option value="Easy–Moderate (Prefer Shorter Sector Hike)">
                        Easy–Moderate (Prefer Shorter Sector Hike)
                      </option>
                      <option value="Moderate (Regular Hiker)">
                        Moderate (Regular Hiker — 2 to 4 hrs)
                      </option>
                      <option value="High / Adventurous (Steep Ridge Families Welcome)">
                        High / Adventurous (Steep Ridge Families Welcome)
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="guest-notes"
                    className="block text-xs font-mono-tech uppercase text-bark-muted mb-1"
                  >
                    Dietary Requirements, Rooming Configuration, or Special Requests
                  </label>
                  <textarea
                    id="guest-notes"
                    rows={2}
                    value={dietaryOrMedicalNotes}
                    onChange={(e) => setDietaryOrMedicalNotes(e.target.value)}
                    placeholder="e.g. 1 Double Suite, vegetarian meals, celebrating anniversary..."
                    className="w-full rounded-xl bg-white border border-canopy/20 px-3.5 py-2 text-sm text-canopy"
                  />
                </div>

                {/* Payment Gateway Mode Selector */}
                <div className="pt-2">
                  <span className="block text-xs font-mono-tech uppercase tracking-wider text-bark-muted mb-2">
                    Choose Stripe Checkout Experience or Inquiry Hold
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe-checkout')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'stripe-checkout'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15'
                      }`}
                    >
                      <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-acacia" />
                        <span>Stripe Checkout</span>
                      </div>
                      <p
                        className={`text-[11px] mt-1 ${
                          paymentMethod === 'stripe-checkout'
                            ? 'text-parchment/80'
                            : 'text-bark-muted'
                        }`}
                      >
                        Hosted Stripe Checkout page with itemized receipt.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('stripe-elements')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'stripe-elements'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15'
                      }`}
                    >
                      <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-acacia" />
                        <span>Payment Element</span>
                      </div>
                      <p
                        className={`text-[11px] mt-1 ${
                          paymentMethod === 'stripe-elements'
                            ? 'text-parchment/80'
                            : 'text-bark-muted'
                        }`}
                      >
                        Embedded in-page Stripe card form without leaving site.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('inquiry-hold')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        paymentMethod === 'inquiry-hold'
                          ? 'bg-canopy text-parchment border-canopy ring-2 ring-terracotta'
                          : 'bg-white text-bark border-canopy/15'
                      }`}
                    >
                      <div className="font-serif font-semibold text-sm flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-acacia" />
                        <span>48h Inquiry Hold</span>
                      </div>
                      <p
                        className={`text-[11px] mt-1 ${
                          paymentMethod === 'inquiry-hold'
                            ? 'text-parchment/80'
                            : 'text-bark-muted'
                        }`}
                      >
                        Hold permit quota for 48 hours &amp; speak with our Kampala desk.
                      </p>
                    </button>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-xl bg-terracotta hover:bg-terracotta-hover disabled:opacity-60 text-white font-semibold text-base shadow-elevated flex items-center justify-center gap-2.5 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Initializing Secure Session...</span>
                    </>
                  ) : paymentMethod === 'inquiry-hold' ? (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>Submit 48-Hour Permit Hold &amp; Custom Request</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>
                        {paymentMethod === 'stripe-checkout'
                          ? `Proceed to Stripe Checkout ($${pricing.payableNowUsd.toLocaleString()} USD)`
                          : `Pay $${pricing.payableNowUsd.toLocaleString()} USD with Stripe Payment Element`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT 5 COLUMNS: STICKY ITEMIZED SAFARI DOSSIER & RECEIPT */}
            <aside className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="bg-parchment-light rounded-2xl border-2 border-canopy/20 shadow-elevated overflow-hidden">
                {/* Dossier Header */}
                <div className="relative h-44 bg-canopy">
                  <img
                    src={selectedExpedition.heroImage}
                    alt={selectedExpedition.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canopy via-canopy/55 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-parchment">
                    <span className="font-mono-tech text-[11px] uppercase tracking-wider text-acacia">
                      LIVE SAFARI COST &amp; PERMIT LEDGER
                    </span>
                    <h3 className="font-serif text-xl font-semibold text-white leading-snug mt-0.5">
                      {selectedExpedition.title}
                    </h3>
                  </div>
                </div>

                {/* Line Items */}
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-parchment border border-canopy/10 text-xs">
                    <div>
                      <span className="block text-[10px] font-mono-tech uppercase text-bark-muted">
                        DEPARTURE
                      </span>
                      <strong className="font-mono-tech text-canopy">{departureDate}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono-tech uppercase text-bark-muted">
                        RETURN
                      </span>
                      <strong className="font-mono-tech text-canopy">{pricing.endDate}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono-tech uppercase text-bark-muted">
                        PARTY SIZE
                      </span>
                      <strong className="font-mono-tech text-canopy">
                        {guests} {guests === 1 ? 'Traveler' : 'Travelers'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono-tech uppercase text-bark-muted">
                        SEASON
                      </span>
                      <strong className="font-mono-tech text-emerald-800">
                        {pricing.seasonName}
                      </strong>
                    </div>
                  </div>

                  {/* Itemized Breakdown */}
                  <div className="space-y-3 text-xs sm:text-sm border-b border-canopy/10 pb-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-medium text-canopy">
                          Base Expedition Package ({selectedExpedition.durationDays} Days)
                        </div>
                        <div className="text-xs text-bark-muted font-mono-tech">
                          ${pricing.effectiveBasePerPersonUsd.toLocaleString()} × {guests} guest(s)
                        </div>
                      </div>
                      <span className="font-mono-tech font-semibold text-canopy">
                        ${pricing.safariPackageSubtotalUsd.toLocaleString()}
                      </span>
                    </div>

                    {pricing.isGreenSeason && (
                      <div className="flex justify-between items-center text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg font-mono-tech">
                        <span>Emerald Green Season Savings Applied</span>
                        <span>
                          -$
                          {(
                            pricing.greenSeasonDiscountPerPersonUsd * guests
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* UWA Gorilla Permit */}
                    {pricing.gorillaPermitPerPersonUsd > 0 && (
                      <div className="flex justify-between items-start gap-2 p-2.5 rounded-lg bg-acacia-light/70 border border-acacia/30">
                        <div>
                          <div className="font-semibold text-canopy flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
                            <span>Official UWA Mountain Gorilla Permit</span>
                          </div>
                          <div className="text-[11px] text-bark-muted font-mono-tech">
                            ${pricing.gorillaPermitPerPersonUsd} × {guests} ({selectedExpedition.trekkingSector})
                          </div>
                        </div>
                        <span className="font-mono-tech font-semibold text-canopy">
                          ${(pricing.gorillaPermitPerPersonUsd * guests).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* UWA Chimp Permit */}
                    {pricing.chimpPermitPerPersonUsd > 0 && (
                      <div className="flex justify-between items-start gap-2 p-2.5 rounded-lg bg-acacia-light/70 border border-acacia/30">
                        <div>
                          <div className="font-semibold text-canopy flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
                            <span>Official UWA Kibale Chimpanzee Permit</span>
                          </div>
                          <div className="text-[11px] text-bark-muted font-mono-tech">
                            ${pricing.chimpPermitPerPersonUsd} × {guests} (Kanyanchu)
                          </div>
                        </div>
                        <span className="font-mono-tech font-semibold text-canopy">
                          ${(pricing.chimpPermitPerPersonUsd * guests).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {pricing.privateUpgradeSubtotalUsd > 0 && (
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-bark">
                          Private 4x4 Land Cruiser Charter ({guests}x)
                        </span>
                        <span className="font-mono-tech font-semibold text-canopy">
                          +${pricing.privateUpgradeSubtotalUsd.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {pricing.luxuryUpgradeSubtotalUsd > 0 && (
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-bark">
                          Premier Luxury Sanctuary Tier ({guests}x)
                        </span>
                        <span className="font-mono-tech font-semibold text-canopy">
                          +${pricing.luxuryUpgradeSubtotalUsd.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {pricing.selectedAddons.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-start gap-2">
                        <span className="text-bark">{addon.name}</span>
                        <span className="font-mono-tech font-semibold text-canopy">
                          +${addon.totalUsd.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-[11px] font-mono-tech uppercase text-bark-muted">
                        Display Currency:
                      </span>
                      <div className="inline-flex rounded-lg bg-parchment border border-canopy/15 p-0.5 text-[11px] font-mono-tech">
                        {(['USD', 'EUR', 'GBP', 'UGX'] as const).map((cur) => (
                          <button
                            key={cur}
                            type="button"
                            onClick={() => setDisplayCurrency(cur)}
                            className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                              displayCurrency === cur
                                ? 'bg-canopy text-acacia'
                                : 'text-bark-muted hover:text-canopy'
                            }`}
                          >
                            {cur}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline text-sm">
                      <span className="text-bark-muted">Total Expedition &amp; Permit Value</span>
                      <span className="font-mono-tech text-lg font-bold text-canopy">
                        {formatAmount(pricing.totalTripCostUsd)} {currencyInfo.code}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-canopy text-parchment space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-mono-tech uppercase text-acacia">
                          {paymentMethod === 'inquiry-hold'
                            ? 'Due Today (48h Complimentary Hold)'
                            : paymentPlan === 'deposit-plus-permits'
                            ? 'Due Today (30% Deposit + UWA Permits)'
                            : 'Due Today (100% Full Payment)'}
                        </span>
                        <span className="font-mono-tech text-2xl font-bold text-white">
                          {paymentMethod === 'inquiry-hold'
                            ? '$0 USD'
                            : `${formatAmount(pricing.payableNowUsd)} ${currencyInfo.code}`}
                        </span>
                      </div>
                      {displayCurrency !== 'USD' && paymentMethod !== 'inquiry-hold' && (
                        <div className="text-[10px] text-acacia font-mono-tech text-right">
                          Settled via Stripe in USD (${pricing.payableNowUsd.toLocaleString()} USD)
                        </div>
                      )}
                      {paymentPlan === 'deposit-plus-permits' &&
                        paymentMethod !== 'inquiry-hold' && (
                          <div className="text-[11px] text-parchment/75 font-mono-tech flex justify-between pt-1">
                            <span>Remaining Balance (60 days pre-safari):</span>
                            <span>
                              {formatAmount(pricing.remainingBalanceUsd)} {currencyInfo.code}
                            </span>
                          </div>
                        )}
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/5 border border-emerald-800/20 text-[11px] text-bark-muted flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Includes <strong>${pricing.conservationPledgeIncludedUsd}</strong> direct grant to Bwindi &amp; Kibale conservation via the Jabali 5% Field Levy.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </section>

      {/* =====================================================================
          PRACTICAL SAFARI PLANNING GUIDE (PERMITS, SEASONS & PACKING LIST)
         ===================================================================== */}
      <section id="permit-guide" className="py-16 sm:py-20 bg-parchment-light border-t border-canopy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl">
            <span className="font-mono-tech text-xs uppercase tracking-widest text-terracotta font-semibold">
              Essential Field Preparation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-canopy mt-2">
              Practical Planning: Permits, Seasons &amp; Packing
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: UWA Permit Rules */}
            <div className="p-6 rounded-2xl bg-parchment border border-canopy/12 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-canopy text-acacia flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-canopy">
                UWA Gorilla Permit Protocol
              </h3>
              <p className="text-xs sm:text-sm text-bark-muted leading-relaxed">
                The Uganda Wildlife Authority issues exactly 8 permits per habituated gorilla family per day ($800 Foreign Non-Resident, $700 Foreign Resident). Minimum trekking age is 15 years. Once your Stripe payment completes, our Kampala desk registers your passport details in the UWA E-Permit portal and issues your serialized docket.
              </p>
            </div>

            {/* Card 2: Best Time to Visit */}
            <div className="p-6 rounded-2xl bg-parchment border border-canopy/12 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-canopy text-acacia flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-canopy">
                Dry vs. Emerald Green Seasons
              </h3>
              <p className="text-xs sm:text-sm text-bark-muted leading-relaxed">
                <strong>Peak Dry Seasons (Jun–Sep &amp; Dec–Feb):</strong> Firmer rainforest trails and concentrated savannah game viewing around Kazinga and Narus waterholes.
                <br />
                <strong>Emerald Seasons (Apr–May &amp; Nov):</strong> Lush, mist-filled photography, migratory birds, shorter gorilla treks as families feed lower on bamboo shoots, and $350–$850/pp savings.
              </p>
            </div>

            {/* Card 3: Health & Arrival */}
            <div className="p-6 rounded-2xl bg-parchment border border-canopy/12 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-canopy text-acacia flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-canopy">
                Visas, Yellow Fever &amp; Entebbe (EBB)
              </h3>
              <p className="text-xs sm:text-sm text-bark-muted leading-relaxed">
                All travelers enter via Entebbe International Airport (EBB). Apply online for the $50 Uganda E-Visa (or $100 East Africa Tourist Visa covering Uganda, Kenya &amp; Rwanda). A Yellow Fever vaccination certificate is mandatory upon arrival.
              </p>
            </div>
          </div>

          {/* Interactive Rainforest Packing Checklist */}
          <div id="packing-list" className="rounded-2xl bg-parchment border border-canopy/15 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-terracotta" />
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-canopy">
                    Interactive Bwindi &amp; Kibale Field Packing Checklist
                  </h3>
                  <p className="text-xs text-bark-muted">
                    Check off your essential equatorial rainforest gear as you prepare
                  </p>
                </div>
              </div>
              <span className="font-mono-tech text-xs px-3 py-1.5 rounded-lg bg-canopy text-acacia">
                {Object.values(checkedGear).filter(Boolean).length} of {PACKING_ITEMS.length} Packed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PACKING_ITEMS.map((entry) => {
                const isChecked = Boolean(checkedGear[entry.id]);
                return (
                  <label
                    key={entry.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-600/30 text-canopy'
                        : 'bg-parchment-light border-canopy/10 text-bark'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setCheckedGear((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }))
                      }
                      className="h-4 w-4 rounded border-canopy text-terracotta"
                    />
                    <span className={`text-xs sm:text-sm ${isChecked ? 'line-through opacity-75' : ''}`}>
                      {entry.item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Stripe Payment Element Modal */}
      {embeddedModalData && (
        <StripeEmbeddedPaymentModal
          clientSecret={embeddedModalData.clientSecret}
          paymentIntentId={embeddedModalData.paymentIntentId}
          bookingReference={embeddedModalData.bookingReference}
          payableNowUsd={embeddedModalData.payableNowUsd}
          expeditionTitle={selectedExpedition.title}
          leadGuestEmail={email}
          mode={embeddedModalData.mode}
          onClose={() => setEmbeddedModalData(null)}
        />
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-parchment text-canopy">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="font-serif text-lg">Loading Real-Time Permit &amp; Stripe Engine...</span>
        </div>
      }
    >
      <BookingEngineContent />
    </Suspense>
  );
}
