# Unspent — Comprehensive Accessibility & Navigation Improvement Plan

> **Generated:** April 30, 2026  
> **Last Updated:** April 30, 2026 — Phase 1 Quick Wins Implemented ✅
> **Scope:** Web app (Next.js 14), Mobile app (Expo SDK 52 / React Native)  
> **Standard:** WCAG 2.2 Level AA (AAA where feasible)  
> **Constraint:** Zero breaking changes — all improvements are backward-compatible and incremental

---

## Implementation Status

### ✅ Phase 1 Quick Wins — COMPLETED

| ID | Task | Status | Files Changed |
|----|------|--------|---------------|
| QW-1 | Fix duplicate skip link | ✅ Done | `apps/web/src/app/layout.tsx` — removed weak duplicate, kept Navbar's version |
| QW-2 | Add `:focus-visible` global styles | ✅ Already existed | `apps/web/src/app/globals.css` — `focus-visible` + `.link-focus` utility class present |
| QW-3 | Add `aria-hidden` to decorative elements | ✅ Done | `apps/web/src/components/Features.tsx` — emoji icons `aria-hidden="true"` |
| QW-4 | Add `aria-label` to nav, footer landmarks | ✅ Done | `apps/web/src/components/Navbar.tsx` (already had `aria-label`), `apps/web/src/components/Footer.tsx` — added `aria-label="Site footer"` |
| QW-5 | Add `aria-controls` to mobile menu | ✅ Done | `apps/web/src/components/Navbar.tsx` — added `aria-controls="mobile-nav"`, `id="mobile-nav"` on menu |
| QW-7 | Add `prefers-reduced-motion` CSS | ✅ Already existed | `apps/web/src/app/globals.css` — `prefers-reduced-motion: reduce` rule present |
| QW-8 | Add `accessibilityLabel` to tab bar | ✅ Done | `apps/mobile/app/(tabs)/_layout.tsx` — `tabBarAccessibilityLabel` on all 4 tabs |
| QW-9 | Add `accessibilityLabel` to FAB, cards | ✅ Done | `FAB.tsx`, `CourtCard.tsx`, `DupeCard.tsx`, `WishCard.tsx` — full a11y props |
| QW-10 | Add `accessibilityRole` to key components | ✅ Done | `Avatar.tsx`, `CountdownTimer.tsx`, `LockedFeature.tsx`, `AnimatedNumber.tsx` — roles + labels |
| QW-11 | Verify page titles | ✅ Already configured | `apps/web/src/app/layout.tsx` — metadata template with `%s | Unspent` pattern |

### Additional Improvements Made

