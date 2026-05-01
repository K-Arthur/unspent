export const stats = {
  itemsAdded: 12,
  itemsPassed: 8,
  votesGiven: 24,
  votesReceived: 45,
  streak: 5,
} as const;

export const mockWishlistItems = [
  {
    id: '1',
    title: 'Dyson Airwrap',
    description: 'Multi-Styler Complete',
    price: 59900,
    imageUrl: 'https://example.com/dyson.jpg',
    status: 'cooling_off' as const,
    cooldownEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Le Labo Santal 33',
    description: 'Perfume',
    price: 18000,
    imageUrl: 'https://example.com/lelabo.jpg',
    status: 'expired' as const,
    cooldownEndsAt: null,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Apple Watch Ultra',
    description: '49mm',
    price: 79900,
    imageUrl: 'https://example.com/watch.jpg',
    status: 'purchased' as const,
    cooldownEndsAt: null,
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
  },
] as const;

export const mockCourtItems = [
  {
    id: 'c1',
    userId: 'friend1',
    title: 'Skims Cotton Sculpt',
    price: 8800,
    imageUrl: 'https://example.com/skims.jpg',
    username: 'sarah',
    voteCounts: { buy: 2, pass: 5, dupe: 1 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    userId: 'friend2',
    title: 'Patagonia Better Sweater',
    price: 13900,
    imageUrl: 'https://example.com/patagonia.jpg',
    username: 'jessica',
    voteCounts: { buy: 1, pass: 3, dupe: 2 },
    createdAt: new Date().toISOString(),
  },
] as const;

export const mockDupes = [
  {
    id: 'd1',
    wishlistItemId: '1',
    name: 'Dyson Airwrap Dupe - Revlon',
    link: 'https://amazon.com/revlon',
    suggestedPrice: 12999,
    confidence: 0.85,
    source: 'serpapi' as const,
  },
  {
    id: 'd2',
    wishlistItemId: '1',
    name: 'Dyson Airwrap Alternative - Shark',
    link: 'https://amazon.com/shark',
    suggestedPrice: 19999,
    confidence: 0.92,
    source: 'serpapi' as const,
  },
] as const;