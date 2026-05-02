-- Prevent duplicate savings rows if an item-processing job is retried.
CREATE UNIQUE INDEX IF NOT EXISTS idx_savings_tallies_item_unique
  ON savings_tallies(item_id);

-- Correct age calculation so birthdays later in the current year are handled.
CREATE OR REPLACE FUNCTION user_age(birth_date DATE)
RETURNS INTEGER AS $$
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION prevent_under13_signup()
RETURNS TRIGGER AS $$
  DECLARE computed_age INTEGER;
  BEGIN
    IF NEW.birth_date IS NOT NULL THEN
      computed_age := user_age(NEW.birth_date);
      IF computed_age < 13 THEN
        RAISE EXCEPTION 'You must be at least 13 years old to use Unspent';
      END IF;
    END IF;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

-- Return an outcome even for items with zero votes.
CREATE OR REPLACE FUNCTION calculate_vote_outcome(item_uuid UUID, threshold INTEGER DEFAULT 3)
RETURNS TABLE (
  buy_count BIGINT,
  pass_count BIGINT,
  dupe_count BIGINT,
  total_votes BIGINT,
  winner TEXT,
  saved_amount INTEGER
) AS $$
  DECLARE
    v_buy BIGINT := 0;
    v_pass BIGINT := 0;
    v_dupe BIGINT := 0;
    v_total BIGINT := 0;
    v_winner TEXT;
    v_price INTEGER := 0;
  BEGIN
    SELECT
      COUNT(v.*) FILTER (WHERE v.vote_type = 'buy'),
      COUNT(v.*) FILTER (WHERE v.vote_type = 'pass'),
      COUNT(v.*) FILTER (WHERE v.vote_type = 'dupe'),
      wi.price
    INTO v_buy, v_pass, v_dupe, v_price
    FROM wishlist_items wi
    LEFT JOIN votes v ON v.wishlist_item_id = wi.id
    WHERE wi.id = item_uuid
    GROUP BY wi.price;

    v_total := COALESCE(v_buy, 0) + COALESCE(v_pass, 0) + COALESCE(v_dupe, 0);

    IF v_total >= threshold THEN
      IF v_buy > v_pass AND v_buy > v_dupe THEN
        v_winner := 'buy';
      ELSIF v_pass > v_buy AND v_pass > v_dupe THEN
        v_winner := 'pass';
      ELSIF v_dupe > v_buy AND v_dupe > v_pass THEN
        v_winner := 'dupe';
      ELSE
        v_winner := NULL;
      END IF;
    ELSE
      v_winner := 'pass';
    END IF;

    RETURN QUERY SELECT
      COALESCE(v_buy, 0),
      COALESCE(v_pass, 0),
      COALESCE(v_dupe, 0),
      v_total,
      v_winner,
      CASE WHEN v_winner = 'pass' OR v_winner = 'dupe' THEN v_price ELSE 0 END;
  END;
$$ LANGUAGE plpgsql;

-- Service-side helper used by the vested-item processor.
CREATE OR REPLACE FUNCTION increment_savings(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
  UPDATE profiles
  SET total_saved_amount = COALESCE(total_saved_amount, 0) + amount,
      updated_at = NOW()
  WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Clients should not be able to mark themselves premium or forge savings totals.
CREATE OR REPLACE FUNCTION protect_profile_system_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = NEW.id THEN
    NEW.total_saved_amount := OLD.total_saved_amount;
    NEW.premium_until := OLD.premium_until;
    NEW.free_votes_used_this_week := OLD.free_votes_used_this_week;
    NEW.free_votes_reset_at := OLD.free_votes_reset_at;
    NEW.referrer_id := OLD.referrer_id;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_profile_system_fields_on_update ON profiles;
CREATE TRIGGER protect_profile_system_fields_on_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_profile_system_fields();

-- Savings and subscriptions are server-owned records. Service role bypasses RLS.
DROP POLICY IF EXISTS "Users can create savings tallies" ON savings_tallies;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- Only invite recipients can accept/reject. Either participant can remove.
DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;

CREATE POLICY "Addressees can respond to friendships" ON friendships FOR UPDATE
  USING (addressee_id = auth.uid())
  WITH CHECK (addressee_id = auth.uid());

CREATE POLICY "Participants can delete friendships" ON friendships FOR DELETE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Votes are only valid from authenticated users on someone else's court item.
DROP POLICY IF EXISTS "Authenticated users can create votes" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;

CREATE POLICY "Authenticated users can create votes on court items" ON votes FOR INSERT
  WITH CHECK (
    auth.uid() = voter_id
    AND wishlist_item_id IN (
      SELECT id
      FROM wishlist_items
      WHERE is_in_court = true
        AND user_id <> auth.uid()
    )
  );

CREATE POLICY "Users can update their own votes on court items" ON votes FOR UPDATE
  USING (voter_id = auth.uid())
  WITH CHECK (
    auth.uid() = voter_id
    AND wishlist_item_id IN (
      SELECT id
      FROM wishlist_items
      WHERE is_in_court = true
        AND user_id <> auth.uid()
    )
  );
