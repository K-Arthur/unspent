import { create } from 'zustand';

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
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const mockProfile: Profile = {
        id: userId,
        username: 'demo_user',
        fullName: 'Demo User',
        avatarUrl: null,
        bio: 'Saving for what matters',
        totalSavedAmount: 12500,
        isPremium: false,
      };
      set({ profile: mockProfile, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    }));
  },

  refreshProfile: async () => {
    const { profile } = useProfileStore.getState();
    if (profile?.id) {
      await useProfileStore.getState().fetchProfile(profile.id);
    }
  },
}));