# Unspent - Social Deinfluencing Wishlist App

Turn impulse-buy regret into a daily, gamified habit. Women paste items they want onto a **Wish Wall**, wait a 72-hour cooling period, and let friends + community vote **Buy / Pass / Dupe it**. A running tally of money not spent provides emotional payoff and viral share-cards.

> *"Pinterest meets Robinhood for the deinfluencing generation."*

---

## Documentation

> **Full documentation available in [`/docs`](./docs/)**

| Section | Description |
|---------|-------------|
| [Docs Hub](./docs/README.md) | Documentation index, tech stack, quick reference |
| [API Reference](./docs/api-reference/EDGE_FUNCTIONS.md) | 6 Supabase Edge Functions |
| [Configuration](./docs/configuration/ENVIRONMENT_VARIABLES.md) | 60+ environment variables reference |
| [Database Schema](./docs/database/SCHEMA.md) | 7 tables, RLS policies, functions, migrations |
| [Deployment](./docs/deployment/) | Vercel (web), EAS (mobile), Supabase local |
| [Changelog](./CHANGELOG.md) | Project changelog (Keep a Changelog) |
| [Contributing](./CONTRIBUTING.md) | Guidelines for contributors + AI agents |

---

## Monorepo Structure

```
/unspent
├── apps/
│   ├── mobile/        # Expo (React Native) - iOS & Android (TestFlight)
│   │   ├── app/       # Expo Router (file-based navigation)
│   │   └── src/       # Components, hooks, utilities
│   └── web/          # Next.js 14+ (Vercel) - Landing + share cards
│       └── src/       # Components, pages, OG images
├── packages/
│   └── shared/       # TypeScript types, Zod schemas, constants
└── supabase/         # Database migrations + Edge Functions
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|--------------|------|
| **Mobile** | Expo SDK 54+, React Native 0.81.5, React 19 | Hot-reload, OTA updates, iOS + Android |
| **Backend** | Supabase (Postgres 17, Auth, Edge Functions, Storage) | Instant scalable DB, RLS, built-in auth |
| **Web** | Next.js 15.5.15 (App Router), React 19, TailwindCSS 3.4 | SEO, OG images, share-card previews |
| **Payments** | Stripe (web) + RevenueCat (mobile) | Subscriptions, IAP compliance |
| **AI Dupe Engine** | OpenAI GPT-4o-mini + Serper API | Cheaper alternatives, ~$0.01/call |
| **Analytics** | PostHog + Sentry | Funnels, retention, virality coefficient, error tracking |
| **Deployment** | Vercel (web, Node 22.x) + EAS Build (mobile) | Instant CDN, TestFlight |

---

## Features (MVP)

### ✅ Phase 1: Auth & Wish Wall
- Age gate (16+ enforcement, COPPA compliance)
- Magic link + OAuth (Apple/Google Sign-In)
- Wish Wall CRUD with 72-hour cooling-off timer
- Image picker/screenshot upload
- URL metadata scraper (Open Graph)

### ✅ Phase 2: The Court - Community Voting
- Drop items into "The Court" for community voting
- Real-time vote counts (Buy / Pass / Dupe it)
- Vote reasons (chips: "Too expensive", "Wait for sale", etc.)
- 72-hour verdict (auto-pass if not enough votes) — *Threshold: 3 votes*
- Push notifications for results — *Planned*

### ✅ Phase 3: Dupe Engine
- AI-powered cheaper alternative search — *Planned (Serper API integrated)*
- Serper API (Google Shopping) + OpenAI enhancement
- Confidence scoring (0-1)
- Affiliate links (Skimlinks/Amazon Associates) — *Planned*
- Premium feature (free users get 3 dupe lookups/week)

### ✅ Phase 4: Monetization
- Stripe Checkout integration — *Planned*
- RevenueCat for mobile IAP (Apple/Google compliance) — *Planned*
- Premium features: unlimited friends, dupe lookups, premium share cards — *Partial*
- $4.99/month or $39.99/year (configurable via env vars)

### ✅ Phase 5: Virality
- Share cards (SVG/OG images) with QR codes
- Deep linking (unspent.app/court/{id})
- Referral system (invite friends → premium trial) — *Planned*
- TikTok/Instagram-ready shareable content — *Planned*

---

## Environment Setup

1. **Copy example env file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your credentials:**
   - Supabase project (create at [supabase.com](https://supabase.com))
   - Stripe API keys (create at [stripe.com](https://stripe.com))
   - SerpAPI key (optional, for dupe search)
   - OpenAI API key (optional, for AI enhancement)

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

---

## Development

### Web (Next.js)
```bash
cd apps/web
pnpm dev        # http://localhost:3000
pnpm build      # Production build
```

### Mobile (Expo)
```bash
cd apps/mobile
pnpm start       # Expo DevTools
pnpm dev:ios    # iOS simulator
pnpm dev:android # Android emulator
```

### Supabase (Edge Functions)
```bash
pnpm supabase:start     # Local Supabase
pnpm supabase:db:push   # Push migrations
pnpm supabase:functions # Local edge functions
```

---

## Database Schema

Run the migration in `supabase/migrations/001_initial_schema.sql`:

- **profiles** - User profiles (extends auth.users)
- **wishlist_items** - Wish list items with status
- **friendships** - Friend relationships
- **votes** - Community votes on items
- **savings_tallies** - Running total of money saved
- **dupes_log** - AI-found cheaper alternatives
- **subscriptions** - Stripe/RevenueCat subscription status
- **moderation_reports** - Content moderation flags

All tables have **Row Level Security (RLS)** enabled.

---

## Deployment

### Web → Vercel
```bash
# From project root
vercel --prod

