# Environment Variables Reference

> **Source:** `.env.example` (122 lines)  
> **Last verified:** 2026-05-01

## Public App URLs & Identifiers

| Variable | Required | Default | Description | Used By |
|-----------|----------|---------|-------------|----------|
| `APP_SCHEME` | Yes | `unspent` | Deep link scheme for mobile | Mobile app |
| `NEXT_PUBLIC_WEB_URL` | Yes | `http://localhost:3000` | Web app public URL | Web app, Edge Functions |
| `EXPO_PUBLIC_WEB_URL` | Yes | `http://localhost:3000` | Web URL for mobile (deep links) | Mobile app |
| `APPLE_STORE_URL` | No | `https://apps.apple.com/app/unspent` | iOS App Store URL | Share cards, constants |
| `GOOGLE_PLAY_URL` | No | `https://play.google.com/store/apps/details?id=app.unspent` | Google Play URL | Share cards, constants |
| `IOS_BUNDLE_IDENTIFIER` | Yes | `app.unspent` | iOS bundle ID for Supabase OAuth | Supabase Auth |
| `ANDROID_PACKAGE` | Yes | `app.unspent` | Android package name for Supabase OAuth | Supabase Auth |

## Expo / EAS

| Variable | Required | Default | Description | Used By |
|-----------|----------|---------|-------------|----------|
| `EXPO_PROJECT_ID` | Yes | `00000000-0000-0000-0000-000000000000` | Expo project ID | EAS Build |
| `EAS_PROJECT_ID` | Yes | `00000000-0000-0000-0000-000000000000` | EAS project ID | EAS Build |

## Supabase Client (Safe to expose)

| Variable | Required | Default | Description | Used By |
|-----------|----------|---------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://your-project.supabase.co` | Supabase project URL (web) | Web app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `your-supabase-anon-key` | Supabase anon key (web) | Web app |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | `https://your-project.supabase.co` | Supabase project URL (mobile) | Mobile app |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | `your-supabase-anon-key` | Supabase anon key (mobile) | Mobile app |

## Supabase Server (NEVER expose in client bundles)

| Variable | Required | Default | Description | Used By |
|-----------|----------|---------|-------------|----------|
| `SUPABASE_URL` | Yes | `https://your-project.supabase.co` | Supabase URL (server-side) | Edge Functions |
| `SUPABASE_ANON_KEY` | Yes | `your-supabase-anon-key` | Supabase anon key (server) | Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `your-supabase-service-role-key` | Service role key (full access) | Edge Functions |
| `SUPABASE_SERVICE_KEY` | Yes (fallback) | `your-supabase-service-role-key` | Duplicate of above (fallback) | Edge Functions (`process-vested`) |

## Supabase Auth Providers

| Variable | Required | Description | Used By |
|-----------|----------|-------------|----------|
| `SUPABASE_AUTH_APPLE_CLIENT_ID` | Yes (for Apple Sign-In) | Apple client ID (`app.unspent.signin`) | Supabase Auth |
| `SUPABASE_AUTH_APPLE_SECRET` | Yes (for Apple Sign-In) | Apple client secret (JSON) | Supabase Auth |
| `SUPABASE_AUTH_GOOGLE_CLIENT_ID` | Yes (for Google Sign-In) | Google client ID | Supabase Auth |
| `SUPABASE_AUTH_GOOGLE_SECRET` | Yes (for Google Sign-In) | Google client secret | Supabase Auth |
| `APPLE_CLIENT_ID` | Yes (for mobile) | Apple client ID | Mobile OAuth |
| `APPLE_TEAM_ID` | Yes (for mobile) | Apple Developer Team ID | Mobile OAuth |
| `APPLE_KEY_ID` | Yes (for mobile) | Apple Key ID for JWT | Mobile OAuth |
| `GOOGLE_CLIENT_ID` | Yes (for mobile) | Google client ID | Mobile OAuth |
| `GOOGLE_CLIENT_SECRET` | Yes (for mobile) | Google client secret | Mobile OAuth |

## Stripe (Web Subscriptions)

