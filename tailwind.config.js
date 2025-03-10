/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Instagram-inspired color palette
        primary: {
          DEFAULT: '#E1306C', // Instagram pink/red
          dark: '#C13584',    // Darker pink/purple
          light: '#F56040'    // Orange-red gradient color
        },
        secondary: {
          DEFAULT: '#833AB4', // Instagram purple
          dark: '#5851DB',    // Instagram blue-purple
          light: '#405DE6'    // Instagram blue
        },
        dark: {
          DEFAULT: '#121212', // Instagram dark mode background
          light: '#262626'    // Instagram dark mode secondary background
        },
        light: {
          DEFAULT: '#FAFAFA', // Instagram light background
          dark: '#8E8E8E'     // Instagram muted text
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'system-ui',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      fontSize: {
        'xxs': '0.625rem',      // 10px
        'xs': '0.75rem',        // 12px
        'sm': '0.875rem',       // 14px
        'base': '1rem',         // 16px
        'lg': '1.125rem',       // 18px
        'xl': '1.25rem',        // 20px
        '2xl': '1.5rem',        // 24px
        '3xl': '1.875rem',      // 30px
        '4xl': '2.25rem',       // 36px
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'button': '0 4px 6px -1px rgba(225, 48, 108, 0.3)',
      }
    },
  },
  plugins: [],
};