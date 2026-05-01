import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export interface Friend {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface FriendsState {
  friends: Friend[];
  pendingRequests: Friend[];
  isLoading: boolean;
  error: Error | null;
  
  fetchFriends: () => Promise<void>;
  searchUsers: (query: string) => Promise<Friend[]>;
  sendRequest: (userId: string) => Promise<{ error: Error | null }>;
  respondToRequest: (requesterId: string, accept: boolean) => Promise<{ error: Error | null }>;
  removeFriend: (userId: string) => Promise<{ error: Error | null }>;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
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

      // Get accepted friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          *,
          profiles!friendships_addressee_id_fkey (
            username,
            full_name,
            avatar_url
          ),
          profiles!friendships_requester_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'accepted')
        .eq('requester_id', user.id);

      if (error) throw error;

      const friendsList: Friend[] = (friendships || []).map((f) => ({
        id: f.addressee_id === user.id ? f.requester_id : f.addressee_id,
        userId: f.addressee_id === user.id ? f.requester_id : f.addressee_id,
        username: f.addressee_id === user.id 
          ? f.profiles?.username 
          : f.profiles?.username,
        fullName: f.addressee_id === user.id 
          ? f.profiles?.full_name 
          : f.profiles?.full_name,
        avatarUrl: f.addressee_id === user.id 
          ? f.profiles?.avatar_url 
          : f.profiles?.avatar_url,
        status: 'accepted',
        createdAt: f.created_at,
      }));

      // Get pending requests (where user is addressee)
      const { data: requests } = await supabase
        .from('friendships')
        .select(`
          *,
          profiles!friendships_requester_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .eq('addressee_id', user.id);

      const pendingList: Friend[] = (requests || []).map((r) => ({
        id: r.requester_id,
        userId: r.requester_id,
        username: r.profiles?.username || 'unknown',
        fullName: r.profiles?.full_name || null,
        avatarUrl: r.profiles?.avatar_url || null,
        status: 'pending',
        createdAt: r.created_at,
      }));

      set({ 
        friends: friendsList, 
        pendingRequests: pendingList,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  searchUsers: async (query) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase || !query.trim()) {
      return [];
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      return (data || []).map((p) => ({
        id: p.id,
        userId: p.id,
        username: p.username,
        fullName: p.full_name,
        avatarUrl: p.avatar_url,
        status: 'accepted' as const,
        createdAt: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  sendRequest: async (userId) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) return { error: new Error('Not authenticated') };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Not authenticated') };

      // Check if request already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('id')
        .eq('requester_id', user.id)
        .eq('addressee_id', userId)
        .single();

      if (existing) {
        return { error: new Error('Request already sent') };
      }

      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
        });

      return { error: error ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  respondToRequest: async (requesterId, accept) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) return { error: new Error('Not authenticated') };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Not authenticated') };

      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('requester_id', requesterId)
        .eq('addressee_id', user.id);

      if (!error && accept) {
        await get().fetchFriends();
      }

      return { error: error ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  removeFriend: async (userId) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) return { error: new Error('Not authenticated') };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: new Error('Not authenticated') };

      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('requester_id', user.id)
        .eq('addressee_id', userId);

      if (!error) {
        set((state) => ({
          friends: state.friends.filter((f) => f.userId !== userId),
        }));
      }

      return { error: error ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  },
}));