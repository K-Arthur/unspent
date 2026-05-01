export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          total_saved_amount: number;
          premium_until: string | null;
          birth_date: string | null;
          free_votes_used_this_week: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          total_saved_amount?: number;
          premium_until?: string | null;
          birth_date?: string | null;
          free_votes_used_this_week?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          total_saved_amount?: number;
          premium_until?: string | null;
          birth_date?: string | null;
          free_votes_used_this_week?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          description: string | null;
          link: string | null;
          image_url: string | null;
          price: number;
          status: string;
          is_in_court: boolean;
          created_at: string;
          cooldown_ends_at: string | null;
          voted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          description?: string | null;
          link?: string | null;
          image_url?: string | null;
          price?: number;
          status?: string;
          is_in_court?: boolean;
          created_at?: string;
          cooldown_ends_at?: string | null;
          voted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          description?: string | null;
          link?: string | null;
          image_url?: string | null;
          price?: number;
          status?: string;
          is_in_court?: boolean;
          created_at?: string;
          cooldown_ends_at?: string | null;
          voted_at?: string | null;
        };
      };
      friendships: {
        Row: {
          requester_id: string;
          addressee_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          requester_id: string;
          addressee_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          requester_id?: string;
          addressee_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          wishlist_item_id: string;
          voter_id: string;
          vote_type: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wishlist_item_id: string;
          voter_id: string;
          vote_type: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wishlist_item_id?: string;
          voter_id?: string;
          vote_type?: string;
          reason?: string | null;
          created_at?: string;
        };
      };
      savings_tallies: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          amount_saved: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          amount_saved: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          amount_saved?: number;
          recorded_at?: string;
        };
      };
      dupes_log: {
        Row: {
          id: string;
          wishlist_item_id: string;
          suggested_dupe_link: string;
          suggested_price: number;
          suggested_name: string | null;
          affiliate_link: string | null;
          source: string;
          confidence: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          wishlist_item_id: string;
          suggested_dupe_link: string;
          suggested_price: number;
          suggested_name?: string | null;
          affiliate_link?: string | null;
          source: string;
          confidence?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          wishlist_item_id?: string;
          suggested_dupe_link?: string;
          suggested_price?: number;
          suggested_name?: string | null;
          affiliate_link?: string | null;
          source?: string;
          confidence?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          revenuecat_subscription_id: string | null;
          status: string;
          plan: string | null;
          current_period_end: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          revenuecat_subscription_id?: string | null;
          status?: string;
          plan?: string | null;
          current_period_end?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string | null;
          revenuecat_subscription_id?: string | null;
          status?: string;
          plan?: string | null;
          current_period_end?: string | null;
        };
      };
      moderation_reports: {
        Row: {
          id: string;
          reported_by: string;
          item_id: string;
          reason: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reported_by: string;
          item_id: string;
          reason: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          reported_by?: string;
          item_id?: string;
          reason?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};