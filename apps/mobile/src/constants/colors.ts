export const colors = {
  primary: '#E8B4B8',
  primaryDark: '#3D1C1F',
  secondary: '#A8C5A8',
  accent: '#F5E6D3',
  background: '#FEFBF9',
  surface: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#6B6B6B',
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#E65100',
  warningLight: '#FFF3E0',
  error: '#C62828',
  dupe: '#0D47A1',
  dupeLight: '#E3F2FD',
} as const;

export type ColorKey = keyof typeof colors;