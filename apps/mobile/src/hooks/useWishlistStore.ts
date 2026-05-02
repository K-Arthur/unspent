import { create } from 'zustand';
import { COOLDOWN_HOURS } from '@unspent/shared/constants';
import { useAuthStore } from './useAuthStore';

export interface WishlistItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  link: string | null;
  imageUrl: string | null;
  price: number;
  status: 'pending' | 'cooling_off' | 'expired' | 'purchased' | 'dupe_found';
  isInCourt: boolean;
  createdAt: string;
  cooldownEndsAt: string | null;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: Error | null;
  
  fetchItems: () => Promise<void>;
  addItem: (item: {
    title: string;
    description?: string;
    link?: string;
    imageUrl?: string;
    price: number;
  }) => Promise<{ error: Error | null; itemId?: string }>;
  updateItem: (id: string, updates: Partial<WishlistItem>) => Promise<{ error: Error | null }>;
  deleteItem: (id: string) => Promise<{ error: Error | null }>;
  submitToCourt: (id: string) => Promise<{ error: Error | null }>;
  markAsPurchased: (id: string) => Promise<{ error: Error | null }>;
  refreshItems: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
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

      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items: WishlistItem[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        link: item.link,
        imageUrl: item.image_url,
        price: item.price,
        status: item.status,
        isInCourt: item.is_in_court,
        createdAt: item.created_at,
        cooldownEndsAt: item.cooldown_ends_at,
      }));

      set({ items, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  addItem: async (item) => {
    set({ isLoading: true, error: null });
    
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) {
      set({ isLoading: false });
      return { error: new Error('Not authenticated'), itemId: undefined };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return { error: new Error('Not authenticated'), itemId: undefined };
      }

      const cooldownEndsAt = new Date();
      cooldownEndsAt.setHours(cooldownEndsAt.getHours() + COOLDOWN_HOURS);

      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          title: item.title,
          description: item.description || null,
          link: item.link || null,
          image_url: item.imageUrl || null,
          price: item.price,
          status: 'cooling_off',
          cooldown_ends_at: cooldownEndsAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: WishlistItem = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        link: data.link,
        imageUrl: data.image_url,
        price: data.price,
        status: data.status,
        isInCourt: data.is_in_court,
        createdAt: data.created_at,
        cooldownEndsAt: data.cooldown_ends_at,
      };

      set((state) => ({
        items: [newItem, ...state.items],
        isLoading: false,
      }));

      return { error: null, itemId: data.id };
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      return { error: error as Error, itemId: undefined };
    }
  },

  updateItem: async (id, updates) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) return { error: new Error('Not authenticated') };

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.link !== undefined) updateData.link = updates.link;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.isInCourt !== undefined) updateData.is_in_court = updates.isInCourt;

      const { error } = await supabase
        .from('wishlist_items')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  deleteItem: async (id) => {
    const supabase = useAuthStore.getState().supabase;
    if (!supabase) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  submitToCourt: async (id) => {
    const { updateItem } = get();
    return updateItem(id, { isInCourt: true });
  },

  markAsPurchased: async (id) => {
    const { updateItem } = get();
    return updateItem(id, { status: 'purchased' });
  },

  refreshItems: async () => {
    await get().fetchItems();
  },
}));
