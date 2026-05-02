import { z } from 'zod';
import { VOTE_THRESHOLD, COOLDOWN_HOURS } from '../constants';

function calculateAgeFromDate(date: Date): number {
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const birthDateSchema = z
  .string()
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid birth date')
  .refine((val) => {
    const date = new Date(val);
    return calculateAgeFromDate(date) >= 13;
  }, 'You must be at least 13 years old to use Unspent')
  .transform((val) => new Date(val));

export const profileCreateSchema = z.object({
  username: usernameSchema,
  fullName: z.string().max(100).optional(),
  birthDate: birthDateSchema,
});

export const profileUpdateSchema = z.object({
  fullName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const wishlistItemCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().nullable(),
  link: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  price: z
    .number()
    .int()
    .min(0, 'Price must be positive')
    .max(999999, 'Price seems unrealistic'),
});

export const wishlistItemUpdateSchema = wishlistItemCreateSchema.partial();

export const voteCreateSchema = z.object({
  wishlistItemId: z.string().uuid(),
  voteType: z.enum(['buy', 'pass', 'dupe']),
  reason: z
    .string()
    .max(200)
    .optional()
    .nullable(),
});

export const voteReasonOptions = [
  'already_have',
  'wait_for_sale',
  'bad_reviews',
  'too_expensive',
  'found_cheaper',
  'dont_need',
  'impulse',
  'regret',
  'other',
] as const;

export const voteReasonSchema = z.enum(voteReasonOptions);

export const friendshipActionSchema = z.object({
  addresseeId: z.string().uuid(),
  action: z.enum(['accept', 'reject']),
});

export const friendRequestSchema = z.object({
  username: usernameSchema,
});

export const moderationReportSchema = z.object({
  itemId: z.string().uuid(),
  reason: z.string().min(10, 'Please provide more details').max(500),
});

export const subscriptionCreateSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
  platform: z.enum(['stripe', 'revenuecat']),
});

export const dupeSearchSchema = z.object({
  wishlistItemId: z.string().uuid(),
});

export const shareCardSchema = z.object({
  itemId: z.string().uuid(),
  templateId: z.string().optional(),
});

export const checkoutSessionSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const linkPreviewSchema = z.object({
  url: z.string().url(),
});

export const voteOutcomeSchema = z
  .object({
    buy: z.number().int().min(0),
    pass: z.number().int().min(0),
    dupe: z.number().int().min(0),
  })
  .transform((data) => {
    const total = data.buy + data.pass + data.dupe;
    const winner =
      total >= VOTE_THRESHOLD
        ? data.buy > data.pass && data.buy > data.dupe
          ? 'buy'
          : data.pass > data.buy && data.pass > data.dupe
          ? 'pass'
          : data.dupe > data.buy && data.dupe > data.pass
          ? 'dupe'
          : null
        : null;
    return {
      ...data,
      total,
      winner,
      savedAmount: winner && winner !== 'buy' ? data.buy * 0 : 0,
    };
  });

export type UsernameInput = z.infer<typeof usernameSchema>;
export type BirthDateInput = z.infer<typeof birthDateSchema>;
export type ProfileCreateInput = z.infer<typeof profileCreateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type WishlistItemCreateInput = z.infer<typeof wishlistItemCreateSchema>;
export type WishlistItemUpdateInput = z.infer<typeof wishlistItemUpdateSchema>;
export type VoteCreateInput = z.infer<typeof voteCreateSchema>;
export type VoteReason = z.infer<typeof voteReasonSchema>;
export type FriendshipActionInput = z.infer<typeof friendshipActionSchema>;
export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
export type ModerationReportInput = z.infer<typeof moderationReportSchema>;
export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
export type DupeSearchInput = z.infer<typeof dupeSearchSchema>;
export type ShareCardInput = z.infer<typeof shareCardSchema>;
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
export type LinkPreviewInput = z.infer<typeof linkPreviewSchema>;
export type VoteOutcomeData = z.infer<typeof voteOutcomeSchema>;
