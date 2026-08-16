/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F84464',
          hover: '#D62F4D',
          light: '#FDF2F4',
          glow: 'rgba(248, 68, 100, 0.15)',
        },
        monochrome: {
          50: '#09090A',
          100: '#121217',
          200: '#1C1C28',
          300: '#28293D',
          400: '#3A3A4A',
          500: '#555770',
          600: '#8F90A6',
          700: '#E1E1E6',
          800: '#F2F2F5',
          900: '#FFFFFF',
          950: '#F5F5FA',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