# Or from apps/web (auto-detected)
cd apps/web
vercel --prod
```

**Vercel Settings:**
- Build Command: `pnpm --filter @unspent/web build`
- Install Command: `pnpm install`
- Output Directory: `apps/web/.next`
- Node.js Version: 22.x

### Mobile → TestFlight (iOS)
```bash
cd apps/mobile
eas build --platform ios --profile preview   # Beta testing
eas build --platform ios --profile production  # App Store
eas submit --latest                              # Submit to App Store
```

---

## Testing Strategy

> **Current Status:** No automated tests found. Add tests when implementing features.

- **Unit Tests**: Vote outcome calculation, savings tally, cooldown expiry — *Planned*
- **Integration Tests**: Supabase edge functions with local DB — *Planned*
- **E2E Tests**: Detox for sign-up, add item, vote flows — *Planned*
- **Manual QA**: TestFlight checklist for free/premium gates, share cards, deep links — *Planned*

---

## Content Moderation & Safety

- ✅ Age gate (16+ enforced server-side via Supabase trigger)
- ✅ OpenAI Moderation endpoint for text/images
- ✅ Community reporting (auto-hide after 2 reports)
- ✅ COPPA compliance (no PII stored for <13)
- ✅ No body-shaming (blocklist: Ozempic, diet pills)
- ✅ Affiliate disclosure ("We may earn a commission")

---

## Risk Mitigation

- **Affiliate-mission tension**: Permanent disclaimer in Dupe Finder
- **Defensibility**: Cumulative savings history + "streak" concept
- **Apple ATT**: No IDFA usage; server-side affiliate redirects
- **Offline support**: SQLite/MMKV cache with sync on resume
- **Rate limiting**: Upstash Redis for voting + dupe endpoints

---

## License

MIT

---

## Contact

- Twitter: [@unspent](https://twitter.com/unspent)
- Instagram: [@unspent_app](https://instagram.com/unspent_app)
- TikTok: [@unspent](https://tiktok.com/@unspent)

**Made with ❤️ for the deinfluencing generation.**
