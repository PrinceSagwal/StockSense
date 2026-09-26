/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veridian: {
          bg: '#0A0F1E',
          navy: '#0D1B2A',
          panel: '#111827',
          surface: '#1E293B',
          border: '#1E3A5F',
          cyan: '#00D4FF',
          green: '#00FF88',
          red: '#EF4444',
          orange: '#F97316',
          yellow: '#EAB308',
          gold: '#F59E0B',
          purple: '#7C3AED',
        },
        // StockSense Design System - Black/White/Yellow/Red/Green
        brand: {
          yellow: '#F5C518',
          'yellow-light': '#FDE68A',
          'yellow-dark': '#D4A017',
          red: '#DC2626',
          'red-light': '#FEE2E2',
          'red-dark': '#B91C1C',
          green: '#16A34A',
          'green-light': '#DCFCE7',
          'green-dark': '#15803D',
        },
        surface: {
          950: '#030712',
          900: '#0A0A0A',
          800: '#111111',
          700: '#1A1A1A',
          600: '#222222',
          500: '#2A2A2A',
          400: '#333333',
          300: '#555555',
          200: '#888888',
          100: '#AAAAAA',
          50:  '#DDDDDD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