| Variable | Required | Default | Description | Used By |
|-----------|----------|---------|-------------|----------|
| `STRIPE_SECRET_KEY` | Yes | `sk_test_your-stripe-secret-key` | Stripe secret key | Edge Functions (`stripe-webhook`, `create-checkout`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | `pk_test_your-stripe-publishable-key` | Stripe publishable key | Web app |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_your-webhook-secret` | Webhook signature secret | Edge Function (`stripe-webhook`) |
| `STRIPE_PRICE_MONTHLY` | Yes | `price_your-monthly-price-id` | Stripe price ID for monthly plan | Edge Function (`create-checkout`), constants |
| `STRIPE_PRICE_YEARLY` | Yes | `price_your-yearly-price-id` | Stripe price ID for yearly plan | Edge Function (`create-checkout`), constants |
| `PROCESS_VESTED_SECRET` | Yes | `generate-a-long-random-secret` | Secret for `process-vested` cron job | Edge Function (`process-vested`) |

## RevenueCat (Mobile IAP)

| Variable | Required | Default | Description | Used By |
|-----------|----------|---------|-------------|----------|
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | Yes (iOS) | `appl_your-revenuecat-ios-key` | RevenueCat iOS API key | Mobile app |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Yes (Android) | `goog_your-revenuecat-android-key` | RevenueCat Android API key | Mobile app |
| `REVENUECAT_REST_API_KEY` | Yes | `your-revenuecat-rest-api-key` | RevenueCat REST API key | Edge Functions (future) |
| `REVENUECAT_WEBHOOK_SECRET` | Yes | `your-revenuecat-webhook-secret` | Webhook secret | Edge Functions (future) |

## AI, Search & Moderation

| Variable | Required | Description | Used By | Cost |
|-----------|----------|-------------|----------|------|
| `OPENAI_API_KEY` | Yes (for AI enhancement) | OpenAI API key (GPT-4o-mini) | Edge Function (`search-dupes`) | ~$0.01/call |
| `SERPAPI_API_KEY` | Yes (fallback) | SerpAPI key (Google Shopping) | Not currently used | Varies |
| `SERPER_API_KEY` | Yes (primary) | Serper API key (Google Shopping) | Edge Function (`search-dupes`) | Varies |
| `RAINFOREST_API_KEY` | No | Rainforest API key | Not implemented | - |
| `SIGHTENGINE_USER` | No | Sightengine user ID | Not implemented | - |
| `SIGHTENGINE_SECRET` | No | Sightengine secret | Not implemented | - |

## Storage (R2 / S3 Compatible)

| Variable | Required | Description | Used By |
|-----------|----------|-------------|----------|
| `R2_ACCESS_KEY_ID` | Yes | Cloudflare R2 access key ID | Edge Functions (future) |
| `R2_SECRET_ACCESS_KEY` | Yes | Cloudflare R2 secret key | Edge Functions (future) |
| `R2_ACCOUNT_ID` | Yes | Cloudflare R2 account ID | Edge Functions (future) |
| `R2_BUCKET_NAME` | Yes | Bucket name (`unspent-screenshots`) | Edge Functions (future) |
| `R2_PUBLIC_BASE_URL` | Yes | Public base URL (`https://images.unspent.app`) | Share cards |

## Email & Notifications

| Variable | Required | Description | Used By |
|-----------|----------|-------------|----------|
| `RESEND_API_KEY` | Yes (for email) | Resend API key | Edge Functions (future) |
| `RESEND_FROM` | Yes (for email) | From address (`Unspent <hello@unspent.app>`) | Edge Functions (future) |
| `EXPO_ACCESS_TOKEN` | Yes (for push) | Expo access token | Mobile app (push notifications) |

## Error Tracking & Analytics

| Variable | Required | Default | Description | Used By |
|-----------|----------|---------|-------------|----------|
| `SENTRY_DSN` | No | `https://public@sentry.example/1` | Sentry DSN | Web, Mobile |
| `SENTRY_AUTH_TOKEN` | No | `your-sentry-auth-token` | Sentry auth token (upload source maps) | CI/CD |
| `SENTRY_ORG` | No | `your-sentry-org` | Sentry organization | CI/CD |
| `SENTRY_PROJECT` | No | `unspent` | Sentry project name | CI/CD |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | `phc_your-posthog-key` | PostHog key (web) | Web app |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `https://app.posthog.com` | PostHog host (web) | Web app |
| `EXPO_PUBLIC_POSTHOG_KEY` | No | `phc_your-posthog-key` | PostHog key (mobile) | Mobile app |
| `EXPO_PUBLIC_POSTHOG_HOST` | No | `https://app.posthog.com` | PostHog host (mobile) | Mobile app |
| `POSTHOG_PERSONAL_API_KEY` | No | `your-posthog-personal-api-key` | PostHog personal API key | Edge Functions (future) |

## Affiliate Tracking

| Variable | Required | Description | Used By |
|-----------|----------|-------------|----------|
| `SKIMLINKS_ID` | No | Skimlinks publisher ID | Edge Function (`search-dupes`) |
| `AMAZON_ASSOCIATES_TAG` | No | Amazon Associates tag | Affiliate links |
| `AFFILIATE_REDIRECT_BASE_URL` | No | `https://unspent.app/r` | Base URL for redirects | Edge Functions (future) |

## Rate Limiting (Planned - Not Implemented)

| Variable | Required | Description | Used By |
|-----------|----------|-------------|----------|
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL | Planned for vote/dupe rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token | Planned for vote/dupe rate limiting |

## Setup Instructions

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required variables (marked "Yes" in tables above).

3. For local Supabase development:
   ```bash
   supabase start
   # Get values from: supabase status
   ```

4. For Stripe testing:
   - Get keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Use price IDs from your Stripe products

5. For Apple/Google OAuth:
   - Configure in Supabase Dashboard → Authentication → Providers
   - Add redirect URLs in `supabase/config.toml`

## Environment-Specific Notes

| Environment | Special Notes |
|-------------|----------------|
| **Local (web)** | Use `http://localhost:3000` for `NEXT_PUBLIC_WEB_URL` |
| **Local (mobile)** | Use `exp://127.0.0.1:8081` in Supabase additional redirect URLs |
| **Staging** | Use separate Supabase project recommended |
| **Production** | Never commit `.env.local` — use Vercel/Expo environment variables |
