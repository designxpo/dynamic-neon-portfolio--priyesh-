/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#6d28d9',
        'brand-purple-light': '#8B5CF6',
        'dark-bg': '#0a0a1a',
        // Align Tailwind theme with custom CSS variables
        'electric-blue': '#00D4FF',
        'deep-violet': '#7B2CBF',
      },
      animation: {
        'scroll-smooth': 'scroll-smooth 30s linear infinite',
      },
      keyframes: {
        'scroll-smooth': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% / 3))' },
        },
      },
    },
  },
  plugins: [],
}