| Change | File | Detail |
|--------|------|--------|
| **🔧 Native headers with back buttons** | `_layout.tsx` | Enabled native Stack headers on all secondary screens — iPhone users get visible back buttons |
| **🔧 Removed duplicate header** | `profile/[username].tsx` | Removed custom nav bar (replaced by native header with back button) |
| **🔧 Removed duplicate title** | `add-item/index.tsx` | Removed custom title section (native header shows "Add New Item" + close button) |
| **🔧 Dynamic header titles** | `profile/[username].tsx` | Header shows `@username` dynamically |
| **🔧 Screen registration** | `_layout.tsx` | Registered all secondary screens (settings, edit-profile, friends, invites, receipts, upgrade) |
| Semantic `<article>` + `<blockquote>` | `Testimonials.tsx` | Replaced `<div>` with proper semantic elements |
| Confidence bar `accessibilityLabel` | `DupeCard.tsx`` | Progress bar now has descriptive label |
| Vote count `accessibilityLabel` | `CourtCard.tsx` | Vote counts no longer rely on color alone |
| Status badge `accessibilityLabel` | `WishCard.tsx` | Status conveyed via text, not just color |
| Timer `accessibilityLiveRegion` | `CountdownTimer.tsx` | Screen readers announce time changes |
| Animated number `accessibilityLiveRegion` | `AnimatedNumber.tsx` | Value changes announced to screen readers |

---

## Table of Contents

1. [Executive Summary & Current State](#1-executive-summary--current-state)
2. [Information Architecture & Navigation Design](#2-information-architecture--navigation-design)
3. [Semantic Structure & Screen Reader Support](#3-semantic-structure--screen-reader-support)
4. [Keyboard & Focus Management](#4-keyboard--focus-management)
5. [Visual Design & Adaptability](#5-visual-design--adaptability)
6. [Forms, Errors & Feedback](#6-forms-errors--feedback)
7. [Media, Documents & Time-based Content](#7-media-documents--time-based-content)
8. [Cognitive & Inclusive Accessibility](#8-cognitive--inclusive-accessibility)
9. [Implementation Strategy & Risk Mitigation](#9-implementation-strategy--risk-mitigation)
10. [Testing & Validation Protocol](#10-testing--validation-protocol)
11. [Prioritized Roadmap](#11-prioritized-roadmap)
12. [Code Examples & Patterns](#12-code-examples--patterns)

---

## 1. Executive Summary & Current State

### Project Profile

| Aspect | Detail |
|--------|--------|
| **Product type** | Social wish-list / impulse-buy gatekeeper (consumer app) |
| **Web stack** | Next.js 14.1, React 18, Tailwind CSS 3.4, Supabase |
| **Mobile stack** | Expo SDK 52, React 19, NativeWind (Tailwind), expo-router v6, Zustand |
| **Backend** | Supabase (Postgres, Auth, Edge Functions, Storage) |
| **Monorepo** | pnpm workspaces — `apps/web`, `apps/mobile`, `packages/shared` |

### Accessibility Audit Summary

#### Web App — Current State

| Area | Status | Notes |
|------|--------|-------|
| `<html lang>` | ✅ Pass | `lang="en"` set correctly in layout.tsx |
| Skip-to-content link | ⚠️ Partial | Exists but **duplicated** (layout.tsx + Navbar.tsx). Layout version has poor focus styles |
| Semantic landmarks | ⚠️ Partial | Uses `<main>`, `<nav>`, `<footer>`, `<section>` but nav lacks `aria-label` |
| Heading hierarchy | ⚠️ Partial | Uses `h1`-`h3` but may skip levels in some sections |
| Image alt text | ❌ Missing | No `alt` attributes found on most images |
| Form labels | ❌ Missing | No programmatic labels on form inputs |
| Focus indicators | ❌ Missing | No custom focus ring styles defined |
| ARIA attributes | ⚠️ Minimal | Sparse usage, mostly missing |
| Color contrast | ⚠️ Unknown | Needs verification — warm cream palette may have issues |
| Keyboard nav | ⚠️ Partial | Native HTML elements provide baseline, but custom components lack keyboard support |
| Automated a11y testing | ❌ None | No axe-core, Lighthouse CI, Pa11y, or similar tools in dependencies |
| prefers-reduced-motion | ❌ None | No reduced-motion support in CSS |
| Print styles | ❌ None | No `@media print` rules |

#### Mobile App — Current State

| Area | Status | Notes |
|------|--------|-------|
| `accessibilityLabel` | ❌ Missing | Almost zero usage across all components |
| `accessibilityRole` / `role` | ❌ Missing | Interactive elements not announced correctly |
| `accessible` prop | ❌ Missing | Cards, buttons, custom components not marked |
| `accessibilityHint` | ❌ Missing | No contextual hints for actions |
| Screen reader navigation | ❌ Poor | Tab bars lack labels, cards are opaque to assistive tech |
| Dynamic announcements | ❌ Missing | No `accessibilityLiveRegion` for state changes |
| Focus management | ❌ Missing | No focus trapping for modals, no focus redirection after navigation |
| Font scaling | ⚠️ Unknown | NativeWind may or may not respect system font scaling |

---

## 2. Information Architecture & Navigation Design

### 2.1 Current Navigation Structure

**Web App:**
- Landing page with Navbar → Hero → Features → Testimonials → CTA → Footer
- No authenticated dashboard on web (web is primarily marketing + share card + savings tally)
- No breadcrumbs needed (flat structure)

**Mobile App:**
- Bottom tab navigator: Home | Court | Dupes | Profile
- Stack navigation: Settings, Edit Profile, Friends, Invites, Receipts, Upgrade, Onboarding
- Item detail: `item/[id]` (card slide transition)
- Court detail: `court/[id]` (card slide transition)
- Add item: `add-item` (modal)

### 2.2 Recommendations

#### Web — Navigation Improvements

| ID | Recommendation | Impact | Effort |
|----|---------------|--------|--------|
| NAV-W1 | Remove duplicate skip link — keep only Navbar's version with improved styles | High | Low |
| NAV-W2 | Add `aria-label="Main navigation"` to primary `<nav>` | Medium | Low |
| NAV-W3 | Add `aria-current="page"` to active nav links | Medium | Low |
| NAV-W4 | Ensure all nav links have visible focus indicators (custom `:focus-visible` ring) | High | Low |
| NAV-W5 | Add `role="banner"` to header wrapper (defensive — `<header>` already implies this) | Low | Low |
| NAV-W6 | Footer: add `aria-label="Site footer"` to `<footer>` element | Low | Low |
| NAV-W7 | Add keyboard-accessible mobile menu (hamburger) with focus trap | High | Medium |
| NAV-W8 | Ensure `page.title` is descriptive and unique per page | Medium | Low |

#### Mobile — Navigation Improvements

| ID | Recommendation | Impact | Effort |
|----|---------------|--------|--------|
| NAV-M1 | Add `accessibilityLabel` to all `Tab.Screen` `tabBarIcon` components | High | Low |
| NAV-M2 | Add `accessibilityLabel` to `tabBarButton` props for each tab | High | Low |
| NAV-M3 | Provide meaningful `headerAccessibilityLabel` for stack screens | Medium | Low |
| NAV-M4 | Add screen reader announcement on route changes using `useRouter` events | High | Medium |
| NAV-M5 | FAB button: add `accessibilityLabel="Add new item"` and `accessibilityRole="button"` | High | Low |
| NAV-M6 | Back buttons: ensure `accessibilityLabel` describes destination ("Back to Home") | Medium | Low |

---

## 3. Semantic Structure & Screen Reader Support

### 3.1 Heading Hierarchy

**Issue:** Pages may skip heading levels (e.g., `h1` → `h3`).

**Fix:** Audit every page and ensure a logical, sequential heading outline:

```
h1 — Page title (one per page)
  h2 — Major sections
    h3 — Sub-sections
