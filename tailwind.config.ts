import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand: blue (matching logo)
        primary: '#0ea5e9',
        primaryDark: '#0284c7',
        primaryMuted: '#e0f2fe',
        success: '#36a137',
        successDark: '#096d11',
        info: '#1962ff',
        warning: '#d17600',
        danger: '#db142c',
        base: {
          900: '#0d1216',
          50: '#f9fafb',
          100: '#f3f4f6',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
