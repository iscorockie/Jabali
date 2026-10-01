import fs from 'fs';
import path from 'path';
import { EXPEDITIONS, getExpeditionById } from '@/data/expeditions';
import {
  BookingRecord,
  DayAvailability,
  calculateBookingPricing,
  getSeasonForDate,
} from '@/lib/pricing';

export * from '@/lib/pricing';

export interface InquiryRecord {
  inquiryReference: string;
  createdAt: string;
  status: 'new' | 'proposal_sent' | 'converted';
  fullName: string;
  email: string;
  phone: string;
  country: string;
  preferredMonth: string;
  durationDays: string;
  guests: number;
  budgetPerPerson: string;
  interests: string[];
  notes: string;
  assignedSpecialist: string;
}

export interface WebhookLogEntry {
  id: string;
  eventType: string;
  bookingReference: string;
  stripeObjectId: string;
  status: 'verified' | 'simulated_sandbox';
  processedAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
  interest: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const WEBHOOKS_FILE = path.join(DATA_DIR, 'webhooks.json');
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter.json');
const QUOTA_OVERRIDES_FILE = path.join(DATA_DIR, 'quota_overrides.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore in read-only environments
  }
}

function createInitialSeedBookings(): BookingRecord[] {
  const exp1 = EXPEDITIONS[0];
  const pricing1 = calculateBookingPricing({
    expeditionId: exp1.id,
    departureDate: '2026-11-14',
    guests: 2,
    safariStyle: 'private',
    accommodationTier: 'luxury',
    residencyStatus: 'foreign-non-resident',
    paymentPlan: 'deposit-plus-permits',
    addonIds: ['aerolink-flight', 'dedicated-porter-pack'],
  });

  const exp2 = EXPEDITIONS[1];
  const pricing2 = calculateBookingPricing({
    expeditionId: exp2.id,
    departureDate: '2026-12-18',
    guests: 4,
    safariStyle: 'shared',
    accommodationTier: 'signature',
    residencyStatus: 'foreign-non-resident',
    paymentPlan: 'full',
    addonIds: ['dedicated-porter-pack'],
  });

  return [
    {
      id: 'bk_seed_8419',
      bookingReference: 'JBL-2026-8419',
      createdAt: '2026-10-01T08:30:00.000Z',
      updatedAt: '2026-10-01T08:32:10.000Z',
      status: 'paid',
      paymentMethod: 'stripe-checkout',
      stripeSessionId: 'cs_test_a1B2c3D4e5F6g7H8i9J0',
      uwaPermitDocketNumber: 'UWA-BW-2026-594820',
      expeditionId: exp1.id,
      expeditionSlug: exp1.slug,
      expeditionTitle: exp1.title,
      departureDate: '2026-11-14',
      endDate: pricing1.endDate,
      guests: 2,
      safariStyle: 'private',
      accommodationTier: 'luxury',
      residencyStatus: 'foreign-non-resident',
      paymentPlan: 'deposit-plus-permits',
      addonIds: ['aerolink-flight', 'dedicated-porter-pack'],
      pricing: pricing1,
      leadGuest: {
        fullName: 'Dr. Elena & Marcus Vance',
        email: 'elena.vance@ethz-example.ch',
        phone: '+41 44 632 11 11',
        nationality: 'Switzerland',
        passportNumber: 'X8492011',
        fitnessLevel: 'Moderate (Regular Hiker)',
        dietaryOrMedicalNotes: '1 Double Forest Suite, pescatarian meals preferred.',
      },
    },
    {
      id: 'bk_seed_7302',
      bookingReference: 'JBL-2026-7302',
      createdAt: '2026-10-01T09:15:00.000Z',
      updatedAt: '2026-10-01T09:15:00.000Z',
      status: 'inquiry_hold',
      paymentMethod: 'inquiry-hold',
      uwaPermitDocketNumber: 'UWA-HOLD-7302',
      expeditionId: exp2.id,
      expeditionSlug: exp2.slug,
      expeditionTitle: exp2.title,
      departureDate: '2026-12-18',
      endDate: pricing2.endDate,
      guests: 4,
      safariStyle: 'shared',
      accommodationTier: 'signature',
      residencyStatus: 'foreign-non-resident',
      paymentPlan: 'full',
      addonIds: ['dedicated-porter-pack'],
      pricing: pricing2,
      leadGuest: {
        fullName: 'Jonathan Sterling Family',
        email: 'j.sterling@pacific-example.com',
        phone: '+1 (206) 555-0184',
        nationality: 'United States',
        fitnessLevel: 'Easy–Moderate (Prefer Shorter Sector Hike)',
        dietaryOrMedicalNotes: '2 Twin Cottages adjacent in Buhoma.',
      },
    },
  ];
}

