export const colors = {
  bg: '#0D0D0F',
  bgSurface: '#141418',
  bgElevated: '#1A1A1D',
  bgDeep: '#08080A',

  neon: '#C45AFF',
  neonBright: '#D97BFF',
  neonDim: '#8B3FBD',
  neonGhost: 'rgba(196, 90, 255, 0.12)',
  neonBorder: 'rgba(196, 90, 255, 0.28)',

  ink: '#FFFFFF',
  inkMute: '#9A9AA8',
  inkFaint: '#5A5A66',
  inkHint: '#3A3A42',

  crowdQuiet: '#32D74B',
  crowdLively: '#FFD60A',
  crowdPacked: '#FF453A',

  live: '#4CD964',
  amber: '#FF9F0A',
  danger: '#FF453A',
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Drunk-friendly: 48px minimum touch target
export const touchTarget = 48;

export const type = {
  display: {
    // Replace with Syne once loaded via expo-font
    fontFamily: 'System',
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
} as const;
