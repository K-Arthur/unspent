# Database Schema Reference

> **Source:** `supabase/migrations/` (5 migration files)  
> **Last verified:** 2026-05-01  
> **Engine:** PostgreSQL 17  
> **RLS:** All tables have Row Level Security enabled

## Tables Overview

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `profiles` | User profiles (extends `auth.users`) | `id` → `auth.users(id)` |
| `wishlist_items` | User wishlist items with status | `user_id` → `profiles(id)` |
| `friendships` | Friend relationships | `requester_id`, `addressee_id` → `profiles(id)` |
| `votes` | Community votes on wishlist items | `wishlist_item_id` → `wishlist_items(id)`, `voter_id` → `profiles(id)` |
| `savings_tallies` | Running total of money saved | `user_id` → `profiles(id)`, `item_id` → `wishlist_items(id)` |
| `dupes_log` | AI-found cheaper alternatives | `wishlist_item_id` → `wishlist_items(id)` |
| `subscriptions` | Stripe/RevenueCat subscription status | `user_id` → `profiles(id)` |
| `moderation_reports` | Content moderation flags | `reported_by` → `profiles(id)`, `item_id` → `wishlist_items(id)` |

---

## Table Definitions

### `profiles`

Extends Supabase `auth.users` via foreign key.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | No | — | PK, references `auth.users(id) ON DELETE CASCADE` |
| `username` | `TEXT` | Yes | — | UNIQUE constraint |
| `full_name` | `TEXT` | Yes | — | |
| `avatar_url` | `TEXT` | Yes | — | |
| `bio` | `TEXT` | Yes | — | |
| `total_saved_amount` | `INTEGER` | No | `0` | Server-managed (trigger-protected) |
| `premium_until` | `TIMESTAMPTZ` | Yes | — | Server-managed (trigger-protected) |
| `birth_date` | `DATE` | Yes | — | Used for age gate (13+ enforcement) |
| `free_votes_used_this_week` | `INTEGER` | No | `0` | Server-managed (trigger-protected) |
| `free_votes_reset_at` | `TIMESTAMPTZ` | No | `NOW()` | Server-managed (trigger-protected) |
| `referrer_id` | `UUID` | Yes | — | References `profiles(id)` |
| `referral_code` | `TEXT` | Yes | — | UNIQUE constraint |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Auto-updated via trigger |

**RLS Policies:**
- `Authenticated users can view profiles` — SELECT allowed for all authenticated users
- `Users can update own profile` — UPDATE where `auth.uid() = id`
- `Users can insert own profile` — INSERT where `auth.uid() = id`

**Protected Fields (trigger `protect_profile_system_fields_on_update`):**
- `total_saved_amount`, `premium_until`, `free_votes_used_this_week`, `free_votes_reset_at`, `referrer_id` cannot be changed by client updates.

---

### `wishlist_items`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `user_id` | `UUID` | No | — | References `profiles(id) ON DELETE CASCADE` |
| `title` | `TEXT` | No | — | |
| `description` | `TEXT` | Yes | — | |
| `link` | `TEXT` | Yes | — | |
| `image_url` | `TEXT` | Yes | — | |
| `price` | `INTEGER` | No | — | Stored in cents |
| `status` | `TEXT` | No | `'pending'` | CHECK: `pending`, `cooling_off`, `expired`, `purchased`, `dupe_found` |
| `is_in_court` | `BOOLEAN` | No | `false` | Whether item is in community voting |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |
| `cooldown_ends_at` | `TIMESTAMPTZ` | Yes | — | 72 hours after creation |
| `voted_at` | `TIMESTAMPTZ` | Yes | — | When voting concluded |

**Indexes:**
- `idx_wishlist_items_user_id` ON `user_id`
- `idx_wishlist_items_status` ON `status`
- `idx_wishlist_items_cooldown_ends` ON `cooldown_ends_at`

**RLS Policies:**
- `Wishlist items visible to owner and friends` — SELECT where `user_id = auth.uid()` OR `is_in_court = true`
- `Users can create wishlist items` — INSERT where `auth.uid() = user_id`
- `Users can update own wishlist items` — UPDATE where `auth.uid() = user_id`
- `Users can delete own wishlist items` — DELETE where `auth.uid() = user_id`

---

### `friendships`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `requester_id` | `UUID` | No | — | References `profiles(id) ON DELETE CASCADE` |
| `addressee_id` | `UUID` | No | — | References `profiles(id) ON DELETE CASCADE` |
| `status` | `TEXT` | No | `'pending'` | CHECK: `pending`, `accepted`, `rejected` |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**Constraints:**
- PRIMARY KEY (`requester_id`, `addressee_id`)
- CHECK: `requester_id <> addressee_id` (no self-friendships)
- UNIQUE INDEX: `idx_friendships_unique_pair` (LEAST/GREATEST ordering)

