-- Allow any authenticated user to read votes on items that are currently in court.
-- This is needed so the court feed can display vote counts for community items.
CREATE POLICY "Votes on court items are publicly viewable" ON votes FOR SELECT
  USING (
    wishlist_item_id IN (
      SELECT id FROM wishlist_items WHERE is_in_court = true
    )
  );

-- Allow voters to read their own votes on any item (needed for useCourtStore user-vote lookup).
CREATE POLICY "Users can read their own votes" ON votes FOR SELECT
  USING (voter_id = auth.uid());

-- Allow updating votes (for vote changes). The existing INSERT policy covers new votes.
CREATE POLICY "Users can update their own votes" ON votes FOR UPDATE
  USING (voter_id = auth.uid());