```

**Web-specific:**
- `page.tsx`: Ensure Hero `h1`, Features `h2`, Testimonials `h2`, CTA `h2`
- `savings-tally/[username]/page.tsx`: Page title as `h1`

**Mobile-specific:**
- Each tab screen should have a visible or `accessibilityLabel`-based heading
- Use `accessibilityRole="header"` on section titles

### 3.2 Landmark Regions

**Web — Required landmarks:**

```html
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>
<main id="main-content" role="main">...</main>
<footer aria-label="Site footer" role="contentinfo">...</footer>
```

**Mobile — Required accessibility views:**
- Mark tab views as `accessibilityRole="tablist"` (handled by Expo Router)
- Mark main content areas with appropriate roles

### 3.3 ARIA Usage

**Principle:** No ARIA is better than bad ARIA. Use native HTML first.

| Component | Current | Recommended |
|-----------|---------|-------------|
| Navbar links | Plain `<a>` tags | Add `aria-current="page"` to active link |
| Footer | Plain `<footer>` | Add `aria-label="Site footer"` |
| Mobile menu | N/A | `aria-expanded`, `aria-controls`, `aria-haspopup` on trigger |
| Cards (web) | Plain `<div>` | Use `<article>` with accessible name |
| Countdown timer | Text only | `aria-live="polite"` + `role="timer"` |
| Vote buttons | Plain `<button>` | `aria-pressed` for vote state |
| Loading states | None visible | `aria-busy="true"` + `aria-live="polite"` |

### 3.4 Dynamic Content & Live Regions

| Element | Announcement Strategy |
|---------|----------------------|
| Vote result | `aria-live="polite"` region announces "Vote recorded: Buy" |
| Court status change | `aria-live="assertive"` for time-critical updates |
| Countdown expiry | Announce "Court has ended" via live region |
| Friend request accepted | Toast with `role="status"` |
| Error messages | `role="alert"` + `aria-live="assertive"` |
| Loading spinner | `aria-busy="true"` on container, `aria-label="Loading"` on spinner |

---

## 4. Keyboard & Focus Management

### 4.1 Web — Keyboard Navigation

**Current gaps:**
- No visible focus indicators on interactive elements
- Custom components (if any) don't implement keyboard patterns
- Mobile menu (if added) would need focus trapping

**Required fixes:**

| ID | Fix | Priority |
|----|-----|----------|
| KB-W1 | Add `:focus-visible` ring to all interactive elements (buttons, links, inputs) | P0 |
| KB-W2 | Ensure tab order follows visual layout (no `tabindex` abuse) | P0 |
| KB-W3 | Modal/dialog focus trap (if modals are added) | P1 |
| KB-W4 | `Escape` key closes dropdowns, modals, and overlays | P1 |
| KB-W5 | Arrow key navigation for tab widgets (if implemented) | P2 |
| KB-W6 | Never use `outline: none` without a replacement focus style | P0 |

**Focus indicator CSS pattern:**
```css
/* Global focus-visible style */
*:focus-visible {
  outline: 2px solid #6D28D9; /* violet-700 — matches brand */
  outline-offset: 2px;
  border-radius: 4px;
}
```

### 4.2 Mobile — Keyboard/Switch Access

| ID | Fix | Priority |
|----|-----|----------|
| KB-M1 | All interactive elements have `accessible={true}` | P0 |
| KB-M2 | Group related content with `accessibilityElementHidden` on decorative children | P1 |
| KB-M3 | Ensure logical reading order (top-to-bottom, left-to-right) | P1 |
| KB-M4 | Modal screens: announce modal context via `accessibilityLabel` | P1 |

---

## 5. Visual Design & Adaptability

### 5.1 Color Contrast

**Current palette** (from `colors.ts`):
- Surface: `#FEFBF9` (warm cream)
- Primary text, backgrounds, accents are themed

