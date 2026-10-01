import { EXPEDITIONS, getExpeditionById } from '@/data/expeditions';
import {
  AccommodationTier,
  BookingRecord,
  DayAvailability,
  PaymentGatewayMode,
  PaymentPlan,
  ResidencyStatus,
  SafariStyle,
  calculateBookingPricing,
  getSeasonForDate,
} from '@/lib/pricing';

const STORAGE_BOOKINGS_KEY = 'jabali_trails_bookings_v1';
const STORAGE_INQUIRIES_KEY = 'jabali_trails_inquiries_v1';

function getLocalBookings(): BookingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalBooking(record: BookingRecord): BookingRecord {
  if (typeof window === 'undefined') return record;
  try {
    const list = getLocalBookings();
    const idx = list.findIndex(
      (b) => b.id === record.id || b.bookingReference === record.bookingReference
    );
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    window.localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
  return record;
}

export function findLocalBooking(identifier: string): BookingRecord | undefined {
  if (!identifier) return undefined;
  const list = getLocalBookings();
  return list.find(
    (b) =>
      b.id === identifier ||
      b.bookingReference === identifier ||
      b.stripeSessionId === identifier ||
      b.stripePaymentIntentId === identifier
  );
}

function hashDateAndExpeditionClient(dateStr: string, expeditionId: string): number {
  const combined = `${dateStr}:${expeditionId}`;
  let hash = 2166136261;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function computeClientMonthAvailability(
  expeditionId: string,
  year: number,
  month: number
): DayAvailability[] {
  const expedition = getExpeditionById(expeditionId) || EXPEDITIONS[0];
  const bookings = getLocalBookings().filter(
    (b) => b.expeditionId === expedition.id && b.status !== 'cancelled'
  );

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const results: DayAvailability[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    const { seasonName, isGreenSeason } = getSeasonForDate(dateStr);

    if (dateStr < todayStr) {
      results.push({
        date: dateStr,
        status: 'past',
        permitsRemaining: 0,
        maxPermits: expedition.dailyPermitQuota,
        season: seasonName,
        isGreenSeason,
        effectiveFromPriceUsd:
          expedition.basePriceUsd - (isGreenSeason ? expedition.greenSeasonDiscountUsd : 0),
        permitFeeUsd: expedition.gorillaPermitUsd + expedition.chimpPermitUsd,
        guaranteedDeparture: false,
      });
      continue;
    }

    const h = hashDateAndExpeditionClient(dateStr, expedition.id);
    const maxQuota = expedition.dailyPermitQuota;

    const bucket = h % 20;
    let baseRemaining: number;
    if (bucket === 0 || bucket === 7 || bucket === 14) {
      baseRemaining = 0;
    } else if (bucket === 2 || bucket === 5 || bucket === 9 || bucket === 12 || bucket === 17) {
      baseRemaining = (h % 3) + 1;
    } else {
      baseRemaining = Math.min(maxQuota, 4 + (h % Math.max(1, maxQuota - 3)));
    }

    const bookedForDate = bookings
      .filter((b) => b.departureDate === dateStr)
      .reduce((sum, b) => sum + b.guests, 0);

    const permitsRemaining = Math.max(0, baseRemaining - bookedForDate);

    let status: DayAvailability['status'] = 'available';
    if (permitsRemaining === 0) {
      status = 'sold-out';
    } else if (permitsRemaining <= 3) {
      status = 'limited';
    }

    results.push({
      date: dateStr,
      status,
      permitsRemaining,
      maxPermits: maxQuota,
      season: seasonName,
      isGreenSeason,
      effectiveFromPriceUsd:
        expedition.basePriceUsd - (isGreenSeason ? expedition.greenSeasonDiscountUsd : 0),
      permitFeeUsd: expedition.gorillaPermitUsd + expedition.chimpPermitUsd,
      guaranteedDeparture: permitsRemaining > 0 && (day % 3 === 0 || permitsRemaining <= 4),
    });
  }

  return results;
}

export async function fetchAvailabilityUniversal(
  expeditionId: string,
  year: number,
  month: number
): Promise<DayAvailability[]> {
  try {
    const res = await fetch(
      `/api/availability?expeditionId=${encodeURIComponent(
        expeditionId
      )}&year=${year}&month=${month}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.days)) {
        return data.days;
      }
    }
  } catch {
    // Static Pages host fallback
  }
  return computeClientMonthAvailability(expeditionId, year, month);
}

export interface CreateBookingPayload {
  expeditionId: string;
  departureDate: string;
  guests: number;
  safariStyle: SafariStyle;
  accommodationTier: AccommodationTier;
  residencyStatus: ResidencyStatus;
  paymentPlan: PaymentPlan;
  addonIds: string[];
  paymentMethod: PaymentGatewayMode;
  leadGuest: {
    fullName: string;
    email: string;
    phone: string;
    nationality: string;
    passportNumber?: string;
    fitnessLevel: string;
    dietaryOrMedicalNotes?: string;
  };
}

function buildBookingRecordClient(
  payload: CreateBookingPayload,
  overrides?: Partial<BookingRecord>
): BookingRecord {
  const expedition = getExpeditionById(payload.expeditionId) || EXPEDITIONS[0];
  const pricing = calculateBookingPricing({
    expeditionId: expedition.id,
    departureDate: payload.departureDate,
    guests: payload.guests,
    safariStyle: payload.safariStyle,
    accommodationTier: payload.accommodationTier,
    residencyStatus: payload.residencyStatus,
    paymentPlan: payload.paymentPlan,
    addonIds: payload.addonIds,
  });

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const bookingReference = `JBL-${new Date().getFullYear()}-${randomCode}`;
  const bookingId = `bk_${Date.now()}_${randomCode}`;

  const record: BookingRecord = {
    id: bookingId,
    bookingReference,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: payload.paymentMethod === 'inquiry-hold' ? 'inquiry_hold' : 'pending_payment',
    paymentMethod: payload.paymentMethod,
    uwaPermitDocketNumber:
      payload.paymentMethod === 'inquiry-hold' ? `UWA-HOLD-${randomCode}` : undefined,
    expeditionId: expedition.id,
    expeditionSlug: expedition.slug,
    expeditionTitle: expedition.title,
    departureDate: payload.departureDate,
    endDate: pricing.endDate,
    guests: payload.guests,
    safariStyle: payload.safariStyle,
    accommodationTier: payload.accommodationTier,
    residencyStatus: payload.residencyStatus,
    paymentPlan: payload.paymentPlan,
    addonIds: payload.addonIds,
    pricing,
    leadGuest: payload.leadGuest,
    ...overrides,
  };

  return saveLocalBooking(record);
}

export async function createCheckoutUniversal(payload: CreateBookingPayload): Promise<{
  mode: string;
  sessionId?: string;
  bookingReference: string;
  bookingId: string;
  checkoutUrl: string;
}> {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.checkoutUrl) {
        buildBookingRecordClient(payload, {
          id: data.bookingId,
          bookingReference: data.bookingReference,
          stripeSessionId: data.sessionId,
        });
        return data;
      }
    }
  } catch {
    // Fallback to client-side checkout creation for static GitHub Pages
  }

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const sessionId = `cs_test_jabali_${Date.now()}_${randomCode}`;
  const record = buildBookingRecordClient(payload, {
    stripeSessionId: sessionId,
  });

  if (payload.paymentMethod === 'inquiry-hold') {
    return {
      mode: 'inquiry-hold',
      bookingReference: record.bookingReference,
      bookingId: record.id,
      checkoutUrl: `/booking/success?ref=${encodeURIComponent(
        record.bookingReference
      )}&mode=inquiry`,
    };
  }

  return {
    mode: 'stripe-test-sandbox',
    sessionId,
    bookingReference: record.bookingReference,
    bookingId: record.id,
    checkoutUrl: `/booking/checkout?session_id=${encodeURIComponent(
      sessionId
    )}&ref=${encodeURIComponent(record.bookingReference)}`,
  };
}

export async function createPaymentIntentUniversal(payload: CreateBookingPayload): Promise<{
  mode: string;
  clientSecret: string;
  paymentIntentId: string;
  bookingReference: string;
  bookingId: string;
  payableNowUsd: number;
}> {
  try {
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.clientSecret) {
        buildBookingRecordClient(payload, {
          id: data.bookingId,
          bookingReference: data.bookingReference,
          stripePaymentIntentId: data.paymentIntentId,
        });
        return data;
      }
    }
  } catch {
    // Static Pages fallback
  }

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const paymentIntentId = `pi_test_jabali_${Date.now()}_${randomCode}`;
  const record = buildBookingRecordClient(payload, {
    stripePaymentIntentId: paymentIntentId,
  });

  return {
    mode: 'stripe-test-sandbox',
    clientSecret: `${paymentIntentId}_secret_sandbox`,
    paymentIntentId,
    bookingReference: record.bookingReference,
    bookingId: record.id,
    payableNowUsd: record.pricing.payableNowUsd,
  };
}

export async function fetchBookingUniversal(params: {
  ref?: string;
  sessionId?: string;
  paymentIntent?: string;
  allowDemoFallback?: boolean;
}): Promise<BookingRecord | null> {
  const identifier = params.ref || params.sessionId || params.paymentIntent || '';
  // Demo data is only available when a demo page explicitly requests it without
  // a real booking reference. Never manufacture a paid reservation for a lookup.
  const isDemoRequest =
    params.allowDemoFallback === true &&
    !params.ref &&
    !params.paymentIntent &&
    (!params.sessionId || params.sessionId === 'cs_test_jabali_demo');

  if (!identifier && !isDemoRequest) return null;

  let lookupFailed = false;
  if (!isDemoRequest) {
    try {
      const q = new URLSearchParams();
      if (params.ref) q.set('ref', params.ref);
      if (params.sessionId) q.set('session_id', params.sessionId);
      if (params.paymentIntent) q.set('payment_intent', params.paymentIntent);

      const res = await fetch(`/api/bookings?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          saveLocalBooking(data.booking);
          return data.booking;
        }
      } else if (res.status !== 404) {
        lookupFailed = true;
      }
    } catch {
      // Existing local bookings remain available on static hosts or offline.
      lookupFailed = true;
    }
  }

  const local = findLocalBooking(identifier);
  if (local) return local;

  if (!isDemoRequest) {
    if (lookupFailed) {
      throw new Error('Unable to check your booking. Please try again.');
    }
    return null;
  }

  // Keep the explicitly requested sandbox dossier available for its checkout
  // redirect and later lookup, even when no server booking exists.
  const defaultExp = EXPEDITIONS[0];
  const pricing = calculateBookingPricing({
    expeditionId: defaultExp.id,
    departureDate: '2026-11-14',
    guests: 2,
    safariStyle: 'shared',
    accommodationTier: 'signature',
    residencyStatus: 'foreign-non-resident',
    paymentPlan: 'deposit-plus-permits',
    addonIds: [],
  });

  return saveLocalBooking({
    id: 'bk_demo_fallback',
    bookingReference: 'JBL-2026-DEMO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'paid',
    paymentMethod: 'stripe-checkout',
    stripeSessionId: params.sessionId || 'cs_test_jabali_demo',
    uwaPermitDocketNumber: 'UWA-BW-2026-594820',
    expeditionId: defaultExp.id,
    expeditionSlug: defaultExp.slug,
    expeditionTitle: defaultExp.title,
    departureDate: '2026-11-14',
    endDate: pricing.endDate,
    guests: 2,
    safariStyle: 'shared',
    accommodationTier: 'signature',
    residencyStatus: 'foreign-non-resident',
    paymentPlan: 'deposit-plus-permits',
    addonIds: [],
    pricing,
    leadGuest: {
      fullName: 'Dr. Clara Reynolds',
      email: 'clara.reynolds@example.com',
      phone: '+1 (415) 890-4321',
      nationality: 'United States',
      fitnessLevel: 'Moderate (Regular Hiker)',
    },
  });
}

