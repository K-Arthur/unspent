import { COOLDOWN_HOURS } from '../constants';

export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isUnderAge(birthDate: Date | null, minimumAge: number = 16): boolean {
  if (!birthDate) return true;
  return calculateAge(birthDate) < minimumAge;
}

export function isUnder13(birthDate: Date | null): boolean {
  if (!birthDate) return true;
  return calculateAge(birthDate) < 13;
}

export function getCooldownEndsAt(createdAt: Date = new Date()): Date {
  const endsAt = new Date(createdAt);
  endsAt.setHours(endsAt.getHours() + COOLDOWN_HOURS);
  return endsAt;
}

export function isCooldownExpired(cooldownEndsAt: Date | null): boolean {
  if (!cooldownEndsAt) return true;
  return new Date() >= new Date(cooldownEndsAt);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function formatPrice(priceInDollars: number): number {
  return Math.round(priceInDollars * 100);
}

export function parsePrice(cents: number): number {
  return cents / 100;
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes > 0) return `${diffMinutes}m`;
  return 'now';
}

export function getTimeRemaining(cooldownEndsAt: Date | null): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
} {
  if (!cooldownEndsAt) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
  }

  const now = new Date().getTime();
  const end = new Date(cooldownEndsAt).getTime();
  const totalMs = Math.max(0, end - now);

  return {
    days: Math.floor(totalMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((totalMs / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((totalMs / (1000 * 60)) % 60),
    seconds: Math.floor((totalMs / 1000) % 60),
    totalMs,
    isExpired: totalMs <= 0,
  };
}

export function generateReferralCode(username: string): string {
  const timestamp = Date.now().toString(36);
  const hash = username
    .toLowerCase()
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
    .toString(36);
  return `${timestamp}-${hash.slice(-6)}`;
}

export function sanitizeUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function isPremiumUser(premiumUntil: string | null): boolean {
  if (!premiumUntil) return false;
  return new Date(premiumUntil) > new Date();
}

export function getWeekResetTime(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntilSunday);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

export function generateDeeplink(itemId: string, type: 'item' | 'profile' = 'item'): string {
  const base = 'unspent.app';
  return type === 'item' ? `${base}/court/${itemId}` : `${base}/u/${itemId}`;
}