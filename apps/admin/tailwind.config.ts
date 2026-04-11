import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0F',
        surface: '#141418',
        elevated: '#1A1A1D',
        neon: '#C45AFF',
        'neon-bright': '#D97BFF',
        'neon-dim': '#8B3FBD',
        'neon-ghost': 'rgba(196,90,255,0.12)',
        'neon-border': 'rgba(196,90,255,0.28)',
        ink: '#FFFFFF',
        'ink-mute': '#9A9AA8',
        'ink-faint': '#5A5A66',
        live: '#4CD964',
        amber: '#FF9F0A',
        danger: '#FF453A',
      },
    },
  },
  plugins: [],
};
export default config;
