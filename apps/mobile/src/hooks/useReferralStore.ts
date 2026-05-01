import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string | null;
  referralCode: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface ReferralState {
  referralCode: string | null;
  referralCount: number;
  isLoading: boolean;
  
  fetchReferralCode: () => Promise<void>;
  generateShareCard: (itemId: string) => Promise<string>;
  shareToSocial: (platform: 'instagram' | 'tiktok' | 'twitter', cardData: ShareCardData) => Promise<void>;
}

export interface ShareCardData {
  itemName: string;
  amountSaved: number;
  username: string;
  streak: number;
}

function generateReferralCode(username: string): string {
  const timestamp = Date.now().toString(36);
  const hash = username
    .toLowerCase()
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
    .toString(36);
  return `UNSPENT-${username.slice(0, 6).toUpperCase()}-${timestamp.slice(-4)}`;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  referralCode: null,
  referralCount: 0,
  isLoading: false,

  fetchReferralCode: async () => {
    set({ isLoading: true });
    
    const supabase = useAuthStore.getState().supabase;
    const { profile } = useAuthStore.getState();
    
    if (!supabase || !profile) {
      set({ isLoading: false });
      return;
    }

    // Check if user already has a referral code
    if (profile.referralCode) {
      set({ 
        referralCode: profile.referralCode,
        referralCount: 0, // Would fetch actual count in production
        isLoading: false 
      });
      return;
    }

    // Generate new referral code
    const referralCode = generateReferralCode(profile.username);

    const { error } = await supabase
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('id', profile.id);

    if (!error) {
      set({ referralCode });
    }

    set({ isLoading: false });
  },

  generateShareCard: async (itemId) => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Server not configured');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/generate-share-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ itemId }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate share card');
    }

    const data = await response.json();
    return data.imageUrl;
  },

  shareToSocial: async (platform, cardData) => {
    // Generate share card image
    const cardUrl = await get().generateShareCard('share');
    
    // In production, would use platform-specific sharing
    // For now, this is a placeholder
    console.log(`Sharing to ${platform}:`, cardData);
  },
}));