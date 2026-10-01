# Jabali Trails Africa — Guided Expeditions in Uganda & East Africa

Production-ready marketing and real-time booking platform for **Jabali Trails Africa**, a conservation-minded East African expedition outfitter specializing in mountain gorilla trekking in **Bwindi Impenetrable National Park**, chimpanzee tracking in **Kibale Forest**, walking safaris in **Kidepo Valley**, classic big-game safaris across **Murchison Falls** & **Queen Elizabeth National Park**, and cross-border fly-in extensions to the **Serengeti**.

---

## Tech Stack

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/) + React 18
- **Language:** TypeScript (`strict` mode)
- **Styling:** Tailwind CSS with the **Equatorial Field Journal** design system — semantic RGB-channel CSS variables (`surface`, `heading`, `ink`, `panel`, `accent`, `gold`, `pos`) so a single class set renders both Daylight and Night Field modes
- **Typography:** **Sora** for display/headings and interface labels, **Sen** for body copy (loaded from Google Fonts with `display=swap` and `preconnect`)
- **Payments:** Official Stripe libraries (`stripe` on Node.js server routes, `@stripe/stripe-js` and `@stripe/react-stripe-js` on the client) supporting **both**:
  1. **Stripe Hosted Checkout** (`POST /api/checkout`)
  2. **Stripe Embedded Payment Element** (`POST /api/create-payment-intent`)
  3. **48-Hour Complimentary Permit Inquiry Hold** (`POST /api/checkout` / `POST /api/inquiries`)
- **Icons:** `lucide-react`

---

## Interface, Motion & Guest Experience

The front end was rebuilt on a two-font, dual-theme design system with a full interaction layer.
Everything below is live in this repository (no placeholder screens):

**Global shell**
- ⌘K / Ctrl-K **command palette** searching all six expeditions, six destinations, the guide roster, every page and direct actions (switch theme, switch currency, open the permit calendar, jump to your shortlist)
- **Daylight / Night Field mode** driven by CSS variables, applied pre-paint (no flash) and persisted per device
- **Currency switcher** (USD · EUR · GBP · UGX) shared by the navbar, catalogue, booking rail and ops console
- **Saved shortlist** (localStorage) with navbar badge, `/expeditions?view=saved` filtered view and toast confirmations
- **Compare tray** (up to three itineraries) with a difference-only comparison modal
- Reading-progress rule, sticky shrinking header, back-to-top control, skip-to-content link, accessible dialogs (focus trap, ESC, scroll lock), `prefers-reduced-motion` and high-contrast support, field-grain + topographic textures, scroll-reveal primitives and count-up statistics
- `sitemap.xml`, `robots.txt`, web-app manifest, favicon, per-route metadata, OpenGraph/Twitter cards, branded 404 + error boundary + route loading skeleton

**Catalogue & dossiers**
- URL-synced filters (category, duration, difficulty, budget slider, permits-included, free-text), five sort modes, grid/list layouts, saved-only view and CSV-ready compare tray
- Expedition dossiers with a scrollspy section rail, day-by-day expandable itinerary, **full-screen gallery lightbox** (keyboard, swipe, zoom, thumbnails), **12-month permit & price heatmap** that deep-links into the calendar, permit FAQ and related-trip rail
- Live UWA permit telemetry chips on every card and dossier, backed by `/api/availability`

**Booking engine**
- Three-step configurator with a sticky progress rail, completion ticks and per-step jump links
- Real-time permit calendar, tier/add-on configurator, **inline field validation** that paints and clears its own error notes, and a scroll-to-first-problem summary
- **Travelling-party manifest** — every permit holder is captured with passport, nationality, date of birth and notes, persisted through Stripe checkout, the Stripe Payment Element and the local fallback engine
- **Autosaved draft** (restore banner + start-fresh) and a **persisted packing checklist** with progress bar and downloadable `.txt` copy
- Confirmation dossier with countdown, permit roster, **calendar invite (.ics) export**, copy-reference, print styles and reschedule/cancel actions

**Contact, about & ops console**
- Inquiry builder with validation, draft autosave, downloadable brief and a live indicative quote matched to the closest catalogue itinerary
- Conservation-ledger calculator, guide roster with ask-a-guide form, Bwindi/Kibale UWA permit guide and packing checklist anchors
- Ops console behind a demo passcode gate (`jabali2026`): KPI counters, revenue-by-expedition chart, ledger search/status filters, CSV export, expandable booking dossiers (party manifest, itemised ledger, Stripe IDs), UWA quota overrides, webhook ledger and inquiry pipeline

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

Other useful scripts:

```bash
npm run lint        # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit
npm run build       # production build + type/lint gate
npm start           # serve the production build on 0.0.0.0:3000
```

### 4. Operations Console

