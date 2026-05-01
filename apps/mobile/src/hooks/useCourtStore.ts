import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export interface CourtItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  username: string;
  userAvatar: string | null;
  voteCounts: { buy: number; pass: number; dupe: number };
  userVote: 'buy' | 'pass' | 'dupe' | null;
  createdAt: string;
  cooldownEndsAt: string;
}

interface CourtState {
  courtItems: CourtItem[];
  isLoading: boolean;
  error: Error | null;
  
  fetchCourtItems: () => Promise<void>;
  voteOnItem: (itemId: string, voteType: 'buy' | 'pass' | 'dupe', reason?: string) => Promise<{ error: Error | null }>;
  refreshCourtItems: () => Promise<void>;
}

export const useCourtStore = create<CourtState>((set, get) => ({
  courtItems: [],
  isLoading: false,
  error: null,

  fetchCourtItems: async () => {
    set({ isLoading: true, error: null });
    
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get items in court (excluding own items)
      const { data: items, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          profiles!wishlist_items_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('is_in_court', true)
        .neq('status', 'purchased')
        .neq('status', 'dupe_found')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get vote counts and current user's votes for these items
      const itemIds = (items || []).map((item) => item.id);
      
      let userVotes: Record<string, string> = {};
      
      if (user && itemIds.length > 0) {
        const { data: votes } = await supabase
          .from('votes')
          .select('wishlist_item_id, vote_type')
          .eq('voter_id', user.id)
          .in('wishlist_item_id', itemIds);
        
        (votes || []).forEach((v) => {
          userVotes[v.wishlist_item_id] = v.vote_type;
        });
      }

      const voteCounts: Record<string, { buy: number; pass: number; dupe: number }> = {};
      
      if (itemIds.length > 0) {
        const { data: counts } = await supabase
          .from('votes')
          .select('wishlist_item_id, vote_type')
          .in('wishlist_item_id', itemIds);

        (counts || []).forEach((v) => {
          if (!voteCounts[v.wishlist_item_id]) {
            voteCounts[v.wishlist_item_id] = { buy: 0, pass: 0, dupe: 0 };
          }
          voteCounts[v.wishlist_item_id][v.vote_type as 'buy' | 'pass' | 'dupe']++;
        });
      }

      const courtItems: CourtItem[] = (items || [])
        .filter((item) => user ? item.user_id !== user.id : true)
        .map((item) => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          price: item.price,
          username: item.profiles?.username || 'anonymous',
          userAvatar: item.profiles?.avatar_url,
          voteCounts: voteCounts[item.id] || { buy: 0, pass: 0, dupe: 0 },
          userVote: (userVotes[item.id] as 'buy' | 'pass' | 'dupe') || null,
          createdAt: item.created_at,
          cooldownEndsAt: item.cooldown_ends_at,
        }));

      set({ courtItems, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  voteOnItem: async (itemId, voteType, reason) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) return { error: new Error('Not authenticated') };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Not authenticated') };

      // Check if user already voted
      const { data: existing } = await supabase
        .from('votes')
        .select('id')
        .eq('wishlist_item_id', itemId)
        .eq('voter_id', user.id)
        .single();

      if (existing) {
        // Update existing vote
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteType, reason: reason || null })
          .eq('wishlist_item_id', itemId)
          .eq('voter_id', user.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('votes')
          .insert({
            wishlist_item_id: itemId,
            voter_id: user.id,
            vote_type: voteType,
            reason: reason || null,
          });

        if (error) throw error;
      }

      // Update local state immediately
      set((state) => ({
        courtItems: state.courtItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                userVote: voteType,
                voteCounts: {
                  ...item.voteCounts,
                  [voteType]: item.voteCounts[voteType] + 1,
                },
              }
            : item
        ),
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  refreshCourtItems: async () => {
    await get().fetchCourtItems();
  },
}));