export async function triggerWebhookUniversal(params: {
  bookingReference: string;
  sessionId?: string;
  paymentIntentId?: string;
  eventType?: 'checkout.session.completed' | 'payment_intent.succeeded';
}): Promise<{ eventType: string; processedAt: string }> {
  const eventType = params.eventType || 'checkout.session.completed';
  const processedAt = new Date().toISOString();

  // Always update local storage record so static GitHub Pages works immediately
  const local =
    findLocalBooking(params.bookingReference) ||
    findLocalBooking(params.sessionId || '') ||
    findLocalBooking(params.paymentIntentId || '');

  if (local) {
    saveLocalBooking({
      ...local,
      status: 'paid',
      updatedAt: processedAt,
      stripeSessionId: params.sessionId || local.stripeSessionId,
      stripePaymentIntentId: params.paymentIntentId || local.stripePaymentIntentId,
      uwaPermitDocketNumber:
        local.uwaPermitDocketNumber ||
        `UWA-BW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  try {
    const res = await fetch('/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `evt_test_${Date.now()}`,
        object: 'event',
        type: eventType,
        data: {
          object: {
            id: params.sessionId || params.paymentIntentId || 'cs_test_verified',
            client_reference_id: params.bookingReference,
            payment_status: 'paid',
            status: 'succeeded',
            metadata: {
              bookingReference: params.bookingReference,
            },
          },
        },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        eventType: data.eventType || eventType,
        processedAt: data.processedAt || processedAt,
      };
    }
  } catch {
    // Static Pages fallback
  }

  return { eventType, processedAt };
}

export async function submitInquiryUniversal(
  payload: Record<string, unknown>
): Promise<{ inquiryReference: string }> {
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const fallbackRef = `JBL-INQ-${new Date().getFullYear()}-${randomCode}`;

  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_INQUIRIES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({ ...payload, inquiryReference: fallbackRef, createdAt: new Date().toISOString() });
      window.localStorage.setItem(STORAGE_INQUIRIES_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  }

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.inquiryReference) {
        return { inquiryReference: data.inquiryReference };
      }
    }
  } catch {
    // Static Pages fallback
  }

  return { inquiryReference: fallbackRef };
}