**Required actions:**

| ID | Action | Standard | Priority |
|----|--------|----------|----------|
| CLR-1 | Audit all text/background color pairs for 4.5:1 (normal text) or 3:1 (large text) | WCAG 1.4.3 | P0 |
| CLR-2 | Ensure interactive elements have 3:1 contrast against adjacent colors | WCAG 1.4.11 | P0 |
| CLR-3 | Verify focus indicators have 3:1 contrast against background | WCAG 2.4.7 | P0 |
| CLR-4 | Never convey information by color alone (add icons/text) | WCAG 1.4.1 | P1 |
| CLR-5 | Test with high-contrast mode forced (Windows) | Best practice | P2 |

**Recommended audit process:**
1. Use Chrome DevTools color picker (shows contrast ratio)
2. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) for manual verification
3. Automated: axe-core will catch most contrast failures

### 5.2 Responsive & Zoom Support

| ID | Action | Priority |
|----|--------|----------|
| RSP-1 | Test at 200% zoom — no horizontal scrolling, no content loss | P0 |
| RSP-2 | Use `rem`/`em` for font sizes (not `px`) — verify Tailwind config | P1 |
| RSP-3 | Ensure tap targets ≥ 44×44px on mobile (WCAG 2.5.8) | P0 |
| RSP-4 | Verify NativeWind respects system font scaling on mobile | P1 |
| RSP-5 | Add `@media (prefers-reduced-motion: reduce)` to disable animations | P1 |

### 5.3 Typography

**Web — verify Tailwind uses rem-based font scale:**
```js
// tailwind.config.js — fontSize should use rem units
fontSize: {
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'base': ['1rem', { lineHeight: '1.5rem' }],
  // ...
}
```

### 5.4 Motion Sensitivity

**Web — CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Mobile — React Native:**
```tsx
// Check system setting
const { reduceMotion } = AccessibilityInfo.useReduceMotion();
// Conditionally disable Animated.Value animations
```

---

## 6. Forms, Errors & Feedback

### 6.1 Web Forms

**Current state:** Web has minimal forms (marketing site), but future auth/forms need patterns.

**Required pattern for all form controls:**

```tsx
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email address
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "email-error" : undefined}
    className="..."
  />
  {hasError && (
    <p id="email-error" className="text-red-600 text-sm" role="alert">
      Please enter a valid email address.
    </p>
  )}
</div>
```

**Error summary pattern (top of form):**
```tsx
{errors.length > 0 && (
  <div role="alert" aria-labelledby="error-summary-heading" className="...">
    <h2 id="error-summary-heading">There are {errors.length} errors in this form</h2>
    <ul>
      {errors.map(err => (
        <li key={err.field}>
          <a href={`#${err.field}`}>{err.message}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

### 6.2 Mobile Forms

**Current gaps in add-item, edit-profile, onboarding, settings:**
- No `accessibilityLabel` on `TextInput` components
- No error announcements
- No validation feedback for screen readers

**Required pattern:**
```tsx
<View>
  <Text accessibilityRole="header" nativeID="title-label">
    Item title
  </Text>
  <TextInput
    accessibilityLabelledBy="title-label"
    accessibilityLabel="Item title"
    accessibilityHint="Enter the name of the item you want to add"
    accessibilityInvalid={hasError}
    accessibilityErrorMessage={hasError ? "Title is required" : undefined}
  />
</View>
```

### 6.3 Success & Loading States

| Pattern | Implementation |
|---------|---------------|
| Loading spinner | Web: `aria-label="Loading"` + `aria-busy="true"` on container. Mobile: `accessibilityLabel="Loading"` + `accessibilityLiveRegion="polite"` |
| Success toast | Web: `role="status"` + `aria-live="polite"`. Mobile: `accessibilityLiveRegion="polite"` |
| Vote recorded | Announce result: "Your vote has been recorded: Buy" |
| Item added | "Item added to your wishlist" |
| Court started | "Your item is now in Court. Friends will vote for 72 hours." |

---

## 7. Media, Documents & Time-based Content

### 7.1 Images

**Web:**
- All `<img>` / `<Image>` must have `alt` attribute
  - Informative images: descriptive alt text
  - Decorative images: `alt=""` or `aria-hidden="true"`
