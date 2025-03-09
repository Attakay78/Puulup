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
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
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