`/admin` is protected by a client-side demo gate. The passcode is **`jabali2026`** and the unlock is remembered for the browser session. Replace the gate with SSO or a signed server session before running this in production.

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
│   ├── images/                        # High-resolution Uganda & East Africa wildlife/landscape photos
│   └── manifest.webmanifest           # Installable web-app manifest + shortcuts
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
│   │   ├── error.tsx                  # Branded error boundary with incident reference
│   │   ├── loading.tsx                # Route-transition skeleton
│   │   ├── not-found.tsx              # 404 with search + suggested itineraries
│   │   ├── robots.ts / sitemap.ts     # SEO surfaces generated from the catalogue
│   │   └── page.tsx                   # Home page with quick-booking bar, featured treks & reviews
│   ├── components/
│   │   ├── providers/SiteProvider.tsx # Theme, currency, shortlist, compare tray, toasts, ⌘K state
│   │   ├── ui/                        # Reveal, Modal, Accordion, Lightbox, Stat, Skeleton, Toaster
│   │   ├── CommandPalette.tsx         # ⌘K search across expeditions, parks, guides & actions
│   │   ├── DossierNav.tsx             # Scrollspy section rail for long-form pages
│   │   ├── BookingProgressRail.tsx    # Step rail + completion telemetry on /booking
│   │   ├── SeasonQuotaChart.tsx       # 12-month permit & price heatmap
│   │   ├── ExpeditionGallery.tsx      # Lightbox field gallery
│   │   ├── LivePermitChip.tsx         # Live UWA quota chip for cards & dossiers
│   │   ├── WishlistButton.tsx         # Saved-shortlist toggle
│   │   ├── FaqAccordion.tsx           # Filterable permit/payment FAQ
│   │   ├── TestimonialCarousel.tsx    # Auto-rotating verified guest dispatches
│   │   ├── Navbar.tsx                 # Sticky field header with search, theme, currency, shortlist
│   │   ├── Footer.tsx                 # Conservation pledge, validated newsletter, UTB/AUTO credentials
│   │   ├── ExpeditionCard.tsx         # Telemetry-rich expedition card
│   │   ├── HeroQuickBookingBar.tsx    # Interactive hero departure & permit finder
│   │   └── StripeEmbeddedPaymentModal.tsx # Embedded @stripe/react-stripe-js Payment Element modal
│   ├── data/
│   │   └── expeditions.ts             # Expeditions, destinations, guides & add-ons catalog
│   └── lib/
│       ├── booking-store.ts           # Dynamic pricing, UWA permit quota engine & booking persistence
│       ├── format.ts                  # Date/price formatting, ICS invites, CSV export, clipboard
│       ├── pricing.ts                 # Pricing engine + BookingRecord/TravelerCompanion types
│       └── stripe.ts                  # Stripe server SDK initialization & product mapping
└── .env.example                       # Environment variables template
```

---

## Deploying to Vercel, GitHub Pages or Cloudflare Pages

### Option A: Continuous verification (GitHub Actions)

`.github/workflows/deploy-pages.yml` runs on every push to `main` and the Arena session branches. It installs dependencies, then executes `npm run lint`, `npm run typecheck` and `npm run build` — so lint, TypeScript and the production build are verified before anything ships.

The site is **not** a static export: the Stripe checkout, payment-intent, webhook, availability and inquiry endpoints are Node route handlers, and every route is intentionally rendered dynamically (`ƒ`) against the live permit store. Deploy it to a Node-capable host (Vercel, Fly.io, Render, a container, or any Node 18+ server) with the environment variables configured. `src/lib/client-booking-engine.ts` keeps the booking flow working (with a local quota engine and localStorage persistence) if the API routes are ever unreachable.

### Option B: GitHub Pages static demo (`index.html`)

<https://iscorockie.github.io/Jabali/> is served by legacy GitHub Pages straight from the root `index.html` on `main` (no build, no workflow). It is a single self-contained file that mirrors the production app so the demo never drifts from the design system:

- **Same design system** — Sen + Sora typography, the semantic RGB design tokens from `src/app/globals.css`, Daylight / Night Field themes with the same pre-paint boot script and `jabali_theme` key, reveal animations, reduced-motion and print styles.
- **Same interaction layer** — ⌘K command palette (same fuzzy `score()` ranking), saved shortlist (`jabali_wishlist_v1`), compare tray (`jabali_compare_v1`, max 3, diff-only view), USD / EUR / GBP / UGX currency switcher (`jabali_currency_v1`), catalogue filters / sort / grid-list, interactive SVG corridor map, destination and expedition dossiers, testimonial carousel, FAQ accordion, toasts.
- **Same booking engine** — the FNV-1a quota engine from `src/lib/client-booking-engine.ts` and the pricing rules from `src/lib/pricing.ts` are ported line-for-line (verified in parity tests across 2,500+ dates), so the live permit calendar, 12-month season heatmap, residency / tier / style / plan quote ledger and 48-hour holds (`jabali_trails_bookings_v1`) behave exactly like the app. The ops-desk mini console uses the same demo passcode (`jabali2026`) and exports a CSV docket.
- **Static-host constraints** — Stripe Checkout, webhooks and permit issuance are server features and stay on the Node deployment; the demo explains this inline. All asset paths are relative (`public/images/...`) so the page works under the `/Jabali/` sub-path.

When you change tokens, copy or data in the app, mirror the change in `index.html` (data lives in one block at the top of its script).

### Option C: Deploy to Vercel (Full Serverless + Stripe Webhooks)

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
