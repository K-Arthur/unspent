export const COOLDOWN_HOURS = 72;
export const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

export const MAX_FREE_VOTES_PER_WEEK = 5;
export const MAX_FREE_FRIENDS = 20;
export const MAX_WISHLIST_ITEMS = 100;

export const VOTE_THRESHOLD = 3;

export const PREMIUM_PRICE_MONTHLY = 499;
export const PREMIUM_PRICE_YEARLY = 3999;

export const TRIAL_DAYS = 7;

export const DUPES_TO_FETCH = 3;

export const RATE_LIMITS = {
  VOTE_PER_MINUTE: 10,
  DUPE_PER_HOUR: 5,
  VOTE_OUTCOME_JOB_CRON: '*/15 * * * *',
} as const;

export const PLATFORMS = {
  APPLE_STORE_URL: 'https://apps.apple.com/app/unspent',
  GOOGLE_PLAY_URL: 'https://play.google.com/store/apps/details?id=app.unspent',
} as const;

export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'price_monthly',
    price: PREMIUM_PRICE_MONTHLY,
    name: 'Unspent Premium',
    features: [
      'Unlimited friends',
      'Unlimited dupe lookups',
      'Premium share cards',
      'Priority support',
    ],
  },
  yearly: {
    id: 'price_yearly',
    price: PREMIUM_PRICE_YEARLY,
    name: 'Unspent Premium Yearly',
    features: [
      'Unlimited friends',
      'Unlimited dupe lookups',
      'Premium share cards',
      'Priority support',
      'Save 33%',
    ],
  },
} as const;

export const SCREENS = {
  onboarding: ['Welcome', 'HowItWorks', 'FirstWish'],
  tabs: ['Home', 'Court', 'DupeFinder', 'Profile'],
} as const;

export const COLORS = {
  primary: '#E8B4B8',
  secondary: '#A8C5A8',
  accent: '#F5E6D3',
  background: '#FEFBF9',
  surface: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#6B6B6B',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  buy: '#4CAF50',
  pass: '#FFC107',
  dupe: '#2196F3',
} as const;

export const BADGE_COLORS = {
  premium: '#E8B4B8',
  ambassador: '#A8C5A8',
  streak: '#F5E6D3',
} as const;

export const CONTENT_CATEGORIES_BLOCKED = [
  'weight loss',
  'diet pills',
  'ozempic',
  'wegovy',
  'cosmetic surgery',
  'body wraps',
  'detox teas',
] as const;