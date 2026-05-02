# Supabase Edge Functions Reference

> **Source:** `supabase/functions/` (6 functions)  
> **Last verified:** 2026-05-01  
> **Runtime:** Deno Deploy (Supabase Edge Runtime)  
> **CORS:** All functions allow `Access-Control-Allow-Origin: *`

## Function Overview---

| Function | Path | Auth Requred | Verify JWT | Description |
|-----------|------|------------------|-------------|-------------|
| `create-checkout` | `/functions/v1/create-checkout` | Yes (Bearer token) | Yes | Creates Stripe Checkout session for subscriptions |
| `stripe-webhook` | `/functions/v1/stripe-webhook` | No (Stripe signature) | No | Handles Stripe webhook events |
| `search-dupes` | `/functions/v1/search-dupes` | Yes (Bearer) OR Internal | No | Searches for cheaper alternatives via Serper/OpenAI |
| `process-vested` | `/functions/v1/process-vested` | No (x-cron-secret) | No | Cron job to process expired cooldown items |
| `generate-share-card` | `/functions/v1/generate-share-card` | Yes (Bearer) OR Internal | No | Generates SVG share cards |
| `preview-link` | `/functions/v1/preview-link` | Yes (Bearer) | Yes | Fetches Open Graph metadata from URLs |

---

## 1. `create-checkout`

**Purpose:** Creates a Stripe Checkout session for premium subscriptions.

### Endpoint

```
POST /functions/v1/create-checkout
```

### Authentication

- **Type:** Bearer token (Supabase JWT)
- **Header:** `Authorization: Bearer <supabase_jwt>`

### Request Body

```json
{
  "priceId": "price_xxx",      // Optional: Stripe price ID (overrides plan)
  "plan": "monthly",          // or "yearly" — determines price ID + period
  "successUrl": "https://...",   // Optional: override success redirect
  "cancelUrl": "https://..."     // Optional: override cancel redirect
}
```

### Response

```json
{
  "url": "https://checkout.stripe.com/..."  // Redirect user to this URL
}
```

### Environment Variables Used

| Variable | Purpose |
|-----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_PRICE_MONTHLY` | Default monthly price ID |
| `STRIPE_PRICE_YEARLY` | Default yearly price ID |
| `NEXT_PUBLIC_WEB_URL` | Fallback base URL for redirects |

### Stripe API Version

`2023-10-16`

### Source

`supabase/functions/create-checkout/index.ts` (118 lines)

---

## 2. `stripe-webhook`

**Purpose:** Handles asynchronous Stripe webhook events to sync subscription status.

### Endpoint

```
POST /functions/v1/stripe-webhook
```

### Authentication

- **Type:** Stripe signature verification
- **Header:** `stripe-signature`
- **Secret:** `STRIPE_WEBHOOK_SECRET`

### Handled Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Creates/updates `subscriptions` row, sets `premium_until` on profile |
| `customer.subscription.updated` | Updates subscription status + `current_period_end` |
| `customer.subscription.deleted` | Sets subscription status to `canceled` |

### Environment Variables Used

| Variable | Purpose |
|-----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` | Service role access |

### Source

`supabase/functions/stripe-webhook/index.ts` (154 lines)

---

## 3. `search-dupes`

**Purpose:** Searches for cheaper alternatives to a wishlist item using Serper API + OpenAI enhancement.

### Endpoint

```
POST /functions/v1/search-dupes
```

### Authentication

| Method | Condition |
|--------|-----------|
| Bearer token (Supabase JWT) | Normal user request |
| Service role key | Internal call (from `process-vested`) |

### Request Body

```json
{
  "itemId": "uuid-of-wishlist-item"
}
```

### Response

```json
{
  "success": true,
  "item": "Item Name",
  "dupes": [
    {
      "name": "Alternative Product",
      "price": 1999,          // in cents
      "link": "https://amazon.com/...",
      "confidence": 0.85
    }
  ],
  "saved": 3                // Number of dupes saved to database
}
```

### How It Works

1. Fetches wishlist item details (title, price)
2. Calls **Serper API** (`https://google.serper.ai/search`) to search Amazon
3. Optionally enhances results with **OpenAI GPT-4o-mini** for confidence scoring
4. Saves top 3 results to `dupes_log` table
5. Returns enhanced results

### Environment Variables Used

