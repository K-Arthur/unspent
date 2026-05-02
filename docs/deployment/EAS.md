# EAS Mobile Build & Deployment

> **Source:** `apps/mobile/package.json`, Expo config  
> **Last verified:** 2026-05-01  
> **Expo SDK:** 54.0.34  
> **React Native:** 0.81.5

## EAS Project Configuration---

| Setting | Value | Source |
|---------|-------|--------|
| **expoProjectId** | `00000000-0000-0000-0000-000000000000` | Replace in `apps/mobile/app.json` |
| **easProjectId** | `00000000-0000-0000-0000-000000000000` | Replace in `apps/mobile/app.json` |
| **iOS Bundle ID** | `app.unspent` | `.env.example:12` |
| **Android Package** | `app.unspent` | `.env.example:13` |

---

## Build Profiles (eas.json)---

### Preview (TestFlight / Internal)

```bash
cd apps/mobile
eas build --profile preview --platform ios
```

| Setting | Value |
|---------|-------|
| **Distribution** | internal (TestFlight) |
| **iOS** | Release scheme |
| **Android** | (configure when ready) |

### Production (App Store / Play Store)

```bash
cd apps/mobile
eas build --profile production --platform ios
eas submit --latest
```

| Setting | Value |
|---------|-------|
| **iOS** | App Store via `eas submit` |
| **Android** | Play Store (configure when ready) |

---

## Environment Variables in EAS---

### Configure via EAS Secrets

```bash
# Set secrets for builds
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xyz.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbG..."
eas secret:create --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value "appl_..."
eas secret:create --name SENTRY_AUTH_TOKEN --value "..."
```

### Public Variables (in app.config.ts or app.json)

| Variable | Scope |
|-----------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | Client-side |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Client-side |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | Client-side (iOS) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | Client-side (Android) |
| `EXPO_PUBLIC_POSTHOG_KEY` | Client-side (optional) |
| `EXPO_PUBLIC_POSTHOG_HOST` | Client-side (optional) |
| `EXPO_PUBLIC_WEB_URL` | Deep link target |

---

## Development Builds---

### Local Development

```bash
cd apps/mobile
pnpm dev              # Expo DevTools
pnpm dev:ios          # iOS simulator
pnpm dev:android      # Android emulator
```

### Custom Dev Client (Recommended for Native Modules)

```bash
# Build custom dev client
eas build --profile development --platform ios
eas build --profile development --platform android

# Run with custom client
npx expo start --dev-client
```

---

## iOS Deployment Flow---

### 1. Create Build

```bash
cd apps/mobile
eas build --platform ios --profile preview
```

### 2. Submit to TestFlight

```bash
eas submit --platform ios --latest
```

### 3. Release to App Store

```bash
# Via App Store Connect or:
eas submit --platform ios --latest
```

---

## Android Deployment (Planned)---

| Step | Status |
|------|--------|
| **EAS Build** | ⚠️ Configured but not tested |
| **Play Store** | ❌ Planned |
| **Internal Testing** | ❌ Planned |

```bash
# When ready:
eas build --platform android --profile preview
eas submit --platform android --latest
```

---

## App Store Metadata---

### Required Assets

| Asset | Specs |
|-------|-------|
| **App Icon** | 1024×1024 px PNG (no alpha) |
| **Screenshots** | 6.7" (iPhone 15 Pro Max) + 5.5" (SE) |
| **App Preview** | Optional: 15-30 second video |

### App Information

| Field | Value |
|-------|-------|
| **Name** | Unspent |
| **Subtitle** | Social Deinfluencing Wishlist |
| **Category** | Lifestyle / Shopping |
| **Bundle ID** | `app.unspent` |
| **Apple Sign-In** | Configured (Server Auth) |
| **RevenueCat** | Configured for IAP |

---

## Code Signing (iOS)---

### 1. Set Up in App Store Connect

1. Create App ID: `app.unspent`
2. Enable "Sign In with Apple"
3. Configure RevenueCat app

### 2. Configure EAS

```bash
eas credentials
# Follow prompts for iOS distribution certificate + provisioning profile
```

---

## Troubleshooting---

### Build Fails: "expo not found"

**Solution:** Ensure Expo CLI is available:
```bash
npm i -g expo-cli
# Or use npx:
npx expo start
```

### RevenueCat Not Working

Check:
1. API keys in EAS secrets
2. Bundle ID matches App Store Connect
3. Products created in RevenueCat dashboard

### Apple Sign-In Fails

Verify in Supabase Dashboard:
1. Authentication → Providers → Apple
2. Client ID: `app.unspent.signin`
3. Secret: JSON from Apple Developer Portal

---

## Environment Comparison---

| Variable | Development | Preview (TestFlight) | Production |
|-----------|--------------|---------------------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Local/Supabase | Supabase Staging | Supabase Prod |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | Test key | Test key | Live key |
| `EXPO_PUBLIC_POSTHOG_KEY` | Dev key | Staging key | Prod key |

---

## Monitoring---

### Sentry (Configured)

| Setting | Value |
|---------|-------|
| **DSN** | `SENTRY_DSN` (set in EAS secrets) |
| **Expo Integration** | `sentry-expo` package |

### PostHog (Optional)

```typescript
// apps/mobile/src/analytics/setup.ts (planned)
import { PostHog } from 'posthog-react-native'
```

---

## Rollback---

### Via App Store Connect

1. Go to App Store Connect → My Apps → Unspent
2. TestFlight → Select build → Delete (for beta)
3. App Store → New Version → Select previous build

### Via EAS

```bash
# List builds
eas build:list

# Download previous build
eas build:download --build-id <id>
```

---

**Expo SDK 54 + EAS Build for iOS/Android**
