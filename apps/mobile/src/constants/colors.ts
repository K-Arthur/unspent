export const colors = {
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

export type ColorKey = keyof typeof colors;