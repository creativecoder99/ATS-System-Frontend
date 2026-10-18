/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e5ff',
          200: '#bcd1ff',
          300: '#8eb3ff',
          400: '#5989ff',
          500: '#3563ff',
          600: '#1f40f5',
          700: '#182fe1',
          800: '#1a29b6',
          900: '#1c2a8f',
        },
      },
    },
  },
  plugins: [],
};