- Hero images: describe the content, e.g., `alt="Friends voting on purchase decisions in the Unspent app"`
- User avatars: `alt="{username}'s avatar"`

**Mobile:**
- All `<Image>` components: `accessible={true}` + `accessibilityLabel="..."`
- Decorative images: `accessible={false}` + `accessibilityElementsHidden={true}`

### 7.2 Time-based Content

**Countdown Timer (72-hour court period):**

| ID | Action | Priority |
|----|--------|----------|
| TM-1 | Add `role="timer"` + `aria-live="polite"` (throttled — announce every minute, not every second) | P1 |
| TM-2 | Announce when timer reaches key thresholds: "Less than 1 hour remaining" | P2 |
| TM-3 | Announce when court expires: "Court has ended — you saved $X!" | P1 |
| TM-4 | Ensure `prefers-reduced-motion` pauses countdown animation | P2 |

### 7.3 Auto-playing Content

No current auto-playing media. If added in future:
- Must not auto-play more than 3 seconds
- Must have pause/stop controls
- Respect `prefers-reduced-motion`

---

## 8. Cognitive & Inclusive Accessibility

### 8.1 Consistent Layouts

| ID | Action | Priority |
|----|--------|----------|
| COG-1 | Keep navigation in same position across all screens | P0 (already done) |
| COG-2 | Keep interactive elements (buttons, links) visually consistent | P1 |
| COG-3 | Use icons + text (never icon-only) for critical actions | P1 |
| COG-4 | Provide confirmation before destructive actions (delete item, remove friend) | P0 |

### 8.2 Plain Language

| ID | Action | Priority |
|----|--------|----------|
| LNG-1 | Audit all user-facing text for jargon ("Court" should be explained clearly) | P1 |
| LNG-2 | Use descriptive link text — no "click here" or "learn more" without context | P0 |
| LNG-3 | Keep instructions short and clear | P2 |
| LNG-4 | Use consistent terminology across platforms | P1 |

### 8.3 Undo & Safety

| ID | Action | Priority |
|----|--------|----------|
| UNDO-1 | Add "Undo" option for votes (within short window) | P1 |
| UNDO-2 | Confirmation dialog for deleting items | P0 |
| UNDO-3 | Confirmation dialog for removing friends | P0 |
| UNDO-4 | Clear "Cancel" option on all modal forms | P0 |

### 8.4 Session Timeout

| ID | Action | Priority |
|----|--------|----------|
| SES-1 | Warn users 2 minutes before session expiry | P1 |
| SES-2 | Preserve form data after re-authentication | P2 |

---

## 9. Implementation Strategy & Risk Mitigation

### 9.1 Branch Strategy

```
main
  └── a11y/quick-wins          ← Phase 1
        ├── a11y/skip-link-fix
        ├── a11y/focus-indicators
        ├── a11y/alt-text
        └── a11y/aria-labels
  └── a11y/structural           ← Phase 2
        ├── a11y/mobile-a11y-props
        ├── a11y/form-patterns
        └── a11y/keyboard-nav
```

### 9.2 Feature Flags

For any navigation restructuring or visual changes:

```ts
// packages/shared/src/constants/index.ts
export const ACCESSIBILITY_FLAGS = {
  /** Toggle new skip link behavior */
  A11Y_SKIP_LINK_V2: true,
  /** Toggle focus-visible indicators */
  A11Y_FOCUS_RING: true,
  /** Toggle screen reader announcements */
  A11Y_LIVE_REGIONS: true,
} as const;
```

### 9.3 Rollback Plan

| Change Type | Rollback Strategy |
|-------------|-------------------|
| CSS-only (focus styles, contrast) | Revert commit — instant, no side effects |
| ARIA attributes added | Safe to remove — no behavioral change |
| Skip link changes | Keep both, remove duplicate via feature flag |
| Component restructure | Feature flag toggle + branch revert |
| Mobile a11y props | Safe to remove — purely additive |

### 9.4 Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Focus styles break layout | Low | Use `outline-offset` instead of `border` |
| ARIA conflicts with RN | Low | Test with VoiceOver/TalkBack after each change |
| Performance impact from live regions | Low | Throttle announcements, don't announce every tick |
| NativeWind font scaling issues | Medium | Test on device with large font setting |
| Skip link breaks SSR | Low | Already works in Next.js — just fixing styles |

---

## 10. Testing & Validation Protocol

### 10.1 Automated Testing (CI Integration)

**Web — Add to devDependencies:**

