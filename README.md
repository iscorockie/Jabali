# Jabali Trails Africa — Guided Expeditions in Uganda & East Africa

Production-ready marketing and real-time booking platform for **Jabali Trails Africa**, a conservation-minded East African expedition outfitter specializing in mountain gorilla trekking in **Bwindi Impenetrable National Park**, chimpanzee tracking in **Kibale Forest**, walking safaris in **Kidepo Valley**, classic big-game safaris across **Murchison Falls** & **Queen Elizabeth National Park**, and cross-border fly-in extensions to the **Serengeti**.

---

## Tech Stack

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/) + React 18
- **Language:** TypeScript (`strict` mode)
- **Styling:** Tailwind CSS with a custom **Equatorial Field Journal & Botanical Luxury** design system (`parchment`, `canopy`, `terracotta`, `acacia`, `bark`)
- **Payments:** Official Stripe libraries (`stripe` on Node.js server routes, `@stripe/stripe-js` and `@stripe/react-stripe-js` on the client) supporting **both**:
  1. **Stripe Hosted Checkout** (`POST /api/checkout`)
  2. **Stripe Embedded Payment Element** (`POST /api/create-payment-intent`)
  3. **48-Hour Complimentary Permit Inquiry Hold** (`POST /api/checkout` / `POST /api/inquiries`)
- **Icons:** `lucide-react`

---

## Getting Started (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Populate `.env.local` with your Stripe Test Mode keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Zero-Config Interactive Sandbox Fallback:** If you run the project locally before adding your `sk_test_...` / `pk_test_...` keys, the booking engine automatically activates an **Interactive Stripe Test Mode Sandbox** (pre-configured with Stripe test cards `4242 4242 4242 4242` for success and `4000 0000 0000 0002` for decline testing) so you can test the entire end-to-end checkout, webhook, and confirmation dossier immediately.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Stripe Payment Gateway & Webhook Setup

### Sample Expeditions & Stripe Product Mapping

Defined in `src/data/expeditions.ts` and `src/lib/stripe.ts`:

| Expedition Title | Duration | Base Package (USD) | Official UWA Permit Fee | Stripe Product ID |
| :--- | :---: | :---: | :---: | :--- |
| **Bwindi Mist & Mountain Gorillas** | 5 Days | $3,450 | +$800 Gorilla Permit | `prod_jabali_bwindi_5d` |
| **Primate Kingdom: Kibale Chimps & Bwindi Gorillas** | 8 Days | $5,290 | +$800 Gorilla + $250 Chimp | `prod_jabali_primate_8d` |
| **Great Rift & Nile Safari: Murchison to Queen Elizabeth** | 7 Days | $3,890 | Included (Ziwa Rhino) | `prod_jabali_rift_7d` |
| **Kidepo Valley & Karamoja Walking Expedition** | 6 Days | $4,650 | Included (Armed Ranger) | `prod_jabali_kidepo_6d` |
| **Ultimate Pearl of Africa Grand Circuit** | 12 Days | $7,950 | +$800 Gorilla + $250 Chimp | `prod_jabali_pearl_12d` |
| **East Africa Icons: Bwindi Gorillas & Serengeti Plains** | 10 Days | $9,400 | +$800 Gorilla Permit | `prod_jabali_eastafrica_10d` |

### Dynamic Itemized Line Items

When a traveler books an expedition on `/booking`, `POST /api/checkout` dynamically constructs itemized Stripe line items:
1. **Safari Land Package** (Full 100% amount OR 30% Safari Deposit, automatically applying Emerald Green Season discounts for April, May, and November departures)
2. **Official Uganda Wildlife Authority (UWA) Permits** (100% required upfront per UWA regulations: `$800` Foreign Non-Resident / `$700` Foreign Resident / `$80` EAC Citizen for Bwindi Mountain Gorillas; `$250` / `$200` / `$30` for Kibale Chimpanzees)
3. **Private 4x4 Land Cruiser Charter** or **Premier Luxury Sanctuary Tier** upgrades
4. **Optional Field Add-ons** (4-Hour Rushaga Gorilla Habituation Upgrade `+$700`, AeroLink Bush Flight Entebbe–Kihihi `+$480`, Community Porter Pack `+$65`, Entebbe VIP Arrival Night `+$240`)

### Testing Stripe Webhooks Locally

The webhook handler at `src/app/api/webhooks/stripe/route.ts` verifies `stripe-signature` using `stripe.webhooks.constructEvent` and listens for:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `checkout.session.expired` / `payment_intent.payment_failed`

To forward events from the Stripe CLI during local development:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the resulting `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### Switching from Test Mode to Live Mode

1. In your [Stripe Dashboard](https://dashboard.stripe.com), toggle **Test mode** off and complete account activation.
2. Replace `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_...`) and `STRIPE_SECRET_KEY` (`sk_live_...`) in your Vercel project environment variables.
3. Add a production Webhook Endpoint in Stripe pointing to `https://your-domain.com/api/webhooks/stripe` subscribed to `checkout.session.completed` and `payment_intent.succeeded`, and set `STRIPE_WEBHOOK_SECRET` (`whsec_...`).

