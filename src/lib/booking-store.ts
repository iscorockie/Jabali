import fs from 'fs';
import path from 'path';
import { EXPEDITIONS, getExpeditionById } from '@/data/expeditions';
import {
  BookingRecord,
  DayAvailability,
  getSeasonForDate,
} from '@/lib/pricing';

export * from '@/lib/pricing';

const DATA_DIR = path.join(process.cwd(), '.data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Ignore in read-only environments
  }
}

let memoryBookings: BookingRecord[] = [];
let memoryInquiries: Record<string, unknown>[] = [];

export function listBookings(): BookingRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(BOOKINGS_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryBookings = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to in-memory
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
  const all = listBookings();
  return all.find(
    (b) =>
      b.id === identifier ||
      b.bookingReference === identifier ||
      b.stripeSessionId === identifier ||
      b.stripePaymentIntentId === identifier
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
      booking.uwaPermitDocketNumber ||
      `UWA-BW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
  };
  return saveBooking(updated);
}

export function saveInquiry(inquiry: Record<string, unknown>) {
  try {
    ensureDataDir();
    let list: Record<string, unknown>[] = memoryInquiries;
    if (fs.existsSync(INQUIRIES_FILE)) {
      list = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf-8'));
    }
    list.unshift(inquiry);
    memoryInquiries = list;
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    memoryInquiries.unshift(inquiry);
  }
  return inquiry;
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
