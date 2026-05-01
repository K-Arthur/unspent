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
        'primary-dark': '#3D1C1F',
        secondary: '#A8C5A8',
        accent: '#F5E6D3',
        background: '#FEFBF9',
        surface: '#FFFFFF',
        text: '#2D2D2D',
        'text-secondary': '#6B6B6B',
        success: '#2E7D32',
        'success-light': '#E8F5E9',
        warning: '#E65100',
        'warning-light': '#FFF3E0',
        error: '#C62828',
        dupe: '#0D47A1',
        'dupe-light': '#E3F2FD',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};