**RLS Policies:**
- `Friendships visible to participants` — SELECT where `requester_id = auth.uid()` OR `addressee_id = auth.uid()`
- `Users can create friendships` — INSERT where `auth.uid() = requester_id`
- `Addressees can respond to friendships` — UPDATE where `addressee_id = auth.uid()`
- `Participants can delete friendships` — DELETE where `requester_id = auth.uid()` OR `addressee_id = auth.uid()`

---

### `votes`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `wishlist_item_id` | `UUID` | No | — | References `wishlist_items(id) ON DELETE CASCADE` |
| `voter_id` | `UUID` | No | — | References `profiles(id) ON DELETE CASCADE` |
| `vote_type` | `TEXT` | No | — | CHECK: `buy`, `pass`, `dupe` |
| `reason` | `TEXT` | Yes | — | Vote reason (e.g., "Too expensive") |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**Constraints:**
- UNIQUE (`wishlist_item_id`, `voter_id`) — one vote per user per item

**Indexes:**
- `idx_votes_wishlist_item` ON `wishlist_item_id`
- `idx_votes_voter` ON `voter_id`

**RLS Policies:**
- `Votes on court items are publicly viewable` — SELECT where item `is_in_court = true`
- `Users can read their own votes` — SELECT where `voter_id = auth.uid()`
- `Authenticated users can create votes on court items` — INSERT where `auth.uid() = voter_id` AND item `is_in_court = true` AND item `user_id <> auth.uid()`
- `Users can update their own votes on court items` — UPDATE where `voter_id = auth.uid()` AND item `is_in_court = true` AND item `user_id <> auth.uid()`

---

