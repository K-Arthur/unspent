const palette = {
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
};

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: palette.primary,
        'primary-dark': palette.primaryDark,
        secondary: palette.secondary,
        accent: palette.accent,
        background: palette.background,
        surface: palette.surface,
        text: palette.text,
        'text-secondary': palette.textSecondary,
        success: palette.success,
        'success-light': palette.successLight,
        warning: palette.warning,
        'warning-light': palette.warningLight,
        error: palette.error,
        dupe: palette.dupe,
        'dupe-light': palette.dupeLight,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
