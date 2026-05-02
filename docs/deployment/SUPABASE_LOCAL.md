# Supabase Local Development

> **Source:** `supabase/config.toml`, `supabase/migrations/`  
> **Last verified:** 2026-05-01  
> **Postgres:** Version 17  
> **Studio Port:** 54323

## Quick Start---

```bash
# From project root
supabase start

# Should output:
# Started supabase locally:
#  - API URL: http://localhost:54321
#  - GraphQL URL: http://localhost:54321/graphql/v1
#  - Sudio URL: http://localhost:54323
#  - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
```

---

## Configuration (`supabase/config.toml`)---

### API Settings

| Setting | Value | Source |
|---------|-------|--------|
| **port** | `54321` | `supabase/config.toml:5` |
| **schemas** | `["public", "graphql_public"]` | `supabase/config.toml:6` |
| **max_rows** | `1000` | `supabase/config.toml:8` |

### Database Settings

| Setting | Value |
|---------|-------|
| **port** | `54322` (DB), `54320` (shadow) |
| **major_version** | `17` |

### Auth Settings

| Setting | Value | Source |
|---------|-------|--------|
| **site_url** | `http://localhost:3000` | `supabase/config.toml:31` |
| **jwt_expiry** | `3600` (1 hour) | `supabase/config.toml:37` |
| **enable_signup** | `true` | `supabase/config.toml:38` |
| **enable_anonymous_sign_ins** | `false` | `supabase/config.toml:39` |

#### Additional Redirect URLs

```toml
additional_redirect_urls = [
  "exp://127.0.0.1:8081",    # Expo DevTools
  "unspent://",                    # Deep link scheme
  "http://localhost:3000"         # Web app
]
```

**Source:** `supabase/config.toml:32-36`

### Email Auth Settings

| Setting | Value |
|---------|-------|
| **enable_signup** | `true` |
| **double_confirm_changes** | `true` |
| **enable_confirmations** | `false` |

### External OAuth Providers---

#### Apple

```toml
[auth.external.apple]
enabled = true
client_id = "env(SUPABASE_AUTH_APPLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_APPLE_SECRET)"
```

**Source:** `supabase/config.toml:46-49`

#### Google

```toml
[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_GOOGLE_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_GOOGLE_SECRET)"
```

**Source:** `supabase/config.toml:51-54`

### Storage Settings

| Setting | Value |
|---------|-------|
| **enabled** | `true` |
| **file_size_limit** | `50MiB` |

### Edge Runtime

| Setting | Value |
|---------|-------|
| **enabled** | `true` |
| **policy** | `per_worker` |
| **inspector_port** | `8083` |

### Edge Function Overrides

```toml
[functions.process-vested]
verify_jwt = false    # Cron job doesn't have JWT

[functions.stripe-webhook]
verify_jwt = false    # Webhook uses Stripe signature
```

**Source:** `supabase/config.toml:61-65`

---

## Environment Variables for Local Dev---

### From `supabase status` (after `supabase start`)

| Variable | Value | Purpose |
|-----------|-------|---------|
| `SUPABASE_URL` | `http://localhost:54321` | API URL |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | Anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Service role (secret!) |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:54322/postgres` | Direct DB |

### Set in `.env.local`

```bash
# Copy example
cp .env.example .env.local

# Update with local Supabase values:
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

---

## Migration Management---

### View Pending Migrations

```bash
supabase db diff
```

### Apply Migrations

```bash
# Push all migrations
pnpm supabase:db:push
# Equivalent to: supabase db push
```

### Create New Migration

```bash
supabase migration new <description>
# Creates: supabase/migrations/<timestamp>_<description>.sql
```

### Reset Database

```bash
supabase db reset
# Wipes local DB and re-applies all migrations
```

---

## Edge Functions (Local)---

### Start Functions Server

```bash
pnpm supabase:functions
# Equivalent to: supabase functions serve
```

### Test a Function

```bash
# Get JWT token first (sign in via app or Supabase Dashboard)

# Test preview-link function
curl -X POST http://localhost:54321/functions/v1/preview-link \
  -H "Authorization: Bearer <your_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Function Environment Variables

Edge Functions read env vars from:
1. `supabase/config.toml` (for non-secret values)
2. Supabase Dashboard → Edge Functions → Settings → Secrets (for secrets)
3. Local: `.env.local` (loaded by `supabase functions serve`)

---

## Database Studio (Local)---

### Access Studio

Open: http://localhost:54323

### What You Can Do:

- **Table Editor:** View/Edit rows in all tables
- **SQL Editor:** Run arbitrary SQL queries
- **Auth:** Manage users, view JWTs
- **Storage:** Manage files in buckets
- **Functions:** View Edge Function logs

---

## Scheduled Jobs (pg_cron)---

### Enable Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

**Source:** `supabase/migrations/005_schedule_process_vested.sql:2-3`

### View Scheduled Jobs

```sql
SELECT * FROM cron.job;
```

### Manual Trigger (for testing)

```bash
# Call process-vested manually
curl -X POST http://localhost:54321/functions/v1/process-vested \
  -H "x-cron-secret: <your_secret>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Troubleshooting---

### `supabase start` Fails: Port Already in Use

```bash
# Stop existing instances
supabase stop

# Or check what's using the port
lsof -i :54321
```

### Migrations Fail: Schema Mismatch

```bash
# Reset and re-apply
supabase db reset
```

### Edge Function Can't Read Env Vars

```bash
# Verify function has access
supabase secrets list

# Set secret
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

---

## Production Supabase Setup---

### Create Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. "New Project" → Name: "unspent-prod"
3. Note: URL, anon key, service role key

### Apply Migrations to Production

```bash
# Link local to production
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

### Set Production Secrets

In Supabase Dashboard → Project → Settings → Edge Functions → Secrets:

| Secret | Value |
|--------|-------|
| `STRIPE_SECRET_KEY` | Live mode key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `SERPER_API_KEY` | Serper API key |
| `PROCESS_VESTED_SECRET` | Random string (generate with `openssl rand -hex 32`) |
| `SKIMLINKS_ID` | Skimlinks publisher ID |

---

## Architecture Diagram (Local)---

```
┌─────────────┐
│                        Local Development                        │
├─────────────┤
│               │
│  ┌─────────────┐         ┌──────────────┐               │
│  │  Web App    │         │ Mobile App    │               │
│  │ (Next.js)   │         │ (Expo)       │               │
│  │ :3000       │         │ :8081        │               │
│  └──────┬──────┘         └──────┬───────┘               │
│         │                      │                              │
│         └──────────────┬──────┘                              │
│                        │                                     │
│         ┌──────────────▼───────────────┐               │
│         │    Supabase Local (:54321)    │               │
│         │  ┌────────────┐  ┌─────────┐  │               │
│         │  │ Postgres   │  │ Studio  │  │               │
│         │  │ :54322    │  │ :54323  │  │               │
│         │  └────────────┘  └─────────┘  │               │
│         │  ┌────────────┐  ┌─────────┐  │               │
│         │  │ Functions │  │ Auth    │  │               │
│         │  │ (Deno)   │  │ (OAuth) │  │               │
│         │  └────────────┘  └─────────┘  │               │
│         └────────────────────────────────┘               │
│               │
└─────────────┘
```

---

**Supabase with Postgres 17, pg_cron, and Deno Edge Functions**
