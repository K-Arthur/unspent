# Navigation & Usability Overhaul Plan — Unspent

> **Status:** P0 fixes implemented · P1/P2/P3 planned  
> **Last updated:** April 30, 2026  
> **Principle:** Zero breaking changes · Incremental · Mobile-first

---

## Summary of Changes Made (P0 — Shipped)

### ✅ Fix #1: Add Item Modal — iOS Back Button Trap (CRITICAL)

**Problem:** The Add Item screen was presented as a `modal` with `slide_from_bottom`. On iOS, the standard swipe-from-left-edge gesture does nothing in modals. Users who tried to go back were stuck.

**Solution applied in `apps/mobile/app/_layout.tsx`:**
- Added explicit ✕ close button via `headerLeft` with `router.back()`
- Added `gestureEnabled: true` for swipe-down dismiss
- Button has `accessibilityLabel="Close"`, `accessibilityHint`, and `accessibilityRole="button"`

### ✅ Fix #1b: Unsaved Changes Guard on Add Item

**Problem:** Accidentally dismissing the Add Item modal lost all entered data with no warning.

**Solution applied in `apps/mobile/app/add-item/index.tsx`:**
- Added `beforeRemove` navigation listener
- If form has any data (title, description, link, price, or image), shows Alert:
  - "Keep Editing" (cancel)
  - "Discard" (destructive — proceeds with navigation)
- Clean form = no alert (instant dismiss)

### ✅ Fix #2: Onboarding Escape Hatches

**Problem:** Onboarding was a `fullScreenModal` with no way to go back between steps or skip entirely.

**Solution applied in `apps/mobile/app/onboarding/index.tsx`:**
- Added "← Back" button on slides > 0 (goes to previous slide)
- Added "← Back" button on age-gate step (returns to slides)
- Added "← Back" button on signup step (returns to age-gate)
- Added "Skip for now" on age-gate and signup steps → navigates to `(tabs)`
- "Skip" on slides → navigates to `(tabs)`

### ✅ Fix #3: Tab Bar Active State

**Problem:** Tab icons used emojis that ignored the `color` prop. No visual distinction between active/inactive tabs.

**Solution applied in `apps/mobile/app/(tabs)/_layout.tsx`:**
- Active tab gets a colored background pill (`colors.accent`)
- Active tab shows a small dot indicator below the icon
- Improved `tabBarStyle` with border separator and consistent sizing
- All tabs have `tabBarAccessibilityLabel` for screen readers

### ✅ Fix #5: Upgrade Screen Back Path

**Problem:** Users sent to the upgrade screen from `LockedFeature` had no guaranteed way back.

**Solution applied in `apps/mobile/app/_layout.tsx`:**
- Added explicit `headerBackTitle: 'Back'` to upgrade screen config

---

## P1: Quick Wins (Next 1–2 Sprints)

### 🔲 Fix #6: Undo Snackbar for Destructive Actions

**Problem:** Removing a wishlist item, un-voting in court — no undo possible.

**Plan:**
1. Create `src/components/UndoSnackbar.tsx` — a bottom toast that shows for 5 seconds
2. Modify `useWishlistStore.removeItem()` to store the deleted item in a `lastDeleted` buffer
3. Show snackbar after deletion with "Undo" button that re-adds the item
4. Accessible: announce via `accessibilityLiveRegion="polite"`, keyboard-dismissable

```tsx
// Pseudocode for UndoSnackbar
const UndoSnackbar = ({ visible, onUndo, onDismiss, message }) => (
  <View accessibilityLiveRegion="polite" accessibilityRole="alert">
    <Text>{message}</Text>
    <Pressable onPress={onUndo} accessibilityRole="button">
      <Text>Undo</Text>
    </Pressable>
  </View>
);
```

### 🔲 Fix #7: Draft Save for Add Item Form

**Problem:** Users still lose data if they accidentally confirm the "Discard" alert or the app crashes.

**Plan:**
1. Save form state to `AsyncStorage` on every field change (debounced)
2. On mount, check for existing draft → offer "Continue where you left off?"
3. Clear draft on successful submission
4. Key: `@unspent:draft-add-item`

### 🔲 Fix #8: Empty State CTAs

**Problem:** Empty Wishlist, Court, Dupes screens show text but no actionable navigation.