function createInitialSeedInquiries(): InquiryRecord[] {
  return [
    {
      inquiryReference: 'JBL-INQ-2026-9104',
      createdAt: '2026-10-01T07:45:00.000Z',
      status: 'proposal_sent',
      fullName: 'Prof. Alistair Finch',
      email: 'a.finch@oxford-example.uk',
      phone: '+44 7700 900412',
      country: 'United Kingdom',
      preferredMonth: 'June – September 2027 (Peak Dry)',
      durationDays: '11–14 Days (Grand Circuit)',
      guests: 2,
      budgetPerPerson: '$8,500 – $14,000+ / guest (Ultra-Luxury Fly-In Sanctuaries)',
      interests: [
        '4-Hour Gorilla Habituation (Rushaga)',
        'Chimpanzee Tracking (Kibale)',
        'Albertine Rift Endemic Birding',
      ],
      notes: 'Interested in private ornithological charter with Grace Namatovu and 4-hour gorilla habituation in Rushaga.',
      assignedSpecialist: 'Grace Namatovu (Kampala & Fort Portal Desk)',
    },
  ];
}

function createInitialSeedWebhooks(): WebhookLogEntry[] {
  return [
    {
      id: 'evt_test_seed_01',
      eventType: 'checkout.session.completed',
      bookingReference: 'JBL-2026-8419',
      stripeObjectId: 'cs_test_a1B2c3D4e5F6g7H8i9J0',
      status: 'verified',
      processedAt: '2026-10-01T08:32:10.000Z',
    },
  ];
}

let memoryBookings: BookingRecord[] = createInitialSeedBookings();
let memoryInquiries: InquiryRecord[] = createInitialSeedInquiries();
let memoryWebhooks: WebhookLogEntry[] = createInitialSeedWebhooks();
let memoryNewsletter: NewsletterSubscriber[] = [];
let memoryQuotaOverrides: Record<string, number> = {};

export function listBookings(): BookingRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(BOOKINGS_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryBookings = parsed;
        return parsed;
      }
    } else {
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(memoryBookings, null, 2), 'utf-8');
    }
  } catch {
    // Fallback to memory
  }
  return memoryBookings;
}

