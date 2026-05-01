const { colors } = {
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
};

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/shared/src/**/*.{js,ts,tsx}',
  ],
  presets: ['nativewind/babel'],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        background: colors.background,
        surface: colors.surface,
        text: colors.text,
        'text-secondary': colors.textSecondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        buy: colors.buy,
        pass: colors.pass,
        dupe: colors.dupe,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};