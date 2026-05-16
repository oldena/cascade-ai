import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cascade: {
          bg: '#070B09',
          surface: '#0D1A12',
          'surface-2': '#132018',
          border: '#1E3028',
          red: '#E8302A',
          'red-hover': '#D42820',
          teal: '#00D4AA',
          'teal-dim': '#00D4AA1A',
          muted: '#6B7B74',
          text: '#F0F5F2',
          'text-2': '#A8B5AF',
        },
      },
    },
  },
  plugins: [],
}

export default config
