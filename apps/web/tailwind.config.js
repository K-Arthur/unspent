/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E8B4B8',
        secondary: '#A8C5A8',
        accent: '#F5E6D3',
        background: '#FEFBF9',
        surface: '#FFFFFF',
        text: '#2D2D2D',
        'text-secondary': '#6B6B6B',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        buy: '#4CAF50',
        pass: '#FFC107',
        dupe: '#2196F3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};