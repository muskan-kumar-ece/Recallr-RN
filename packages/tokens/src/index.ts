export const tokens = {
  colors: {
    bg: '#F2F0EB',
    background: '#F2F0EB',
    surface: '#FFFFFF',
    border: 'rgba(0,0,0,0.05)',
    borderStrong: 'rgba(0,0,0,0.10)',
    divider: 'rgba(0,0,0,0.05)',
    text: '#2B2B2B',
    textSecondary: '#6B6B66',
    textMuted: '#8A8A85',
    accent: '#E8641B',
    accentTint: '#FDEBDD',
    accentTintSoft: '#FFF9F4',
    accentDark: '#B84A10',
    accentPressed: '#D05615',
    danger: '#D9483B',
    dangerTint: '#FBE5E2',
    dangerSoft: '#FFF0EE',
    success: '#3B6D11',
    successTint: '#EAF3DE',
    fill: '#ECE9E3',
    toastBg: '#2B2B2B',
    toastAction: '#FFB27F',
    bannerBg: '#FDEBDD',
    bannerText: '#8A3A0C',
    toggleTrackOff: '#D6D3CC',
    segmentedTrack: '#EDEBE5',
    pressedRow: '#F5F3EE',
    inputCardFill: '#F7F6F2',
  },
  categories: {
    orange: '#E8641B',
    indigo: '#4F5BD5',
    teal: '#1D9E75',
    pink: '#D4537E',
    slate: '#444441',
  },
  typography: {
    fontFamily: 'Inter',
    titleLg: { size: 24, weight: 500, lineHeight: 1.3 },
    title: { size: 21, weight: 500, lineHeight: 1.35 },
    section: { size: 15, weight: 500, lineHeight: 1.4 },
    body: { size: 14, weight: 400, lineHeight: 1.4 },
    bodyStrong: { size: 14, weight: 500, lineHeight: 1.4 },
    small: { size: 12, weight: 400, lineHeight: 1.4 },
    caption: { size: 11, weight: 400, lineHeight: 1.4 },
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 12,
    input: 14,
    card: 16,
    chip: 20,
    tabBar: 30,
    sheet: 24,
    bottomSheet: 24,
    button: 25,
    full: 9999,
  },
  orangeCorner: {
    lg: { width: 78, height: 58, radius: 40 },
    md: { width: 56, height: 44, radius: 32 },
    sm: { width: 48, height: 38, radius: 26 },
  },
  spacing: {
    screenPadding: 14,
    gapCards: 12,
    gapSections: 18,
  },
  shadows: {
    card: '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05)',
    shadowCard: '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05)',
    nav: '0 2px 4px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.10)',
    shadowNav: '0 2px 4px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.10)',
    tabBar: '0 2px 4px rgba(0,0,0,0.05), 0 10px 28px rgba(0,0,0,0.10)',
    shadowAccent: '0 8px 18px rgba(232,100,27,0.40)',
    raised: '0 8px 18px rgba(232,100,27,0.40)',
    floating: '0 8px 24px rgba(0,0,0,0.12)',
  },
  press: {
    pressedScale: 0.97,
    pressedScaleWeb: 0.98,
    pressedOpacity: 0.9,
    pressInDuration: 80,
    reactWithin: 100,
  },
  motion: {
    pressIn: 80,
    contentFade: 180,
    sheetsSpring: 280,
    maxDuration: 350,
  },
} as const;

export const colors = tokens.colors;
export const categories = tokens.categories;
export const typography = tokens.typography;
export const radius = tokens.radius;
export const orangeCorner = tokens.orangeCorner;
export const spacing = tokens.spacing;
export const shadows = tokens.shadows;
export const press = tokens.press;
export const motion = tokens.motion;

export type Tokens = typeof tokens;
