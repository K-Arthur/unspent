export type UUID = string;

export type VoteType = 'buy' | 'pass' | 'dupe';
export type WishlistItemStatus = 'pending' | 'cooling_off' | 'expired' | 'purchased' | 'dupe_found';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type SubscriptionPlan = 'monthly' | 'yearly';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: UUID;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  totalSavedAmount: number;
  premiumUntil: string | null;
  birthDate: string | null;
  isPremium: boolean;
  freeVotesUsedThisWeek: number;
  createdAt: string;
}

export interface WishlistItem {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  link: string | null;
  imageUrl: string | null;
  price: number;
  status: WishlistItemStatus;
  isInCourt: boolean;
  createdAt: string;
  cooldownEndsAt: string | null;
  votedAt: string | null;
}

export interface Friendship {
  requesterId: UUID;
  addresseeId: UUID;
  status: FriendshipStatus;
  createdAt: string;
}

export interface Vote {
  id: UUID;
  wishlistItemId: UUID;
  voterId: UUID;
  voteType: VoteType;
  reason: string | null;
  createdAt: string;
}

export interface VoteWithProfile extends Vote {
  voter: Pick<UserProfile, 'id' | 'username' | 'avatarUrl' | 'fullName'>;
}

export interface SavingsTally {
  id: UUID;
  userId: UUID;
  itemId: UUID;
  amountSaved: number;
  recordedAt: string;
}

export interface Dupe {
  id: UUID;
  wishlistItemId: UUID;
  suggestedDupeLink: string;
  suggestedPrice: number;
  suggestedName: string;
  affiliateLink: string | null;
  source: 'openai' | 'serpapi';
  confidence: number;
  createdAt: string;
}

export interface Subscription {
  id: UUID;
  userId: UUID;
  stripeSubscriptionId: string | null;
  revenueCatSubscriptionId: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan | null;
  currentPeriodEnd: string | null;
}

export interface ModerationReport {
  id: UUID;
  reportedBy: UUID;
  itemId: UUID;
  reason: string;
  status: ModerationStatus;
  createdAt: string;
}

export interface FriendWithProfile {
  friendship: Friendship;
  profile: UserProfile;
}

export interface VoteOutcome {
  buy: number;
  pass: number;
  dupe: number;
  total: number;
  winner: VoteType | null;
  savedAmount: number;
}

export interface WeeklyStats {
  itemsAdded: number;
  itemsPassed: number;
  moneySaved: number;
  votesGiven: number;
  votesReceived: number;
}

export interface ShareCardData {
  itemName: string;
  amountSaved: number;
  username: string;
  streak: number;
  qrCodeUrl: string;
}