import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

let supabaseClient: SupabaseClient<Database> | null = null;

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  return supabaseClient;
}

export const tables = {
  profiles: 'profiles',
  wishlistItems: 'wishlist_items',
  friendships: 'friendships',
  votes: 'votes',
  savingsTallies: 'savings_tallies',
  dupesLog: 'dupes_log',
  subscriptions: 'subscriptions',
  moderationReports: 'moderation_reports',
} as const;

export const storage = {
  avatars: 'avatars',
  screenshots: 'screenshots',
  shareCards: 'share-cards',
} as const;