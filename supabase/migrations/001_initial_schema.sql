-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  total_saved_amount INTEGER DEFAULT 0,
  premium_until TIMESTAMPTZ,
  birth_date DATE,
  free_votes_used_this_week INTEGER DEFAULT 0,
  free_votes_reset_at TIMESTAMPTZ DEFAULT NOW(),
  referrer_id UUID REFERENCES profiles(id),
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist items table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  image_url TEXT,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cooling_off', 'expired', 'purchased', 'dupe_found')),
  is_in_court BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cooldown_ends_at TIMESTAMPTZ,
  voted_at TIMESTAMPTZ
);

-- Friendships table
CREATE TABLE friendships (
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (requester_id, addressee_id)
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('buy', 'pass', 'dupe')) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wishlist_item_id, voter_id)
);

-- Savings tallies table
CREATE TABLE savings_tallies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE NOT NULL,
  amount_saved INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dupes log table
CREATE TABLE dupes_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE NOT NULL,
  suggested_dupe_link TEXT NOT NULL,
  suggested_price INTEGER NOT NULL,
  suggested_name TEXT,
  affiliate_link TEXT,
  source TEXT CHECK (source IN ('openai', 'serpapi')) NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  revenuecat_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'trialing' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  plan TEXT CHECK (plan IN ('monthly', 'yearly')),
  current_period_end TIMESTAMPTZ
);

-- Moderation reports table
CREATE TABLE moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES wishlist_items(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_status ON wishlist_items(status);
CREATE INDEX idx_wishlist_items_cooldown_ends ON wishlist_items(cooldown_ends_at);
CREATE INDEX idx_votes_wishlist_item ON votes(wishlist_item_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);
CREATE INDEX idx_savings_tallies_user ON savings_tallies(user_id);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_dupes_log_item ON dupes_log(wishlist_item_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_tallies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dupes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for wishlist_items
CREATE POLICY "Wishlist items visible to owner and friends" ON wishlist_items FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR is_in_court = true
  );
CREATE POLICY "Users can create wishlist items" ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlist items" ON wishlist_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist items" ON wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for votes
CREATE POLICY "Votes visible to item owner" ON votes FOR SELECT 
  USING (
    wishlist_item_id IN (
      SELECT id FROM wishlist_items WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Authenticated users can create votes" ON votes FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- RLS Policies for friendships
CREATE POLICY "Friendships visible to participants" ON friendships FOR SELECT 
  USING (
    requester_id = auth.uid() 
    OR addressee_id = auth.uid()
  );
CREATE POLICY "Users can create friendships" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own friendships" ON friendships FOR UPDATE 
  USING (
    requester_id = auth.uid() 
    OR addressee_id = auth.uid()
  );

-- RLS Policies for savings_tallies
CREATE POLICY "Savings tallies visible to owner" ON savings_tallies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create savings tallies" ON savings_tallies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for dupes_log
CREATE POLICY "Dupes visible to item owner" ON dupes_log FOR SELECT 
  USING (
    wishlist_item_id IN (
      SELECT id FROM wishlist_items WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Subscriptions visible to owner" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for moderation_reports
CREATE POLICY "Reports visible to owner" ON moderation_reports FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Users can create reports" ON moderation_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- Function to check user age (for age gate)
CREATE OR REPLACE FUNCTION user_age(birth_date DATE)
RETURNS INTEGER AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER - 
    CASE WHEN EXTRACT(MONTH FROM birth_date) > EXTRACT(MONTH FROM NOW()) OR 
      (EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM NOW()) AND 
       EXTRACT(DAY FROM birth_date) > EXTRACT(DAY FROM NOW()))
    THEN 1 ELSE 0 END;
$$ LANGUAGE SQL IMMUTABLE;

-- Trigger to prevent signup if under 13
CREATE OR REPLACE FUNCTION prevent_under13_signup()
RETURNS TRIGGER AS $$
  DECLARE user_age INTEGER;
  BEGIN
    IF NEW.birth_date IS NOT NULL THEN
      user_age := user_age(NEW.birth_date);
      IF user_age < 13 THEN
        RAISE EXCEPTION 'You must be at least 13 years old to use Unspent';
      END IF;
    END IF;
    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_age_on_signup
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_under13_signup();

-- Function to calculate vote outcome
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
    v_buy INTEGER;
    v_pass INTEGER;
    v_dupe INTEGER;
    v_total INTEGER;
    v_winner TEXT;
    v_price INTEGER;
  BEGIN
    SELECT COUNT(*) FILTER (WHERE vote_type = 'buy'),
           COUNT(*) FILTER (WHERE vote_type = 'pass'),
           COUNT(*) FILTER (WHERE vote_type = 'dupe'),
           price
    INTO v_buy, v_pass, v_dupe, v_price
    FROM votes
    JOIN wishlist_items ON votes.wishlist_item_id = wishlist_items.id
    WHERE wishlist_item_id = item_uuid
    GROUP BY price;
    
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

-- Function to reset weekly votes
CREATE OR REPLACE FUNCTION reset_weekly_votes()
RETURNS VOID AS $$
  UPDATE profiles
  SET free_votes_used_this_week = 0,
      free_votes_reset_at = NOW() + INTERVAL '7 days'
  WHERE free_votes_reset_at < NOW();
$$ LANGUAGE sql;