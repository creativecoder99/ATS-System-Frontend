/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#f8f7f4',
          surface: '#ffffff',
          subtle: '#f2f0eb',
          border: '#e5e2dc',
        },
        ink: {
          900: '#1c1917',
          700: '#44403c',
          500: '#78716c',
          400: '#a8a29e',
        },
        brand: {
          DEFAULT: '#0f2942',
          hover: '#163b60',
          active: '#0a1c2e',
          subtle: '#eef3f8',
          border: '#ccdbe7',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
