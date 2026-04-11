import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0D0D0F',
          surface: '#141418',
          elevated: '#1A1A1D',
          deep: '#08080A',
        },
        neon: {
          DEFAULT: '#C45AFF',
          bright: '#D97BFF',
          dim: '#8B3FBD',
          ghost: 'rgba(196, 90, 255, 0.12)',
          border: 'rgba(196, 90, 255, 0.28)',
        },
        ink: {
          DEFAULT: '#FFFFFF',
          mute: '#9A9AA8',
          faint: '#5A5A66',
          hint: '#3A3A42',
        },
        crowd: {
          quiet: '#32D74B',
          lively: '#FFD60A',
          packed: '#FF453A',
        },
        live: '#4CD964',
        amber: '#FF9F0A',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
      },
      boxShadow: {
        glow: '0 0 40px rgba(196, 90, 255, 0.35), 0 0 80px rgba(196, 90, 255, 0.15)',
        'glow-sm': '0 0 20px rgba(196, 90, 255, 0.3)',
        'glow-lg': '0 0 80px rgba(196, 90, 255, 0.45), 0 0 160px rgba(196, 90, 255, 0.18)',
        pill: '0 8px 24px rgba(196, 90, 255, 0.35)',
      },
      backgroundImage: {
        'radial-neon': 'radial-gradient(circle at center, rgba(196,90,255,0.25) 0%, rgba(196,90,255,0) 60%)',
        'grid-faint': 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 12s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
        'marquee': 'marquee 40s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 24s linear infinite',
        'orb': 'orb 14s ease-in-out infinite',
        'tick': 'tick 1.6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-18px) translateX(4px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.08)' },
          '66%': { transform: 'translate(-30px, 20px) scale(0.95)' },
        },
        tick: {
          '0%, 100%': { transform: 'scaleY(0.4)', opacity: '0.5' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