### `savings_tallies`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `user_id` | `UUID` | No | — | References `profiles(id) ON DELETE CASCADE` |
| `item_id` | `UUID` | No | — | References `wishlist_items(id) ON DELETE CASCADE` |
| `amount_saved` | `INTEGER` | No | — | Stored in cents |
| `recorded_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**Constraints:**
- UNIQUE INDEX: `idx_savings_tallies_item_unique` ON `item_id` (prevents duplicate savings on retry)

**Indexes:**
- `idx_savings_tallies_user` ON `user_id`

**RLS Policies:**
- `Savings tallies visible to owner` — SELECT where `user_id = auth.uid()`
- Savings records are server-managed (no INSERT policy for clients)

---

### `dupes_log`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `wishlist_item_id` | `UUID` | No | — | References `wishlist_items(id) ON DELETE CASCADE` |
| `suggested_dupe_link` | `TEXT` | No | — | Amazon/product URL |
| `suggested_price` | `INTEGER` | No | — | Stored in cents |
| `suggested_name` | `TEXT` | Yes | — | |
| `affiliate_link` | `TEXT` | Yes | — | Via Skimlinks |
| `source` | `TEXT` | No | — | CHECK: `openai`, `serpapi` |
| `confidence` | `DECIMAL(3,2)` | No | `0` | 0.00–1.00 |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**Indexes:**
- `idx_dupes_log_item` ON `wishlist_item_id`

**RLS Policies:**
- `Dupes visible to item owner` — SELECT where `wishlist_item_id` IN (SELECT from `wishlist_items` where `user_id = auth.uid()`)

---

### `subscriptions`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `user_id` | `UUID` | No | — | References `profiles(id) ON DELETE CASCADE` |
| `stripe_subscription_id` | `TEXT` | Yes | — | UNIQUE |
| `revenuecat_subscription_id` | `TEXT` | Yes | — | UNIQUE |
| `status` | `TEXT` | No | `'trialing'` | CHECK: `active`, `canceled`, `past_due`, `trialing` |
| `plan` | `TEXT` | Yes | — | CHECK: `monthly`, `yearly` |
| `current_period_end` | `TIMESTAMPTZ` | Yes | — | |

**RLS Policies:**
- `Subscriptions visible to owner` — SELECT where `user_id = auth.uid()`
- Subscription records are server-managed (no INSERT/UPDATE policies for clients)

---

### `moderation_reports`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `UUID` | No | `gen_random_uuid()` | PK |
| `reported_by` | `UUID` | No | — | References `profiles(id) ON DELETE CASCADE` |
| `item_id` | `UUID` | No | — | References `wishlist_items(id) ON DELETE CASCADE` |
| `reason` | `TEXT` | No | — | |
| `status` | `TEXT` | No | `'pending'` | CHECK: `pending`, `approved`, `rejected` |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**RLS Policies:**
- `Reports visible to owner` — SELECT where `reported_by = auth.uid()`
- `Users can create reports` — INSERT where `auth.uid() = reported_by`

---

## Database Functions

### `user_age(birth_date DATE) → INTEGER`

Returns the user's age in years.

```sql
SELECT user_age('2000-01-01'); -- Returns age as of current date
```

**Source:** `supabase/migrations/001_initial_schema.sql`, updated in `003_hardening_fixes.sql`

---

### `calculate_vote_outcome(item_uuid UUID, threshold INTEGER DEFAULT 3) → TABLE(...)`

Calculates vote outcome for a wishlist item.

**Returns:**
| Column | Type | Description |
|--------|------|-------------|
| `buy_count` | `BIGINT` | Number of "buy" votes |
| `pass_count` | `BIGINT` | Number of "pass" votes |
| `dupe_count` | `BIGINT` | Number of "dupe" votes |
| `total_votes` | `BIGINT` | Total votes |
| `winner` | `TEXT` | `'buy'`, `'pass'`, `'dupe'`, or `NULL` |
| `saved_amount` | `INTEGER` | Item price if winner is `pass` or `dupe`, else 0 |

**Logic:**
- If `total_votes >= threshold` (default 3): majority rules
- If `total_votes < threshold`: default to `'pass'`
- Ties: `winner` is `NULL`

**Source:** `supabase/migrations/001_initial_schema.sql`, updated in `003_hardening_fixes.sql`

---

### `increment_savings(user_id UUID, amount INTEGER) → VOID`

Server-side function to safely increment a user's `total_saved_amount`.

```sql
SELECT increment_savings('user-uuid-here', 5000); -- Add $50.00
```

**Source:** `supabase/migrations/003_hardening_fixes.sql`

---

### `reset_weekly_votes() → VOID`

Resets `free_votes_used_this_week` to 0 for users whose `free_votes_reset_at < NOW()`.

**Source:** `supabase/migrations/001_initial_schema.sql`

**Scheduled via:** `pg_cron` (see below)

---

## Triggers

### Age Gate: `check_age_on_signup`

Prevents users under 13 from signing up.

```sql
-- Raises: "You must be at least 13 years old to use Unspent"
```

**Source:** `supabase/migrations/001_initial_schema.sql`, updated in `003_hardening_fixes.sql`

---

### Profile System Fields: `protect_profile_system_fields_on_update`

BEFORE UPDATE trigger on `profiles` that prevents clients from modifying:
- `total_saved_amount`
- `premium_until`
- `free_votes_used_this_week`
- `free_votes_reset_at`
- `referrer_id`

**Source:** `supabase/migrations/003_hardening_fixes.sql`

---

## Scheduled Jobs (pg_cron)

### `process-vested-items`

Runs every 5 minutes to process wishlist items that have passed their cooldown period.

| Property | Value |
|----------|-------|
| **Schedule** | `*/5 * * * *` (every 5 minutes) |
| **Function** | Edge Function: `process-vested` |
| **Auth** | `x-cron-secret` header |

**Source:** `supabase/migrations/005_schedule_process_vested.sql`

---

## Setup & Migrations

### Running Migrations Locally

```bash
# Start local Supabase
supabase start

# Push migrations
pnpm supabase:db:push

# Verify
supabase db diff
```

### Migration Files

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Initial schema: 7 tables, RLS, policies, functions |
| `002_court_vote_visibility.sql` | Additional vote visibility policies |
| `003_hardening_fixes.sql` | Fixed age calc, vote outcome, protected fields |
| `004_profile_privacy_and_friendship_integrity.sql` | Removed public profile access, added friendship constraints |
| `005_schedule_process_vested.sql` | Added pg_cron for automated vested-item processing |

---

## Data Types Reference

### Enums (Application-Level)

These are enforced via CHECK constraints and mirrored in TypeScript types (`packages/shared/src/types/index.ts`):

| Type | Values |
|------|--------|
| `VoteType` | `'buy'`, `'pass'`, `'dupe'` |
| `WishlistItemStatus` | `'pending'`, `'cooling_off'`, `'expired'`, `'purchased'`, `'dupe_found'` |
| `FriendshipStatus` | `'pending'`, `'accepted'`, `'rejected'` |
| `SubscriptionStatus` | `'active'`, `'canceled'`, `'past_due'`, `'trialing'` |
| `SubscriptionPlan` | `'monthly'`, `'yearly'` |
| `ModerationStatus` | `'pending'`, `'approved'`, `'rejected'` |

### Price Storage

All prices are stored as **INTEGER (cents)**:
- `$49.99` → `4999`
- Display: `(price / 100).toFixed(2)`
