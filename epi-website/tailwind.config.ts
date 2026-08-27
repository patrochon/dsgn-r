import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020408',
          900: '#050b14',
          800: '#0a1628',
          700: '#112238',
          600: '#1a3350',
        },
        gold: {
          300: '#f0d875',
          400: '#e8c547',
          500: '#d4a853',
          600: '#b8892e',
          700: '#8b6220',
        },
        parchment: {
          50:  '#fdf8f0',
          100: '#f8edd8',
          200: '#edd9b8',
          300: '#dfc498',
        },
        // Team colors
        blanches: '#e8e8e8',
        blondes:  '#f4c430',
        stouts:   '#6b3a1f',
        rousses:  '#c0392b',
      },
      fontFamily: {
        pirate: ['Georgia', 'Palatino Linotype', 'serif'],
        body:   ['system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'wood-gradient': 'linear-gradient(135deg, #2c1810 0%, #4a2c0a 50%, #2c1810 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4a853 0%, #f0d875 50%, #d4a853 100%)',
        'ocean-gradient': 'linear-gradient(180deg, #0a1628 0%, #050b14 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'sway': 'sway 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
