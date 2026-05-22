import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        mahogany: {
          50: '#fdf6f0',
          100: '#f9e8d8',
          200: '#f0c9a3',
          300: '#e5a46b',
          400: '#d97d3a',
          500: '#c4601e',
          600: '#a34a15',
          700: '#7d3610',
          800: '#5a2509',
          900: '#3b1705',
          950: '#1a0f07',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'shelf': '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
        'book': '4px 4px 16px rgba(0,0,0,0.5), 2px 2px 4px rgba(0,0,0,0.3)',
        'book-hover': '8px 8px 24px rgba(0,0,0,0.6), 4px 4px 8px rgba(0,0,0,0.4)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