**Plan:**
- Empty Wishlist → "Add your first item" button that highlights the FAB
- Empty Court → "Submit an item to the Court" with navigation hint
- Empty Dupes → "Browse items to find dupes" link

### 🔲 Fix #9: Deep Link Stack Integrity

**Problem:** Deep links to `item/[id]` or `profile/[username]` may land users on isolated screens without the tab bar.

**Plan:**
1. Create `src/hooks/useDeepLinkHandler.ts`
2. Ensure tab navigator is mounted before pushing detail screens
3. Test: `unspent://item/123` should show the item with tabs accessible at bottom

### 🔲 Fix #10: Basic Search/Filter

**Problem:** No way to search within Court, Dupes, or Wishlist.

**Plan:**
- Add a search bar at top of Court and Dupes screens
- Filter by item title (client-side for now)
- Accessible: `accessibilityRole="search"`, `accessibilityLabel`

---

## P2: Short-Term Improvements (2–4 Sprints)

### 🔲 Fix #11: Profile Tab vs Detail Route Disambiguation

**Problem:** `profile` is both a tab and a detail route `profile/[username]`. Back behavior may confuse.

**Plan:** Ensure `profile/[username]` header says "Profile" with back to previous screen (not to profile tab).

### 🔲 Fix #12: Haptic Feedback

**Plan:** Add `expo-haptics` for:
- Successful add item (notification success)
- Vote in court (impact light)
- Tab switch (selection light)
- Progressive enhancement — no-op if unavailable

### 🔲 Fix #13: Edit Profile Unsaved Changes Guard

**Plan:** Same `beforeRemove` pattern as Add Item screen for `edit-profile.tsx`.

### 🔲 Fix #14: Court Vote Undo

**Plan:** Allow changing vote within active voting period. Show toast "Voted! Tap to undo for 3s".

### 🔲 Fix #15: Error Boundaries & Loading States

**Plan:**
- Create `src/components/ErrorBoundary.tsx` with retry button
- Add skeleton screens for detail views
- Ensure no dead-end error states

---

## P3: Long-Term Strategic

### 🔲 Web App Navigation (when product features land on web)
### 🔲 Personalized shortcuts & quick-access
### 🔲 Offline queue & cold-start navigation state restoration
### 🔲 Command palette (⌘K) for power users

---

## Hidden Risks to Monitor

| Risk | Why It Matters | Mitigation |
|---|---|---|
| Browser back button in SPA | Web share routes are standalone — users may have no nav | Add "Get the App" CTA on share pages |
| Cold start state | Zustand resets on app kill — detail screens may render empty | Add null checks + loading to all detail screens |
| Session timeout mid-flow | No auth guard on screens — user may be logged out mid-action | Add global session listener |
| Android hardware back | Verify modal dismiss works with Android back button | Test on Android explicitly |
| Gesture conflicts | FAB in bottom-right may conflict with future swipe gestures | Designate safe gesture zones |

---

## Testing Checklist (Manual)

After each change, verify:

- [ ] Can navigate to and from the changed screen
- [ ] Tab bar still works on all 4 tabs
- [ ] Deep links still resolve correctly
- [ ] No console errors in development
- [ ] Works on iPhone with notch (X+) — swipe gestures
- [ ] Works on iPhone with home button (SE) — no gesture bar
- [ ] Works on Android — hardware back button
- [ ] VoiceOver can navigate the changed screen
- [ ] All existing flows still work end-to-end

---

## Implementation Strategy

1. **Every change is additive** — never remove existing elements until replacement is validated
2. **Each fix is a separate commit** — `git revert` is the rollback plan
3. **Manual test checklist** per change (see above)
4. **No database migrations** needed for any of these changes
5. **Feature flags** when available — wrap new behavior in config toggle

---

## Recommended Sprint Plan

| Sprint | Focus | Items |
|---|---|---|
| **Sprint 1** ✅ | Critical fixes | #1 (modal close), #1b (unsaved guard), #2 (onboarding), #3 (tabs), #5 (upgrade back) |
| **Sprint 2** | Quick wins | #6 (undo snackbar), #7 (draft save), #8 (empty states) |
| **Sprint 3** | Accessibility + polish | #4 (a11y labels all components), #9 (deep links), #12 (haptics) |
| **Sprint 4** | Search + recovery | #10 (search), #13 (edit profile guard), #14 (vote undo) |
| **Sprint 5** | Robustness | #15 (error boundaries), #11 (profile disambiguation) |