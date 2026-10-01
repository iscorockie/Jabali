import Stripe from 'stripe';

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  if (key.includes('replace_with_your') || key.length < 20) return false;
  return key.startsWith('sk_test_') || key.startsWith('sk_live_') || key.startsWith('rk_');
}

export function isStripePublishableConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return false;
  if (key.includes('replace_with_your') || key.length < 20) return false;
  return key.startsWith('pk_test_') || key.startsWith('pk_live_');
}

export function getStripeServer(): Stripe | null {
  if (!isStripeConfigured()) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
    appInfo: {
      name: 'Jabali Trails Africa Booking Engine',
      version: '1.0.0',
    },
  });
}

/**
 * Sample Stripe Products & Price Catalog mapping corresponding to Jabali Trails expeditions.
 * Used both for documentation/seed scripts and dynamic Stripe Checkout `price_data` creation.
 */
export const STRIPE_SAMPLE_PRODUCTS = [
  {
    expeditionId: 'exp-bwindi-gorilla-5d',
    stripeProductId: 'prod_jabali_bwindi_5d',
    stripePriceId: process.env.STRIPE_PRICE_BWINDI_GORILLA_5D || 'price_jabali_bwindi_5d_usd',
    name: 'Bwindi Mist & Mountain Gorillas (5-Day Guided Expedition)',
    unitAmountCents: 345000,
    permitUnitAmountCents: 80000,
    currency: 'usd',
  },
  {
    expeditionId: 'exp-primate-kingdom-8d',
    stripeProductId: 'prod_jabali_primate_8d',
    stripePriceId: process.env.STRIPE_PRICE_PRIMATE_KINGDOM_8D || 'price_jabali_primate_8d_usd',
    name: 'Primate Kingdom: Kibale Chimps & Bwindi Gorillas (8-Day Expedition)',
    unitAmountCents: 529000,
    permitUnitAmountCents: 105000,
    currency: 'usd',
  },
  {
    expeditionId: 'exp-great-rift-nile-7d',
    stripeProductId: 'prod_jabali_rift_7d',
    stripePriceId: process.env.STRIPE_PRICE_GREAT_RIFT_NILE_7D || 'price_jabali_rift_7d_usd',
    name: 'Great Rift & Nile Safari: Murchison to Queen Elizabeth (7-Day Expedition)',
    unitAmountCents: 389000,
    permitUnitAmountCents: 0,
    currency: 'usd',
  },
  {
    expeditionId: 'exp-kidepo-walking-6d',
    stripeProductId: 'prod_jabali_kidepo_6d',
    stripePriceId: process.env.STRIPE_PRICE_KIDEPO_WALKING_6D || 'price_jabali_kidepo_6d_usd',
    name: 'Kidepo Valley & Karamoja Walking Expedition (6-Day Fly-In)',
    unitAmountCents: 465000,
    permitUnitAmountCents: 0,
    currency: 'usd',
  },
  {
    expeditionId: 'exp-pearl-circuit-12d',
    stripeProductId: 'prod_jabali_pearl_12d',
    stripePriceId: process.env.STRIPE_PRICE_PEARL_CIRCUIT_12D || 'price_jabali_pearl_12d_usd',
    name: 'Ultimate Pearl of Africa Grand Circuit (12-Day 5-Park Odyssey)',
    unitAmountCents: 795000,
    permitUnitAmountCents: 105000,
    currency: 'usd',
  },
  {
    expeditionId: 'exp-east-africa-crossborder-10d',
    stripeProductId: 'prod_jabali_eastafrica_10d',
    stripePriceId: process.env.STRIPE_PRICE_EAST_AFRICA_10D || 'price_jabali_eastafrica_10d_usd',
    name: 'East Africa Icons: Bwindi Gorillas & Serengeti Plains (10-Day Fly-In)',
    unitAmountCents: 940000,
    permitUnitAmountCents: 80000,
    currency: 'usd',
  },
];