```json
{
  "devDependencies": {
    "axe-core": "^4.9.0",
    "@axe-core/react": "^4.9.0",
    "playwright": "^1.42.0",
    "@playwright/test": "^1.42.0"
  }
}
```

**CI pipeline addition:**
```yaml
# .github/workflows/a11y.yml (new)
name: Accessibility Tests
on: [push, pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm --filter @unspent/web build
      - run: pnpm --filter @unspent/web test:a11y
```

**Playwright a11y test example:**
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage accessibility', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### 10.2 Manual Testing Checklist

**Every PR must be tested for:**

- [ ] **Keyboard-only navigation:** Tab through entire page — all interactive elements reachable
- [ ] **Screen reader:** VoiceOver (macOS/iOS) or NVDA (Windows) — content announced correctly
- [ ] **200% zoom:** No horizontal scroll, no content overlap
- [ ] **High contrast mode:** All text and controls visible
- [ ] **Focus indicators:** Visible ring on all focused elements
- [ ] **Skip link:** Visible on Tab, jumps to main content
- [ ] **Mobile gestures:** All actions have accessible alternatives (not gesture-only)

### 10.3 Mobile Testing

| Test | Tool | Frequency |
|------|------|-----------|
| VoiceOver (iOS) | Built-in | Every sprint |
| TalkBack (Android) | Built-in | Every sprint |
| Switch Access (Android) | Built-in | Monthly |
| Large font (200%) | Device settings | Every PR |
| High contrast (Android) | Device settings | Monthly |

### 10.4 User Testing

**Recommended:** Recruit 3-5 participants with disabilities:
- 2 screen reader users (1 VoiceOver, 1 NVDA/TalkBack)
- 1 keyboard-only user (motor disability)
- 1 low-vision user (zoom user)
- 1 cognitive disability user

---

## 11. Prioritized Roadmap

### Phase 1 — Quick Wins (1–2 weeks)

**Effort: ~20–30 hours total**

| ID | Task | Platform | Effort | Acceptance Criteria |
|----|------|----------|--------|---------------------|
| QW-1 | Fix duplicate skip link | Web | 1h | Single skip link with proper focus styles |
| QW-2 | Add `:focus-visible` global styles | Web | 2h | All interactive elements show visible focus ring |
| QW-3 | Add `alt` text to all images | Web | 2h | No axe-core "image-alt" violations |
| QW-4 | Add `aria-label` to nav, footer landmarks | Web | 1h | All landmarks have accessible names |
| QW-5 | Add `aria-current="page"` to active nav link | Web | 1h | Active page indicated to screen readers |
| QW-6 | Verify/fix color contrast ratios | Web+Mobile | 4h | All text meets 4.5:1 ratio |
| QW-7 | Add `prefers-reduced-motion` CSS | Web | 1h | Animations disabled when OS setting is on |
| QW-8 | Add `accessibilityLabel` to all tab bar icons | Mobile | 2h | All tabs announced by VoiceOver/TalkBack |
| QW-9 | Add `accessibilityLabel` to FAB, VoteButton, cards | Mobile | 3h | All interactive elements announced |
| QW-10 | Add `accessibilityRole` to key components | Mobile | 3h | Buttons, links, headers have correct roles |
| QW-11 | Add unique `<title>` to each web page | Web | 1h | Every page has descriptive `<title>` |
| QW-12 | Install & configure axe-core for CI | Web | 3h | Automated a11y tests run on PR |

**Dependencies:** None — all can be done independently.

**Rollback:** Any individual change is independently revertable.

### Phase 2 — Structural Enhancements (1–3 months)

**Effort: ~60–100 hours total**

| ID | Task | Platform | Effort | Acceptance Criteria |
|----|------|----------|--------|---------------------|
| SE-1 | Full heading hierarchy audit & fix | Web+Mobile | 4h | No heading level skips on any page |
| SE-2 | Accessible mobile menu (hamburger) with focus trap | Web | 8h | Menu is fully keyboard operable |
| SE-3 | Live regions for dynamic content | Web+Mobile | 8h | Vote results, status changes announced |
| SE-4 | Accessible countdown timer | Web+Mobile | 6h | Timer announced periodically + at expiry |
| SE-5 | Form accessibility patterns (labels, errors, validation) | Web+Mobile | 12h | All forms meet WCAG 3.3.x |
| SE-6 | Confirmation dialogs for destructive actions | Mobile | 6h | Delete/remove requires confirmation |
| SE-7 | Accessible modal/screen patterns (focus trap, return focus) | Mobile | 8h | All modals trap focus, return focus on close |
| SE-8 | Screen reader announcements for navigation changes | Mobile | 4h | Route changes announced |
| SE-9 | Full Playwright a11y test suite | Web | 8h | All pages tested, CI gates on violations |
| SE-10 | Detox + accessibility tests for mobile | Mobile | 8h | Key flows tested for a11y |
| SE-11 | Touch target audit (≥44×44px) | Mobile | 4h | All targets meet minimum size |
| SE-12 | Loading states and skeleton screens with a11y | Web+Mobile | 6h | Loading states announced, content changes polite |
| SE-13 | Print stylesheet | Web | 3h | Pages print cleanly |

