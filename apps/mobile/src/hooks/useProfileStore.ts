import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export interface Profile {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  totalSavedAmount: number;
  isPremium: boolean;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;

  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'username' | 'fullName' | 'avatarUrl' | 'bio'>>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const checkPremium = (premiumUntil: string | null): boolean => {
  if (!premiumUntil) return false;
  return new Date(premiumUntil) > new Date();
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) return;

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, total_saved_amount, premium_until')
        .eq('id', userId)
        .single();

      if (error) throw error;

      set({
        profile: {
          id: data.id,
          username: data.username ?? '',
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          totalSavedAmount: data.total_saved_amount ?? 0,
          isPremium: checkPremium(data.premium_until),
        },
        isLoading: false,
      });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const supabase = useAuthStore.getState().supabase;
    const user = useAuthStore.getState().user;
    if (!supabase || !user) return { error: new Error('Not authenticated') };

    try {
      const dbUpdates: Record<string, string | null> = {};
      if ('username' in updates) dbUpdates.username = updates.username ?? null;
      if ('fullName' in updates) dbUpdates.full_name = updates.fullName ?? null;
      if ('avatarUrl' in updates) dbUpdates.avatar_url = updates.avatarUrl ?? null;
      if ('bio' in updates) dbUpdates.bio = updates.bio ?? null;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  refreshProfile: async () => {
    const user = useAuthStore.getState().user;
    if (user?.id) {
      await useProfileStore.getState().fetchProfile(user.id);
    }
  },
}));
