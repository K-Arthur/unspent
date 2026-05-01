# Unspent - Social Deinfluencing Wishlist App

Turn impulse-buy regret into a daily, gamified habit. Women paste items they want onto a **Wish Wall**, wait a 72-hour cooling period, and let friends + community vote **Buy / Pass / Dupe it**. A running tally of money not spent provides emotional payoff and viral share-cards.

> *"Pinterest meets Robinhood for the deinfluencing generation."*

---

## Monorepo Structure

```
/unspent
├── apps/
│   ├── mobile/        # Expo (React Native) - iOS & Android (TestFlight)
│   │   ├── app/       # Expo Router (file-based navigation)
│   │   ├── src/       # Components, hooks, utilities
│   │   └── supabase/  # Database migrations + Edge Functions
│   └── web/          # Next.js 14+ (Vercel) - Landing + share cards
│       └── src/       # Components, pages, OG images
└── packages/
    └── shared/       # TypeScript types, Zod schemas, constants
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|--------------|------|
| **Mobile** | Expo SDK 52+, React Native | Hot-reload, OTA updates, iOS + Android |
| **Backend** | Supabase (Postgres, Auth, Realtime, Storage) | Instant scalable DB, RLS, built-in auth |
| **Web** | Next.js 14+ (App Router), TailwindCSS | SEO, OG images, share-card previews |
| **Payments** | Stripe (web) + RevenueCat (mobile) | Subscriptions, IAP compliance |
| **AI Dupe Engine** | OpenAI GPT-4o-mini + SerpAPI | Cheaper alternatives, $0.01/call |
| **Analytics** | PostHog | Funnels, retention, virality coefficient |
| **Deployment** | Vercel (web) + EAS Build (mobile) | Instant CDN, TestFlight |

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
- 72-hour verdict (auto-pass if not enough votes)
- Push notifications for results

### ✅ Phase 3: Dupe Engine
- AI-powered cheaper alternative search
- SerpAPI (Google Shopping) + OpenAI enhancement
- Confidence scoring (0-1)
- Affiliate links (Skimlinks/Amazon Associates)
- Premium feature (free users get 1 blurred dupe)

### ✅ Phase 4: Monetization
- Stripe Checkout integration
- RevenueCat for mobile IAP (Apple/Google compliance)
- Premium features: unlimited friends, dupe lookups, premium share cards
- $4.99/month or $39.99/year

### ✅ Phase 5: Virality
- Share cards (SVG/OG images) with QR codes
- Deep linking (unspent.app/court/{id})
- Referral system (invite friends → premium trial)
- TikTok/Instagram-ready shareable content

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
cd apps/mobile
supabase start          # Local Supabase
supabase db:push       # Push migrations
supabase functions:serve # Local edge functions
```

---

## Database Schema

Run the migration in `apps/mobile/supabase/migrations/001_initial_schema.sql`:

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
- Build Command: `pnpm build`
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

- **Unit Tests**: Vote outcome calculation, savings tally, cooldown expiry
- **Integration Tests**: Supabase edge functions with local DB
- **E2E Tests**: Detox for sign-up, add item, vote flows
- **Manual QA**: TestFlight checklist for free/premium gates, share cards, deep links

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