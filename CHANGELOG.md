# Changelog

All notable changes to the Unspent project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Documentation restructure (2026-05-01):
  - Created `/docs` directory with proper structure
  - Added Environment Variables Reference (`docs/configuration/ENVIRONMENT_VARIABLES.md`)
  - Added Database Schema Reference (`docs/database/SCHEMA.md`)
  - Added Edge Functions Reference (`docs/api-reference/EDGE_FUNCTIONS.md`)
  - Created Documentation Hub (`docs/README.md`)

### Fixed
- README version inaccuracies (2026-05-01):
  - Next.js: 14+ → 15.5.15 (verified from `apps/web/package.json:17`)
  - React: 18 → 19.1.0 (verified from `apps/web/package.json:18`)
  - Expo SDK: 52+ → 54.0.34 (verified from `apps/mobile/package.json:27`)
  - Marked unimplemented features as "Planned" (Phase 3-5 features)

### Changed
- Updated tech stack table in README with verified versions
- Added "Planned" markers to features not yet implemented

---

## [1.0.0] - 2026-04-30 (Initial MVP)

### Added
- **Phase 1: Auth & Wish Wall**
  - Age gate (13+ enforcement via Supabase trigger)
  - Magic link + OAuth (Apple/Google Sign-In) via Supabase Auth
  - Wish Wall CRUD with 72-hour cooling-off timer
  - Image picker (Expo Image Picker)
  - URL metadata scraper (Edge Function: `preview-link`)

- **Phase 2: The Court - Community Voting**
  - Drop items into "The Court" for community voting
  - Real-time vote counts (Buy / Pass / Dupe it)
  - Vote reasons (chips: "Too expensive", "Wait for sale", etc.)
  - 72-hour verdict (threshold: 3 votes, auto-pass if not enough)
  - PostgreSQL function: `calculate_vote_outcome()`

- **Phase 3: Dupe Engine (Partial)**
  - Serper API integration (Google Shopping search)
  - OpenAI GPT-4o-mini enhancement (confidence scoring)
  - Edge Function: `search-dupes`
  - Max 3 dupe lookups/week for free users

- **Phase 4: Monetization (Partial)**
  - Stripe Checkout integration (Edge Function: `create-checkout`)
  - Stripe Webhook handler (Edge Function: `stripe-webhook`)
  - Premium features: unlimited friends, dupe lookups
  - Pricing: $4.99/month or $39.99/year (configurable)

- **Phase 5: Virality (Planned)**
  - Share cards (SVG generation via Edge Function: `generate-share-card`)
  - Deep linking (unspent.app/court/{id})

- **Database**
  - 7 tables: profiles, wishlist_items, friendships, votes, savings_tallies, dupes_log, subscriptions, moderation_reports
  - Row Level Security (RLS) on all tables
  - PostgreSQL 17 with 5 migrations
  - Scheduled job: `process-vested` (every 5 minutes via pg_cron)

- **Mobile App (Expo)**
  - Bottom tab navigation: Home | Court | Dupes | Profile
  - Zustand state management
  - NativeWind (Tailwind for React Native)
  - Sentry integration for error tracking

- **Web App (Next.js)**
  - App Router with OG image generation (@vercel/og)
  - Tailwind CSS styling
  - Vercel deployment (Node 22.x)

- **Edge Functions (6 total)**
  - `create-checkout` - Stripe subscription checkout
  - `stripe-webhook` - Stripe event handler
  - `search-dupes` - AI-powered dupe search
  - `process-vested` - Cron job for expired items
  - `generate-share-card` - SVG share card generation
  - `preview-link` - Open Graph metadata scraper

### Security
- COPPA compliance (no PII stored for <13)
- Body-shaming blocklist (Ozempic, diet pills, etc.)
- Affiliate disclosure requirement
- Server-side field protection (total_saved_amount, premium_until, etc.)
- No self-friendship constraint
- Unique friendship pairs (ordered)

### Infrastructure
- Monorepo with pnpm workspaces
- Supabase (Postgres + Auth + Edge Functions + Storage)
- Vercel deployment for web (auto from Git)
- EAS Build for mobile (iOS + Android)

---

## [Template for Future Releases]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Any bug fixes

### Security
- Security-related changes

---

**Legend:**
- ✅ = Implemented and verified
- 🟡 = Partially implemented
- ❌ = Planned/not implemented
- *Planned* = Feature mentioned in code but not yet built