export function saveBooking(booking: BookingRecord): BookingRecord {
  const existing = listBookings();
  const idx = existing.findIndex(
    (b) => b.id === booking.id || b.bookingReference === booking.bookingReference
  );
  if (idx >= 0) {
    existing[idx] = booking;
  } else {
    existing.unshift(booking);
  }
  memoryBookings = existing;
  try {
    ensureDataDir();
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch {
    // Ignore write error in read-only environments
  }
  return booking;
}

export function findBooking(identifier: string): BookingRecord | undefined {
  if (!identifier) return undefined;
  const normalized = identifier.trim().toLowerCase();
  const all = listBookings();
  return all.find(
    (b) =>
      b.id.toLowerCase() === normalized ||
      b.bookingReference.toLowerCase() === normalized ||
      (b.stripeSessionId && b.stripeSessionId.toLowerCase() === normalized) ||
      (b.stripePaymentIntentId && b.stripePaymentIntentId.toLowerCase() === normalized) ||
      (b.uwaPermitDocketNumber && b.uwaPermitDocketNumber.toLowerCase() === normalized) ||
      b.leadGuest.email.toLowerCase() === normalized
  );
}

export function updateBookingPaymentStatus(
  identifier: string,
  status: BookingRecord['status'],
  extra?: Partial<BookingRecord>
): BookingRecord | undefined {
  const booking = findBooking(identifier);
  if (!booking) return undefined;
  const updated: BookingRecord = {
    ...booking,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
    uwaPermitDocketNumber:
      status === 'cancelled'
        ? 'CANCELLED-RELEASED'
        : booking.uwaPermitDocketNumber && !booking.uwaPermitDocketNumber.startsWith('UWA-HOLD')
        ? booking.uwaPermitDocketNumber
        : `UWA-BW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
  };
  return saveBooking(updated);
}

export function modifyBookingDetails(
  identifier: string,
  changes: {
    departureDate?: string;
    guests?: number;
    safariStyle?: BookingRecord['safariStyle'];
    accommodationTier?: BookingRecord['accommodationTier'];
    status?: BookingRecord['status'];
  }
): BookingRecord | undefined {
  const booking = findBooking(identifier);
  if (!booking) return undefined;

  const newDepartureDate = changes.departureDate || booking.departureDate;
  const newGuests = changes.guests ?? booking.guests;
  const newSafariStyle = changes.safariStyle || booking.safariStyle;
  const newAccommodationTier = changes.accommodationTier || booking.accommodationTier;

  const newPricing = calculateBookingPricing({
    expeditionId: booking.expeditionId,
    departureDate: newDepartureDate,
    guests: newGuests,
    safariStyle: newSafariStyle,
    accommodationTier: newAccommodationTier,
    residencyStatus: booking.residencyStatus,
    paymentPlan: booking.paymentPlan,
    addonIds: booking.addonIds,
  });

  const updated: BookingRecord = {
    ...booking,
    departureDate: newDepartureDate,
    endDate: newPricing.endDate,
    guests: newGuests,
    safariStyle: newSafariStyle,
    accommodationTier: newAccommodationTier,
    status: changes.status || booking.status,
    pricing: newPricing,
    updatedAt: new Date().toISOString(),
  };

  return saveBooking(updated);
}

export function listInquiries(): InquiryRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(INQUIRIES_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryInquiries = parsed;
        return parsed;
      }
    } else {
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(memoryInquiries, null, 2), 'utf-8');
    }
  } catch {
    // Fallback
  }
  return memoryInquiries;
}

export function saveInquiry(inquiry: Partial<InquiryRecord> & { inquiryReference: string }): InquiryRecord {
  const list = listInquiries();
  const fullRecord: InquiryRecord = {
    inquiryReference: inquiry.inquiryReference,
    createdAt: inquiry.createdAt || new Date().toISOString(),
    status: inquiry.status || 'new',
    fullName: inquiry.fullName || 'Safari Traveler',
    email: inquiry.email || '',
    phone: inquiry.phone || '',
    country: inquiry.country || '',
    preferredMonth: inquiry.preferredMonth || 'Flexible',
    durationDays: inquiry.durationDays || '8–10 Days',
    guests: Number(inquiry.guests) || 2,
    budgetPerPerson: inquiry.budgetPerPerson || '$5,500 – $8,500',
    interests: Array.isArray(inquiry.interests) ? inquiry.interests : [],
    notes: inquiry.notes || '',
    assignedSpecialist:
      inquiry.assignedSpecialist || 'Grace Namatovu (Kampala & Fort Portal Desk)',
  };

  const idx = list.findIndex((i) => i.inquiryReference === fullRecord.inquiryReference);
  if (idx >= 0) {
    list[idx] = fullRecord;
  } else {
    list.unshift(fullRecord);
  }
  memoryInquiries = list;
  try {
    ensureDataDir();
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
  return fullRecord;
}

export function updateInquiryStatus(
  inquiryReference: string,
  status: InquiryRecord['status']
): InquiryRecord | undefined {
  const list = listInquiries();
  const found = list.find((i) => i.inquiryReference === inquiryReference);
  if (!found) return undefined;
  found.status = status;
  memoryInquiries = list;
  try {
    ensureDataDir();
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
  return found;
}

export function listWebhookEvents(): WebhookLogEntry[] {
  try {
    ensureDataDir();
    if (fs.existsSync(WEBHOOKS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(WEBHOOKS_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        memoryWebhooks = parsed;
        return parsed;
      }
    } else {
      fs.writeFileSync(WEBHOOKS_FILE, JSON.stringify(memoryWebhooks, null, 2), 'utf-8');
    }
  } catch {
    // Fallback
  }
  return memoryWebhooks;
}

export function recordWebhookEvent(entry: WebhookLogEntry): WebhookLogEntry {
  const list = listWebhookEvents();
  list.unshift(entry);
  memoryWebhooks = list.slice(0, 50);
  try {
    ensureDataDir();
    fs.writeFileSync(WEBHOOKS_FILE, JSON.stringify(memoryWebhooks, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
  return entry;
}

export function addNewsletterSubscriber(email: string, interest = 'All Uganda & East Africa Dispatches'): NewsletterSubscriber {
  const sub: NewsletterSubscriber = {
    email,
    subscribedAt: new Date().toISOString(),
    interest,
  };
  memoryNewsletter.unshift(sub);
  try {
    ensureDataDir();
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(memoryNewsletter, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
  return sub;
}

export function getQuotaOverrides(): Record<string, number> {
  try {
    ensureDataDir();
    if (fs.existsSync(QUOTA_OVERRIDES_FILE)) {
      memoryQuotaOverrides = JSON.parse(fs.readFileSync(QUOTA_OVERRIDES_FILE, 'utf-8'));
    }
  } catch {
    // Ignore
  }
  return memoryQuotaOverrides;
}

export function setCustomDatePermitQuota(
  expeditionId: string,
  dateStr: string,
  permits: number
) {
  const overrides = getQuotaOverrides();
  overrides[`${expeditionId}:${dateStr}`] = Math.max(0, Math.min(24, permits));
  memoryQuotaOverrides = overrides;
  try {
    ensureDataDir();
    fs.writeFileSync(QUOTA_OVERRIDES_FILE, JSON.stringify(overrides, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
  return overrides;
}

function hashDateAndExpedition(dateStr: string, expeditionId: string): number {
  const combined = `${dateStr}:${expeditionId}`;
  let hash = 2166136261;
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function getMonthAvailability(
  expeditionId: string,
  year: number,
  month: number
): DayAvailability[] {
  const expedition = getExpeditionById(expeditionId) || EXPEDITIONS[0];
  const bookings = listBookings().filter(
    (b) => b.expeditionId === expedition.id && b.status !== 'cancelled'
  );
  const overrides = getQuotaOverrides();

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

    const h = hashDateAndExpedition(dateStr, expedition.id);
    const maxQuota = expedition.dailyPermitQuota;

    const overrideKey = `${expedition.id}:${dateStr}`;
    let baseRemaining: number;

    if (typeof overrides[overrideKey] === 'number') {
      baseRemaining = overrides[overrideKey];
    } else {
      const bucket = h % 20;
      if (bucket === 0 || bucket === 7 || bucket === 14) {
        baseRemaining = 0;
      } else if (bucket === 2 || bucket === 5 || bucket === 9 || bucket === 12 || bucket === 17) {
        baseRemaining = (h % 3) + 1;
      } else {
        baseRemaining = Math.min(maxQuota, 4 + (h % Math.max(1, maxQuota - 3)));
      }
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

    const guaranteedDeparture = permitsRemaining > 0 && (day % 3 === 0 || permitsRemaining <= 4);

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
      guaranteedDeparture,
    });
  }

  return results;
}
