export const Colors = {
  background: '#F8F7F4',
  card: '#FFFFFF',
  text: '#2B2B2B',
  secondary: '#6B6B66',
  muted: '#8A8A85',
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  divider: '#E3E0D9',
  
  // Orange Accent & Tint
  accent: '#E8641B',
  accentLight: '#FDEBDD',
  accentDark: '#C24E0E',
  accentPressed: '#D05615',
  
  // Semantic Colors
  danger: '#D9483B',
  dangerLight: '#FDECEA',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  
  // Chip & Badge
  chipBg: '#FFFFFF',
  chipActiveBg: '#2B2B2B',
  chipActiveText: '#FFFFFF',
  chipBorder: 'rgba(0, 0, 0, 0.1)',
};

export const Radius = {
  sm: 8,
  md: 12,
  card: 16,
  xl: 20,
  xxl: 28,
  cornerCut: 40, // Signature orange curved corner
  pill: 50,
  full: 9999,
};

export const Typography = {
  fontFamily: 'Inter',
  sizes: {
    xs: 11,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Layout = {
  gutter: 16,
  btnHeight: 50,
  inputHeight: 48,
  cardBorderWidth: 0.5,
};