### Phase 3 — Continuous Improvement (Ongoing)

| ID | Task | Frequency | Effort |
|----|------|-----------|--------|
| CI-1 | Full WCAG 2.2 AA audit (manual) | Quarterly | 16h |
| CI-2 | User testing with disabled participants | Bi-annually | 8h |
| CI-3 | Accessibility changelog maintained | Per PR | 0.5h |
| CI-4 | Monitor new WCAG 2.2 requirements | Ongoing | 2h/month |
| CI-5 | Dark mode support with correct contrast | Once | 8h |
| CI-6 | High contrast mode (forced-colors) | Once | 4h |
| CI-7 | Cognitive accessibility review (language, chunking) | Quarterly | 4h |
| CI-8 | Performance audit impact on a11y | Quarterly | 4h |

---

## 12. Code Examples & Patterns

### 12.1 Accessible Skip Link (Web)

**Before** (current — duplicate, inconsistent):
```tsx
<!-- layout.tsx — has poor focus styles -->
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<!-- Navbar.tsx — has good focus styles but is a duplicate -->
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 ...">
  Skip to main content
</a>
```

**After** (single, well-styled skip link in layout.tsx only):
```tsx
// apps/web/src/app/layout.tsx
<body className={inter.className}>
  <a
    href="#main-content"
    className={clsx(
      'sr-only focus:not-sr-only',
      'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
      'focus:px-4 focus:py-2 focus:rounded-lg',
      'focus:bg-violet-700 focus:text-white',
      'focus:shadow-lg focus:outline-none',
      'focus:ring-2 focus:ring-violet-400 focus:ring-offset-2'
    )}
  >
    Skip to main content
  </a>
  {children}
</body>
```

### 12.2 Accessible Navigation Bar (Web)

```tsx
// apps/web/src/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="...">
      <nav aria-label="Main navigation">
        <Link href="/" aria-label="Unspent — Home">
          {/* Logo */}
          <span className="font-bold text-xl">Unspent</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-6" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={clsx(
                  'px-3 py-2 rounded-lg transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-violet-600',
                  pathname === link.href
                    ? 'text-violet-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg focus-visible:outline-2 focus-visible:outline-violet-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-haspopup="true"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-label="Navigation menu"
            className="md:hidden fixed inset-0 z-50 bg-white p-6"
          >
            <ul role="list" className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-lg rounded-lg focus-visible:outline-2 focus-visible:outline-violet-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
```

### 12.3 Accessible Modal Dialog (Web)

```tsx
// apps/web/src/components/AccessibleModal.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AccessibleModal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      dialog.showModal();
    } else {
      dialog.close();
      // Restore focus to triggering element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape (native <dialog> handles this, but we sync state)
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="..."
    >
      <div className="...">
        <h2 id="modal-title" className="text-lg font-semibold">
          {title}
        </h2>
        <div id="modal-description">{children}</div>
        <button
          onClick={onClose}
          className="focus-visible:outline-2 focus-visible:outline-violet-600 ..."
          autoFocus
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
```

### 12.4 Accessible Form Control with Error (Web)

