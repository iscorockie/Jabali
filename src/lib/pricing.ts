import { BOOKING_ADDONS, EXPEDITIONS, Expedition, getExpeditionById } from '@/data/expeditions';

export type SafariStyle = 'shared' | 'private';
export type AccommodationTier = 'signature' | 'luxury';
export type ResidencyStatus = 'foreign-non-resident' | 'foreign-resident' | 'eac-citizen';
export type PaymentPlan = 'full' | 'deposit-plus-permits';
export type PaymentGatewayMode = 'stripe-checkout' | 'stripe-elements' | 'inquiry-hold';

export interface PricingBreakdown {
  expeditionId: string;
  expeditionTitle: string;
  departureDate: string;
  endDate: string;
  seasonName: 'Peak Dry Season' | 'Emerald Green Season' | 'Savannah Shoulder Season';
  isGreenSeason: boolean;
  guests: number;
  safariStyle: SafariStyle;
  accommodationTier: AccommodationTier;
  residencyStatus: ResidencyStatus;
  paymentPlan: PaymentPlan;
  baseRatePerPersonUsd: number;
  greenSeasonDiscountPerPersonUsd: number;
  effectiveBasePerPersonUsd: number;
  safariPackageSubtotalUsd: number;
  gorillaPermitPerPersonUsd: number;
  chimpPermitPerPersonUsd: number;
  permitsSubtotalUsd: number;
  privateUpgradeSubtotalUsd: number;
  luxuryUpgradeSubtotalUsd: number;
  addonsSubtotalUsd: number;
  selectedAddons: { id: string; name: string; unitPriceUsd: number; totalUsd: number }[];
  conservationPledgeIncludedUsd: number;
  totalTripCostUsd: number;
  payableNowUsd: number;
  remainingBalanceUsd: number;
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending_payment' | 'paid' | 'inquiry_hold' | 'cancelled';
  paymentMethod: PaymentGatewayMode;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  uwaPermitDocketNumber?: string;
  expeditionId: string;
  expeditionSlug: string;
  expeditionTitle: string;
  departureDate: string;
  endDate: string;
  guests: number;
  safariStyle: SafariStyle;
  accommodationTier: AccommodationTier;
  residencyStatus: ResidencyStatus;
  paymentPlan: PaymentPlan;
  addonIds: string[];
  pricing: PricingBreakdown;
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

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: 'available' | 'limited' | 'sold-out' | 'past';
  permitsRemaining: number;
  maxPermits: number;
  season: 'Peak Dry Season' | 'Emerald Green Season' | 'Savannah Shoulder Season';
  isGreenSeason: boolean;
  effectiveFromPriceUsd: number;
  permitFeeUsd: number;
  guaranteedDeparture: boolean;
}

export function getSeasonForDate(dateStr: string): {
  seasonName: 'Peak Dry Season' | 'Emerald Green Season' | 'Savannah Shoulder Season';
  isGreenSeason: boolean;
} {
  const parts = dateStr.split('-');
  const month = parts.length >= 2 ? parseInt(parts[1], 10) : 7;
  if (month === 4 || month === 5 || month === 11) {
    return { seasonName: 'Emerald Green Season', isGreenSeason: true };
  }
  if ([1, 2, 6, 7, 8, 9, 12].includes(month)) {
    return { seasonName: 'Peak Dry Season', isGreenSeason: false };
  }
  return { seasonName: 'Savannah Shoulder Season', isGreenSeason: false };
}

export function calculateEndDate(startDateStr: string, durationDays: number): string {
  const d = new Date(`${startDateStr}T00:00:00Z`);
  if (isNaN(d.getTime())) return startDateStr;
  d.setUTCDate(d.getUTCDate() + Math.max(1, durationDays - 1));
  return d.toISOString().split('T')[0];
}

