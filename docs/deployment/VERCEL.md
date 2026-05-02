# Vercel Web Deployment

> **Source:** `.vercel/project.json`, `apps/web/package.json`  
> **Last verified:** 2026-05-01  
> **Framework:** Next.js 15.5.15 (App Router)

## Vercel Project Configuration---

| Setting | Value | Source |
|---------|-------|--------|
| **projectId** | `prj_Ft5EJv9h1M74sOMHVseY5GGj0B2Y` | `.vercel/project.json` |
| **orgId** | `team_lKxm4TiZs6QTZkhNqRW288Bg` | `.vercel/project.json` |
| **framework** | `nextjs` | `.vercel/project.json` |
| **rootDirectory** | `apps/web` | `.vercel/project.json` |
| **buildCommand** | `pnpm build` | `.vercel/project.json` |
| **installCommand** | `pnpm install` | `.vercel/project.json` |
| **outputDirectory** | `.next` | `.vercel/project.json` |
| **nodeVersion** | `22.x` | `.vercel/project.json` |
| **devCommand** | `null` (use `pnpm dev:web`) | `.vercel/project.json` |

---

## Environment Variables in Vercel---

### Public (Client-Side)

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value Example | Notes |
|-----------|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anon key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key |
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_...` | PostHog key (optional) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` | PostHog host (optional) |
| `APP_SCHEME` | `unspent` | Deep link scheme |
| `NEXT_PUBLIC_WEB_URL` | `https://unspent.app` | Production web URL |

### Private (Server-Side)

| Variable | Notes |
|-----------|-------|
| `SUPABASE_URL` | Same as public URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (keep secret!) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_MONTHLY` | Price ID for $4.99/month plan |
| `STRIPE_PRICE_YEARLY` | Price ID for $39.99/year plan |
| `OPENAI_API_KEY` | OpenAI API key (for dupe search) |
| `SERPER_API_KEY` | Serper API key (for dupe search) |

---

## Deployment Methods---

### 1. Vercel CLI (Manual)

```bash
# Install Vercel CLI
npm i -g vercel

# From project root (auto-detects monorepo)
vercel --prod

# Or from apps/web directory
cd apps/web
vercel --prod
```

### 2. Git Integration (Recommended)

Connect your Git repository to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your repository
3. Vercel auto-detects Next.js settings from `.vercel/project.json`
4. Push to `main` → automatic production deployment
5. PRs → automatic preview deployments

### 3. Preview Deployments

```bash
# From project root
vercel

# Or with specific branch
vercel --preview
```

Preview URLs follow pattern: `https://unspent-[branch]-[org].vercel.app`

---

## Build Configuration---

### package.json Scripts (apps/web)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

**Source:** `apps/web/package.json:6-10`

### Next.js Config

The web app uses Next.js App Router with:
- **@vercel/og** for OG image generation (`app/sharecard/[id]/route.tsx`)
- **Tailwind CSS** 3.4 for styling
- **Server Components** by default
- **Client Components** where marked with `"use client"`

---

## Environment-Specific Settings---

### Production

| Setting | Value |
|---------|-------|
| **URL** | `https://unspent.app` (or custom domain) |
| **Node.js** | 22.x |
| **Build** | `pnpm --filter @unspent/web build` |
| **Install** | `pnpm install` |

### Preview / Staging

Use separate Supabase project for staging:
- Different `NEXT_PUBLIC_SUPABASE_URL`
- Different `STRIPE_*` keys (test mode)
- Different `OPENAI_API_KEY` (if budget allows)

---

## Troubleshooting---

### Build Fails: "pnpm not found"

**Solution:** Vercel uses `pnpm` from `packageManager` field in root `package.json`:
```json
{
  "packageManager": "pnpm@10.33.2"
}
```

**Source:** `package.json:5`

### Build Fails: Type Errors

```bash
# Run typecheck locally first
pnpm typecheck
```

### OG Images Not Generating

Check that `@vercel/og` is installed:
```bash
# apps/web/package.json:15
"@vercel/og": "^0.6.2"
```

---

## CI/CD Integration---

### GitHub Actions (Planned)

```yaml
# .github/workflows/deploy-web.yml (planned)
name: Deploy Web to Vercel
on:
  push:
    branches: [main]
    paths: ['apps/web/**', 'packages/shared/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.33.2
      - run: pnpm install
      - run: pnpm --filter @unspent/web build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Monitoring---

### Sentry (Configured)

| Setting | Value |
|---------|-------|
| **DSN** | `SENTRY_DSN` env var |
| **Organization** | `SENTRY_ORG` |
| **Project** | `unspent` |
| **Auth Token** | `SENTRY_AUTH_TOKEN` (for source map upload) |

### PostHog (Analytics)

| Setting | Value |
|---------|-------|
| **Web Key** | `NEXT_PUBLIC_POSTHOG_KEY` |
| **Mobile Key** | `EXPO_PUBLIC_POSTHOG_KEY` |
| **Host** | `https://app.posthog.com` |

---

## Rollback---

### Via Vercel Dashboard

1. Go to project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel promote <deployment-url>
```

---

**Next.js 15.5.15 on Vercel with Node 22.x**
