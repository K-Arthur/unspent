import { create } from 'zustand';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  totalSavedAmount: number;
  premiumUntil: string | null;
  birthDate: string | null;
  isPremium: boolean;
  freeVotesUsedThisWeek: number;
  referralCode: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  supabase: SupabaseClient | null;
  
  initialize: (supabaseUrl: string, supabaseAnonKey: string) => void;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  fetchPremiumStatus: (userId: string) => Promise<boolean>;
  createProfile: (username: string, birthDate?: string) => Promise<{ error: Error | null }>;
}

const checkPremium = (premiumUntil: string | null): boolean => {
  if (!premiumUntil) return false;
  return new Date(premiumUntil) > new Date();
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isPremium: false,
  supabase: null,

  initialize: (supabaseUrl, supabaseAnonKey) => {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    
    set({ supabase });
    
    supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      const isPremium = user ? await get().fetchPremiumStatus(user.id) : false;
      
      set({
        session,
        user,
        isAuthenticated: !!session?.user,
        isPremium,
        isLoading: false,
      });
      
      if (session?.user) {
        await get().fetchProfile();
      }
    });
  },

  fetchPremiumStatus: async (userId: string) => {
    const { supabase } = get();
    if (!supabase) return false;

    const { data } = await supabase
      .from('subscriptions')
      .select('current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return checkPremium(data?.current_period_end);
  },

  signUp: async (email, password) => {
    const { supabase } = get();
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ?? null };
  },

  signIn: async (email, password) => {
    const { supabase } = get();
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  },

  signInWithOAuth: async (provider) => {
    const { supabase } = get();
    if (!supabase) return;
    
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'unspent://oauth',
      },
    });
  },

  signInWithMagicLink: async (email) => {
    const { supabase } = get();
    if (!supabase) return { error: new Error('Supabase not initialized') };
    
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error: error ?? null };
  },

  signOut: async () => {
    const { supabase } = get();
    if (!supabase) return;
    
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false, profile: null });
  },

  refreshSession: async () => {
    const { supabase } = get();
    if (!supabase) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
    });
  },

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      isLoading: false,
    });
  },

  fetchProfile: async () => {
    const { supabase, user } = get();
    if (!supabase || !user) return;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!error && profile) {
      set({
        profile: {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          totalSavedAmount: profile.total_saved_amount,
          premiumUntil: profile.premium_until,
          birthDate: profile.birth_date,
          isPremium: checkPremium(profile.premium_until),
          freeVotesUsedThisWeek: profile.free_votes_used_this_week,
          referralCode: profile.referral_code ?? null,
          createdAt: profile.created_at,
        },
        isPremium: checkPremium(profile.premium_until),
      });
    }
  },

  createProfile: async (username, birthDate) => {
    const { supabase, user } = get();
    if (!supabase || !user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username,
        birth_date: birthDate,
      });
    
    if (!error) {
      await get().fetchProfile();
    }

    return { error: error ?? null };
  },
}));
