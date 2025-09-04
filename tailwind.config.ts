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
        primary: '#8b3dff',
        primaryDark: '#7731d8',
        primaryMuted: '#e7dbff',
        teal: '#00c4cc',
        success: '#36a137',
        successDark: '#096d11',
        info: '#1962ff',
        warning: '#d17600',
        danger: '#db142c',
        base: {
          900: '#0d1216',
          50: '#f6f7f8',
          100: '#f0f1f5',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
