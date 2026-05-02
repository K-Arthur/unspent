-- Do not expose private profile columns to anonymous visitors.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Authenticated users can view profiles" ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Block self-friendships and duplicate inverse friendship rows at the database layer.
ALTER TABLE friendships
  ADD CONSTRAINT friendships_no_self_request CHECK (requester_id <> addressee_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_unique_pair
  ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