export function calculateBookingPricing(params: {
  expeditionId: string;
  departureDate: string;
  guests: number;
  safariStyle: SafariStyle;
  accommodationTier: AccommodationTier;
  residencyStatus: ResidencyStatus;
  paymentPlan: PaymentPlan;
  addonIds: string[];
}): PricingBreakdown {
  const expedition: Expedition = getExpeditionById(params.expeditionId) || EXPEDITIONS[0];
  const guests = Math.max(1, Math.min(12, Number(params.guests) || 2));
  const { seasonName, isGreenSeason } = getSeasonForDate(params.departureDate);

  const baseRatePerPersonUsd = expedition.basePriceUsd;
  const greenSeasonDiscountPerPersonUsd = isGreenSeason ? expedition.greenSeasonDiscountUsd : 0;
  const effectiveBasePerPersonUsd = baseRatePerPersonUsd - greenSeasonDiscountPerPersonUsd;
  const safariPackageSubtotalUsd = effectiveBasePerPersonUsd * guests;

  let gorillaPermitPerPersonUsd = expedition.gorillaPermitUsd;
  let chimpPermitPerPersonUsd = expedition.chimpPermitUsd;

  if (gorillaPermitPerPersonUsd > 0) {
    if (params.residencyStatus === 'foreign-resident') gorillaPermitPerPersonUsd = 700;
    else if (params.residencyStatus === 'eac-citizen') gorillaPermitPerPersonUsd = 80;
    else gorillaPermitPerPersonUsd = 800;
  }

  if (chimpPermitPerPersonUsd > 0) {
    if (params.residencyStatus === 'foreign-resident') chimpPermitPerPersonUsd = 200;
    else if (params.residencyStatus === 'eac-citizen') chimpPermitPerPersonUsd = 30;
    else chimpPermitPerPersonUsd = 250;
  }

  const permitsSubtotalUsd = (gorillaPermitPerPersonUsd + chimpPermitPerPersonUsd) * guests;

  const privateUpgradeSubtotalUsd =
    params.safariStyle === 'private' ? expedition.privateVehicleUpgradePerPersonUsd * guests : 0;

  const luxuryUpgradeSubtotalUsd =
    params.accommodationTier === 'luxury' ? expedition.luxuryLodgeUpgradePerPersonUsd * guests : 0;

  const selectedAddons = (params.addonIds || [])
    .map((id) => BOOKING_ADDONS.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((addon) => {
      const qty = addon.perPerson ? guests : 1;
      return {
        id: addon.id,
        name: addon.name,
        unitPriceUsd: addon.priceUsd,
        totalUsd: addon.priceUsd * qty,
      };
    });

  const addonsSubtotalUsd = selectedAddons.reduce((acc, item) => acc + item.totalUsd, 0);

  const totalTripCostUsd =
    safariPackageSubtotalUsd +
    permitsSubtotalUsd +
    privateUpgradeSubtotalUsd +
    luxuryUpgradeSubtotalUsd +
    addonsSubtotalUsd;

  const conservationPledgeIncludedUsd = Math.round(safariPackageSubtotalUsd * 0.05);

  const landTotal = safariPackageSubtotalUsd + privateUpgradeSubtotalUsd + luxuryUpgradeSubtotalUsd;
  const payableNowUsd =
    params.paymentPlan === 'deposit-plus-permits'
      ? Math.round(landTotal * 0.3) + permitsSubtotalUsd + addonsSubtotalUsd
      : totalTripCostUsd;

  const remainingBalanceUsd = Math.max(0, totalTripCostUsd - payableNowUsd);

  return {
    expeditionId: expedition.id,
    expeditionTitle: expedition.title,
    departureDate: params.departureDate,
    endDate: calculateEndDate(params.departureDate, expedition.durationDays),
    seasonName,
    isGreenSeason,
    guests,
    safariStyle: params.safariStyle,
    accommodationTier: params.accommodationTier,
    residencyStatus: params.residencyStatus,
    paymentPlan: params.paymentPlan,
    baseRatePerPersonUsd,
    greenSeasonDiscountPerPersonUsd,
    effectiveBasePerPersonUsd,
    safariPackageSubtotalUsd,
    gorillaPermitPerPersonUsd,
    chimpPermitPerPersonUsd,
    permitsSubtotalUsd,
    privateUpgradeSubtotalUsd,
    luxuryUpgradeSubtotalUsd,
    addonsSubtotalUsd,
    selectedAddons,
    conservationPledgeIncludedUsd,
    totalTripCostUsd,
    payableNowUsd,
    remainingBalanceUsd,
  };
}
