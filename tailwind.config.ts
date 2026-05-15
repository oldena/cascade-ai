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
          red: '#e63030',
          dark: '#0a0a0a',
          card: '#111111',
          border: '#1f1f1f',
          muted: '#888888',
        },
      },
    },
  },
  plugins: [],
}

export default config
