# Unspent Documentation Hub

> **Project:** Unspent - Social Deinfluencing Wishlist App  
> **Last updated:** 2026-05-01  
> **Status:** Actively maintained

Welcome to the Unspent documentation. This hub organizes all technical documentation for developers, operators, and AI agents.

---

## 📚 Documentation Sections---

### 🚀 [API Reference](./api-reference/)

- **[Edge Functions](./api-reference/EDGE_FUNCTIONS.md)** — 6 Supabase Edge Functions (Stripe, Dupe Search, Share Cards, etc.)
- **[OpenAPI Spec](./api-reference/openapi.yaml)** — *Planned*

---

### 🔧 [Configuration](./configuration/)

- **[Environment Variables](./configuration/ENVIRONMENT_VARIABLES.md)** — Complete reference for all 60+ env vars

---

### 🗄️ [Database](./database/)

- **[Schema Reference](./database/SCHEMA.md)** — 7 tables, RLS policies, functions, triggers, migrations

---

### 🚀 [Deployment](./deployment/)

- **[Vercel Setup](./deployment/VERCEL.md)** — Next.js web deployment (Node 22.x)
- **[EAS Build](./deployment/EAS.md)** — Expo iOS/Android builds
- **[Supabase Local](./deployment/SUPABASE_LOCAL.md)** — Local development setup

---

## 📖 Project Planning Docs (in repo root)

| Document | Purpose | Status |
|----------|---------|--------|
| **[README.md](../README.md)** | Project overview, tech stack, features | ✅ Active |
| **[ACCESSIBILITY_PLAN.md](../ACCESSIBILITY_PLAN.md)** | WCAG 2.2 AA compliance plan | ✅ Phases 1-2 done |
| **[NAVIGATION_OVERHAUL_PLAN.md](../NAVIGATION_OVERHAUL_PLAN.md)** | Mobile nav & usability fixes | ✅ P0 done |

---

## 🤖 For AI Agents (LLM Context)

- **[llms.txt](./llms.txt)** — Machine-readable project manifest (*Planned*)
- **[.agents/product-marketing-context.md](../.agents/product-marketing-context.md)** — *Create me*

---

## 📋 Quick Reference---

### Monorepo Structure (Verified 2026-05-01)

```
/unspent
├── apps/
│   ├── mobile/        # Expo SDK 54+, React Native 0.81.5, React 19
│   │   ├── app/       # Expo Router (file-based navigation)
│   │   └── src/       # Components, hooks, utilities, stores
│   └── web/          # Next.js 15.5.15, React 19, Tailwind 3.4
│       └── src/       # Components, pages, OG image generation
├── packages/
│   └── shared/       # TypeScript types, Zod schemas, constants
├── supabase/         # DB migrations + Edge Functions
│   ├── migrations/   # 5 SQL migration files
│   └── functions/   # 6 Deno Edge Functions
├── docs/             # This documentation hub
├── .vercel/          # Vercel deployment config
└── node_modules/     # pnpm workspace dependencies
```

### Tech Stack (Verified)

| Layer | Technology | Version |
|-------|--------------|---------|
| **Mobile** | Expo SDK | 54.0.34 |
| **Mobile** | React Native | 0.81.5 |
| **Mobile** | React | 19.1.0 |
| **Mobile** | Zustand | 5.0.12 |
| **Web** | Next.js | 15.5.15 |
| **Web** | React | 19.1.0 |
| **Web** | Node.js | 22.x (Vercel) |
| **Backend** | Supabase (Postgres 17) | - |
| **Backend** | Edge Functions (Deno) | - |
| **Package Mgr** | pnpm | 10.33.2 |
| **Languages** | TypeScript | 5.9.3 |

### Key Constants (from `packages/shared/src/constants/index.ts`)

| Constant | Value | Purpose |
|-----------|-------|---------|
| `COOLDOWN_HOURS` | `72` | Hours before item can be voted on |
| `COOLDOWN_MS` | `259200000` | MS equivalent (72 × 60 × 60 × 1000) |
| `MAX_FREE_VOTES_PER_WEEK` | `5` | Free user weekly vote limit |
| `MAX_FREE_FRIENDS` | `20` | Free user friend limit |
| `MAX_WISHLIST_ITEMS` | `100` | Max items per user |
| `VOTE_THRESHOLD` | `3` | Min votes for valid outcome |
| `PREMIUM_PRICE_MONTHLY` | `499` ($4.99) | Monthly plan price (cents) |
| `PREMIUM_PRICE_YEARLY` | `3999` ($39.99) | Yearly plan price (cents) |
| `TRIAL_DAYS` | `7` | Premium trial period |
| `DUPES_TO_FETCH` | `3` | Max dupes returned per search |

---

## 🔗 Quick Links---

### Development
- **Local setup:** Copy `.env.example` → `.env.local`, run `pnpm install`, `pnpm dev:web`
- **Supabase local:** `pnpm supabase:start`
- **Mobile dev:** `pnpm dev:mobile` (opens Expo DevTools)

### External
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Vercel Dashboard:** https://vercel.com/team_lKxm4TiZs6QTZkhNqRW288Bg/unspent
- **Expo Dashboard:** https://expo.dev

### Community
- **Twitter:** [@unspent](https://twitter.com/unspent)
- **Instagram:** [@unspent_app](https://instagram.com/unspent_app)
- **TikTok:** [@unspent](https://tiktok.com/@unspent)

---

## 📝 Documentation Change Log---

| Date | Change | Author |
|------|--------|--------|
| 2026-05-01 | Initial documentation restructuring | AI Agent |
| 2026-05-01 | Fixed README version inaccuracies | AI Agent |
| 2026-05-01 | Added Environment Variables Reference | AI Agent |
| 2026-05-01 | Added Database Schema Reference | AI Agent |
| 2026-05-01 | Added Edge Functions Reference | AI Agent |

---

## 🚨 Documentation Status---

| Section | Status | Last Verified |
|---------|--------|----------------|
| README.md | ✅ Complete | 2026-05-01 |
| Environment Variables | ✅ Complete | 2026-05-01 |
| Database Schema | ✅ Complete | 2026-05-01 |
| Edge Functions | ✅ Complete | 2026-05-01 |
| Vercel Deployment | 🟡 In Progress | - |
| EAS Build | 🟡 In Progress | - |
| CHANGELOG.md | 🟡 In Progress | - |
| CONTRIBUTING.md | 🟡 In Progress | - |
| llms.txt | ❌ Planned | - |
| OpenAPI Spec | ❌ Planned | - |

---

## 📖 How to Contribute to Docs---

1. **Small fixes:** Edit files directly, commit with `docs:` prefix
2. **New sections:** Discuss in PR first, follow existing structure
3. **Evidence-based:** Every claim must trace to source code (see `docs/database/SCHEMA.md` for examples)
4. **AI-friendly:** Use tables, code blocks, and clear headings

### Doc Linting (Planned)

```bash
# Check broken links (planned)
pnpm dlx markdown-link-check docs/**/*.md

# Lint markdown
pnpm dlx markdownlint-cli docs/**/*.md
```

---

**Made with ❤️ for the deinfluencing generation.**