| Variable | Purpose | Fallback |
|-----------|---------|----------|
| `SERPER_API_KEY` | Serper API for Google Shopping search | Mock data |
| `OPENAI_API_KEY` | OpenAI API for confidence scoring | Basic scoring (0.7, 0.6, 0.5) |
| `SKIMLINKS_ID` | Skimlinks affiliate link generation | `null` (no affiliate link) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` | Service role access |

### Source

`supabase/functions/search-dupes/index.ts` (274 lines)

---

## 4. `process-vested`

**Purpose:** Cron job that processes wishlist items whose 72-hour cooldown has expired.

### Endpoint

```
POST /functions/v1/process-vested
GET  /functions/v1/process-vested   (same logic)
```

### Authentication

- **Type:** Custom header
- **Header:** `x-cron-secret`
- **Value:** Must match `PROCESS_VESTED_SECRET` env var

### Request Body

None (POST body ignored, GET has no body)

### Response

```json
{
  "processed": 2,
  "results": [
    {
      "itemId": "uuid-...",
      "buy": 5,
      "pass": 2,
      "dupe": 1,
      "winner": "pass",      // "buy" | "pass" | "dupe" | null
      "price": 5000           // in cents
    }
  ]
}
```

### What It Does

For each expired item (`status = 'cooling_off'` AND `cooldown_ends_at <= NOW()`):

1. Counts votes (buy/pass/dupe)
2. Determines winner (threshold: 3 votes)
3. Updates item `status`:
   - `buy` → `purchased`
   - `pass` → `expired`
   - `dupe` → `dupe_found`
4. If `pass` or `dupe`: records savings to `savings_tallies` + increments `profiles.total_saved_amount`
5. If `dupe`: triggers `search-dupes` function

### Scheduling

| Property | Value |
|-----------|-------|
| **Cron expression** | `*/5 * * * *` (every 5 minutes) |
| **Configured in** | `supabase/migrations/005_schedule_process_vested.sql` |
| **pg_cron extension** | Enabled in `extensions` schema |

### Environment Variables Used

| Variable | Purpose |
|-----------|---------|
| `PROCESS_VESTED_SECRET` | Authorization secret for cron calls |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` | Service role access |

### Source

`supabase/functions/process-vested/index.ts` (200 lines)

---

## 5. `generate-share-card`

**Purpose:** Generates SVG share cards for social media (TikTok, Instagram, etc.).

### Endpoint

```
POST /functions/v1/generate-share-card
```

### Authentication

| Method | Condition |
|--------|-----------|
| Bearer token (Supabase JWT) | Normal user request |
| Service role key | Internal call |

### Request Body

```json
{
  "itemId": "uuid-of-wishlist-item",
  "template": "default"    // Optional: "default" | "celebration" | "bold"
}
```

### Response

- **Content-Type:** `image/svg+xml`
- **Body:** SVG XML (would convert to PNG in production with Satori)

### Templates

| Template | Background | Accent |
|----------|-------------|--------|
| `default` | `#E8B4B8` (pink) → `#A8C5A8` (sage) gradient | `#E8B4B8` |
| `celebration` | `#A8C5A8` (sage) → `#A8C5A8` (sage) | `#A8C5A8` |
| `bold` | `#F5E6D3` (cream) → `#E8B4B8` (pink) | `#2D2D2D` (dark) |

### What It Displays

- "I didn't buy it!" headline
- Item name
- Amount saved (e.g., "$49.99 saved")
- Username (@username)
- "unspent.app/download" footer

### Environment Variables Used

| Variable | Purpose |
|-----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` | Service role access |

### Source

`supabase/functions/generate-share-card/index.ts` (162 lines)

---

## 6. `preview-link`

**Purpose:** Fetches Open Graph metadata from a URL for wishlist item autofill.

### Endpoint

```
POST /functions/v1/preview-link
```

### Authentication

- **Type:** Bearer token (Supabase JWT)
- **Header:** `Authorization: Bearer <supabase_jwt>`
- **Requirement:** Valid authenticated user

### Request Body

```json
{
  "url": "https://amazon.com/product/..."
}
```

### Response

```json
{
  "title": "Product Name",
  "description": "Product description...",
  "image": "https://.../image.jpg",
  "price": 4999              // in cents, if found in og:price:amount
}
```

### Security

| Check | Description |
|-------|-------------|
| **Protocol** | Only `http:` and `https:` allowed |
| **Private networks** | Blocked: localhost, 10.x.x.x, 172.16-31.x.x, 192.168.x.x |
| **Content type** | Must return `text/html` |
| **Content length** | Max 1MB |
| **Timeout** | 5 seconds |

### Metadata Extracted

| Property | Meta Tag |
|----------|-----------|
| `title` | `og:title` or `<title>` |
| `description` | `og:description` or `description` |
| `image` | `og:image` |
| `price` | `product:price:amount` |

### Environment Variables Used

| Variable | Purpose |
|-----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` | Service role access |

### Source

`supabase/functions/preview-link/index.ts` (159 lines)

---

## Shared Utilities

### CORS Headers (All Functions)

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Authentication Helper (`search-dupes`, `generate-share-card`, `preview-link`)

```typescript
async function getAuthContext(req, supabase, serviceKey) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { userId: null, isInternal: false };
  if (token === serviceKey) return { userId: null, isInternal: true };
  
  const { data: { user } } = await supabase.auth.getUser(token);
  return { userId: user?.id ?? null, isInternal: false };
}
```

### Error Response Pattern (All Functions)

```typescript
function jsonResponse(body, status = 200) {
  return new Response(
    JSON.stringify(body),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

---

## Deployment

### Local Development

```bash
# Start Supabase local
supabase start

# Serve functions locally
pnpm supabase:functions

# Test a function
curl -X POST http://localhost:54321/functions/v1/preview-link \
  -H "Authorization: Bearer <your_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Production Deployment

Functions deploy automatically with `supabase db push` or via Supabase Dashboard → Edge Functions.

---

## Rate Limiting (Planned)

| Endpoint | Planned Limit | Implementation |
|-----------|----------------|------------------|
| `search-dupes` | 5/hour per user | Upstash Redis (env vars exist, not implemented) |
| `preview-link` | 30/minute per user | Upstash Redis (env vars exist, not implemented) |

> **Note:** `process-vested` is protected by `x-cron-secret` header instead of rate limiting.
