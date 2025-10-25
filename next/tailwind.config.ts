import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Include existing project components while migrating
    "../components/**/*.{js,ts,jsx,tsx}",
    "../*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        // Make Tailwind's font-sans use Next Font variables for visual parity with original
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
      colors: {
        // Match previous CDN Tailwind config used in index.html
        'dark-bg': '#1A152A',
        'brand-purple': '#6C63FF',
        'brand-purple-light': '#a78bfa',
        'brand-accent': '#00C4FF',
        // Additional palette used across the app
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
} satisfies Config
