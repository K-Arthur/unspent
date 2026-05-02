import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export interface Dupe {
  id: string;
  wishlistItemId: string;
  name: string;
  link: string | null;
  suggestedPrice: number;
  confidence: number;
  source: 'openai' | 'serpapi';
  affiliateLink: string | null;
  createdAt: string;
}

interface DupeState {
  dupes: Dupe[];
  isLoading: boolean;
  error: Error | null;
  
  fetchDupes: () => Promise<void>;
  searchDupes: (itemId: string) => Promise<void>;
  refreshDupes: () => Promise<void>;
}

export const useDupeStore = create<DupeState>((set, get) => ({
  dupes: [],
  isLoading: false,
  error: null,

  fetchDupes: async () => {
    set({ isLoading: true, error: null });
    
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // Get user's items with dupe_found status
      const { data: items } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'dupe_found');

      if (!items || items.length === 0) {
        set({ isLoading: false });
        return;
      }

      const itemIds = items.map((i) => i.id);

      // Get dupes for these items
      const { data: dupesData, error } = await supabase
        .from('dupes_log')
        .select('*')
        .in('wishlist_item_id', itemIds)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const dupes: Dupe[] = (dupesData || []).map((d) => ({
        id: d.id,
        wishlistItemId: d.wishlist_item_id,
        name: d.suggested_name || 'Unknown',
        link: d.suggested_dupe_link,
        suggestedPrice: d.suggested_price,
        confidence: d.confidence,
        source: d.source as 'openai' | 'serpapi',
        affiliateLink: d.affiliate_link,
        createdAt: d.created_at,
      }));

      set({ dupes, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  searchDupes: async (itemId) => {
    set({ isLoading: true });

    const supabase = useAuthStore.getState().supabase;
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabase || !supabaseUrl || !supabaseKey) {
      set({ isLoading: false, error: new Error('Server not configured') });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in before searching for dupes');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/search-dupes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw new Error('Failed to search dupes');
      }

      await get().fetchDupes();
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  refreshDupes: async () => {
    await get().fetchDupes();
  },
}));