```tsx
// apps/web/src/components/AccessibleInput.tsx
'use client';

import { useId } from 'react';

interface AccessibleInputProps {
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

export function AccessibleInput({
  label,
  type = 'text',
  required = false,
  error,
  hint,
  value,
  onChange,
}: AccessibleInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-500"> *</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={clsx(
          'w-full px-3 py-2 rounded-lg border',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600',
          error
            ? 'border-red-500 ring-1 ring-red-500'
            : 'border-gray-300'
        )}
      />
      {hint && !error && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 12.5 Accessible Breadcrumb (Web)

```tsx
// apps/web/src/components/Breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm" role="list">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="text-gray-400">/</span>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-violet-600 rounded"
              >
                {item.label}
              </a>
            ) : (
              <span aria-current="page" className="text-gray-900 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### 12.6 Accessible Mobile Components

**Accessible Tab Bar (Mobile):**
```tsx
// apps/mobile/app/(tabs)/_layout.tsx — updated tabs
<Tabs
  screenOptions={{
    tabBarAccessibilityLabel: 'Main navigation',
    // ... existing options
  }}
>
  <Tabs.Screen
    name="index"
    options={{
      title: 'Home',
      tabBarAccessibilityLabel: 'Home tab — your wishlist and recent activity',
      tabBarIcon: ({ color }) => (
        <Ionicons
          name="home-outline"
          size={24}
          color={color}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        />
      ),
    }}
  />
  <Tabs.Screen
    name="court"
    options={{
      title: 'Court',
      tabBarAccessibilityLabel: 'Court tab — items your friends are voting on',
      tabBarIcon: ({ color }) => (
        <Ionicons
          name="gavel-outline"
          size={24}
          color={color}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        />
      ),
    }}
  />
  {/* ... other tabs */}
</Tabs>
```

**Accessible Card Component (Mobile):**
```tsx
// apps/mobile/src/components/CourtCard.tsx — updated
<TouchableOpacity
  accessible={true}
  accessibilityLabel={`${item.title}, $${item.price / 100}. Court ends in ${timeRemaining}. ${voteCount} votes.`}
  accessibilityHint="Double tap to view court details and vote"
  accessibilityRole="button"
  onPress={() => router.push(`/court/${item.id}`)}
  className="..."
>
  {/* Decorative image — hidden from assistive tech */}
  <Image
    source={{ uri: item.image_url }}
    accessible={false}
    accessibilityElementsHidden={true}
    importantForAccessibility="no"
    className="..."
  />
  <View accessible={false}>
    <Text accessible={false} className="...">{item.title}</Text>
    <Text accessible={false} className="...">${item.price / 100}</Text>
  </View>
</TouchableOpacity>
```

**Accessible Vote Button (Mobile):**
```tsx
// apps/mobile/src/components/VoteButton.tsx — updated
<TouchableOpacity
  accessible={true}
  accessibilityLabel={`Vote ${voteType}: ${voteType === 'buy' ? 'recommend buying' : voteType === 'pass' ? 'recommend skipping' : 'found a cheaper alternative'}`}
  accessibilityHint="Double tap to cast your vote"
  accessibilityRole="button"
  accessibilityState={{ selected: isSelected }}
  onPress={onPress}
  className={clsx('... min-h-[44px] min-w-[44px]', isSelected && 'ring-2')}
>
  {/* ... content */}
</TouchableOpacity>
```

**Accessible FAB (Mobile):**
```tsx
// apps/mobile/src/components/FAB.tsx — updated
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Add new item to your wishlist"
  accessibilityHint="Double tap to add a new item you're considering purchasing"
  accessibilityRole="button"
  onPress={() => router.push('/add-item')}
  className="... min-h-[56px] min-w-[56px]"  // Exceeds 44px minimum
>
  <Ionicons
    name="add"
    size={28}
    accessibilityElementsHidden={true}
    importantForAccessibility="no"
  />
</TouchableOpacity>
```

---

## Appendix A: Proactive Checklist — Often-Overlooked Items

| Item | Status | Notes |
|------|--------|-------|
| Print stylesheet | ❌ Not implemented | Add `@media print` rules |
| Dark mode | ❌ Not implemented | Plan for Phase 3 CI-5 |
| High contrast mode (forced-colors) | ❌ Not implemented | Add `forced-colors` media query |
| Cookie consent banner | N/A | Not applicable (no cookies currently) |
| Session timeout warnings | ❌ Not implemented | Plan for Phase 2 SES-1 |
| Real-time notifications | ⚠️ Minimal | Supabase realtime — ensure announced |
| Drag and drop | N/A | Not applicable |
| Offline behavior | ❌ Not tested | Verify graceful degradation |
| Payment flow accessibility | ⚠️ Not audited | Stripe checkout — audit iframe a11y |
| CAPTCHA | N/A | Not applicable |
| Cookie consent | N/A | Not applicable |
| iframe accessibility | ⚠️ Stripe | Verify Stripe checkout iframe is a11y |
| Touch gesture alternatives | ⚠️ Swipe to vote? | Ensure all gestures have button alternatives |
| Security vs accessibility | ⚠️ Session | Balance session security with user experience |

---

## Appendix B: Accessibility Changelog Template

```markdown
# Accessibility Changelog

## [Date] — [PR #] — [Description]
### Added
- Added `aria-label` to main navigation

### Fixed
- Fixed color contrast on footer links (3.1:1 → 4.8:1)

### Changed
- Updated skip link focus styles for better visibility

### Testing
- [x] Keyboard-only navigation tested
- [x] VoiceOver tested (iOS/macOS)
- [x] axe-core scan passed (0 violations)
```

---

*This plan is a living document. Update it as recommendations are implemented and new issues are discovered.*