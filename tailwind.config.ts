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
          bg: 'rgb(var(--feldora-bg) / <alpha-value>)',
          surface: 'rgb(var(--feldora-surface) / <alpha-value>)',
          'surface-light': 'rgb(var(--feldora-surface-light) / <alpha-value>)',
          border: 'rgb(var(--feldora-border) / <alpha-value>)',
          accent: 'rgb(var(--feldora-accent) / <alpha-value>)',
          'accent-soft': 'rgb(var(--feldora-accent-soft) / <alpha-value>)',
          'accent-glow': 'var(--feldora-accent-glow)',
          'accent-secondary': 'rgb(var(--feldora-accent-secondary) / <alpha-value>)',
          muted: 'rgb(var(--feldora-muted) / <alpha-value>)',
          text: 'rgb(var(--feldora-text) / <alpha-value>)',
          'text-secondary': 'rgb(var(--feldora-text-secondary) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cinematic': 'var(--feldora-gradient-cinematic)',
        'gradient-hero': 'var(--feldora-gradient-hero)',
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
          '0%': { boxShadow: '0 0 5px var(--feldora-glow-shadow-sm)' },
          '100%': { boxShadow: '0 0 20px var(--feldora-glow-shadow-lg)' },
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
