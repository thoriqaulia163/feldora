import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        feldora: {
          bg: '#0a0a0f',
          surface: '#12121a',
          'surface-light': '#1a1a26',
          border: '#2a2a3a',
          accent: '#8b5cf6',
          'accent-soft': '#6d28d9',
          'accent-glow': 'rgba(139, 92, 246, 0.15)',
          'accent-secondary': '#f97316',
          muted: '#6b7280',
          text: '#f5f5f7',
          'text-secondary': '#a1a1aa',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cinematic':
          'linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(10,10,15,0.8) 50%, rgba(10,10,15,1) 100%)',
        'gradient-hero':
          'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'loading-bar': 'loadingBar 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(139,92,246,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(139,92,246,0.4)' },
        },
        loadingBar: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      skew: {
        '3': '3deg',
        '6': '6deg',
      },
    },
  },
  plugins: [],
} satisfies Config