---

## Project Structure

```text
├── public/
│   └── images/                        # High-resolution Uganda & East Africa wildlife/landscape photos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── availability/route.ts  # Real-time monthly UWA permit & departure availability API
│   │   │   ├── bookings/route.ts      # Booking lookup & status update API
│   │   │   ├── checkout/route.ts      # Official Stripe Checkout Session creation API
│   │   │   ├── create-payment-intent/ # Official Stripe PaymentIntent API for Payment Element
│   │   │   ├── inquiries/route.ts     # Tailor-made safari inquiry endpoint
│   │   │   └── webhooks/stripe/       # Stripe webhook handler (checkout.session.completed)
│   │   ├── about/page.tsx             # Brand story, Ugandan primatologist guides & 5% conservation ledger
│   │   ├── booking/
│   │   │   ├── page.tsx               # Full real-time booking engine, UWA permit guide & packing list
│   │   │   ├── checkout/page.tsx      # Interactive Stripe Test Checkout sandbox experience
│   │   │   ├── success/page.tsx       # Confirmed safari dossier, UWA permit docket & receipt
│   │   │   └── cancel/page.tsx        # Graceful payment cancellation & retry flow
│   │   ├── contact/page.tsx           # Custom private charter inquiry builder & Kampala office info
│   │   ├── destinations/page.tsx      # Deep-dive into Uganda national parks & Serengeti extensions
│   │   ├── expeditions/
│   │   │   ├── page.tsx               # Filterable expedition catalog
│   │   │   └── [slug]/page.tsx        # Day-by-day expedition field dossier
│   │   └── page.tsx                   # Home page with quick-booking bar, featured treks & reviews
│   ├── components/
│   │   ├── Navbar.tsx                 # Sticky field header with live permit status indicator
│   │   ├── Footer.tsx                 # Conservation pledge, UTB/AUTO credentials & links
│   │   ├── ExpeditionCard.tsx         # Telemetry-rich expedition card
│   │   ├── HeroQuickBookingBar.tsx    # Interactive hero departure & permit finder
│   │   └── StripeEmbeddedPaymentModal.tsx # Embedded @stripe/react-stripe-js Payment Element modal
│   ├── data/
│   │   └── expeditions.ts             # Expeditions, destinations, guides & add-ons catalog
│   └── lib/
│       ├── booking-store.ts           # Dynamic pricing, UWA permit quota engine & booking persistence
│       └── stripe.ts                  # Stripe server SDK initialization & product mapping
└── .env.example                       # Environment variables template
```

---

## Deploying to Vercel or GitHub Pages / Cloudflare Pages

### Option A: Deploy to GitHub Pages (Automatic via GitHub Actions)

This repository includes a pre-configured GitHub Pages workflow at `.github/workflows/deploy-pages.yml` and a universal client+server booking engine (`src/lib/client-booking-engine.ts`) that works seamlessly on static hosts:

1. In your GitHub repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or `arena/01a0f714-jabali`) or trigger **Deploy Jabali Trails Africa to GitHub Pages** from the **Actions** tab.
4. The workflow automatically configures `NEXT_PUBLIC_BASE_PATH` (e.g. `/Jabali`), runs `npm run build:pages` to generate `./out` with `.nojekyll`, and publishes the static site.

To build the static Pages export locally (`./out`):

```bash
npm run build:pages
```

### Option B: Deploy to Vercel (Full Serverless + Stripe Webhooks)

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (set to your production Vercel URL)
4. Click **Deploy** (Vercel automatically sets `VERCEL=1`, activating the serverless `/api/*` routes).

---

## Connecting Real Inventory & Live UWA Permits Later

The availability and booking layer (`src/lib/booking-store.ts` and `src/app/api/availability/route.ts`) is architected for a clean drop-in upgrade to a production database (PostgreSQL / Supabase / Prisma) and external safari inventory feeds:

1. **UWA Gorilla & Chimpanzee Permits:** Replace `getMonthAvailability()` in `src/lib/booking-store.ts` with a scheduled sync from your Kampala operations desk database or accredited UWA E-Permit portal feed by sector (`Buhoma`, `Ruhija`, `Rushaga`, `Nkuringo`, `Kanyanchu`).
2. **Lodge Rooming Allocation:** Connect live bed-night availability via API bridges to **ResRequest** or **Checkfront / Rezdy** (commonly used by East African luxury lodges such as Sanctuary Gorilla Forest Camp, Clouds Mountain Gorilla Lodge, and Nile Safari Lodge).
3. **Database Persistence:** Swap `saveBooking()` and `updateBookingPaymentStatus()` in `src/lib/booking-store.ts` to write directly to PostgreSQL/Supabase when `/api/webhooks/stripe` receives `checkout.session.completed`.
