import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { SUBSCRIPTION_PLANS, PREMIUM_PRICE_MONTHLY, PREMIUM_PRICE_YEARLY } from '@unspent/shared/constants';

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: 'monthly' | 'yearly';
  currentPeriodEnd: string | null;
}

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  
  fetchSubscription: () => Promise<void>;
  createCheckoutSession: (plan: 'monthly' | 'yearly') => Promise<{ url?: string; error?: Error }>;
  createRevenueCatEntitlements: () => Promise<string | null>;
  restorePurchases: () => Promise<{ restored: boolean; error?: Error }>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,

  fetchSubscription: async () => {
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

      const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      set({
        subscription: sub ? {
          id: sub.id,
          status: sub.status,
          plan: sub.plan,
          currentPeriodEnd: sub.current_period_end,
        } : null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  createCheckoutSession: async (plan) => {
    set({ isLoading: true, error: null });

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { error: new Error('Server not configured') };
    }

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          priceId: plan === 'monthly' 
            ? SUBSCRIPTION_PLANS.monthly.id 
            : SUBSCRIPTION_PLANS.yearly.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        return { error: new Error(data.error) };
      }

      set({ isLoading: false });
      return { url: data.url };
    } catch (error) {
      set({ isLoading: false });
      return { error: error as Error };
    }
  },

  createRevenueCatEntitlements: async () => {
    // For RevenueCat - would integrate with their SDK
    // This returns the entitlement ID that would be configured in RevenueCat dashboard
    return 'com.unspent.premium';
  },

  restorePurchases: async () => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) {
      return { restored: false, error: new Error('Not authenticated') };
    }

    // RevenueCat restore would happen client-side
    // This is a placeholder for the restore flow
    await get().fetchSubscription();
    
    const sub = get().subscription;
    return { restored: !!sub };
  },
}));

export const PREMIUM_FEATURES = {
  unlimitedFriends: true,
  unlimitedDupeLookups: true,
  premiumShareCards: true,
  earlyAccess: true,
  prioritySupport: true,
} as const;

export function hasPremiumAccess(feature: keyof typeof PREMIUM_FEATURES): boolean {
  const { isPremium } = useAuthStore.getState();
  
  if (isPremium) {
    return true;
  }
  
  // Free tier access
  if (!PREMIUM_FEATURES[feature]) {
    return true;
  }
  
  return false;
}