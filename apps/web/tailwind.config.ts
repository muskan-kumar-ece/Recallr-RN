import type { Config } from 'tailwindcss';
import { tokens } from '@recallr/tokens';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: tokens.colors.bg,
        surface: tokens.colors.surface,
        border: tokens.colors.border,
        borderStrong: tokens.colors.borderStrong,
        divider: tokens.colors.divider,
        text: tokens.colors.text,
        textSecondary: tokens.colors.textSecondary,
        textMuted: tokens.colors.textMuted,
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        accentTint: 'rgb(var(--accent-tint-rgb) / <alpha-value>)',
        accentTintSoft: 'rgb(var(--accent-tint-soft-rgb) / <alpha-value>)',
        accentDark: 'rgb(var(--accent-dark-rgb) / <alpha-value>)',
        accentPressed: 'rgb(var(--accent-pressed-rgb) / <alpha-value>)',
        danger: tokens.colors.danger,
        dangerTint: tokens.colors.dangerTint,
        dangerSoft: tokens.colors.dangerSoft,
        success: tokens.colors.success,
        successTint: tokens.colors.successTint,
        fill: tokens.colors.fill,
        toastBg: tokens.colors.toastBg,
        toastAction: tokens.colors.toastAction,
        bannerBg: tokens.colors.bannerBg,
        bannerText: tokens.colors.bannerText,
        pressedRow: tokens.colors.pressedRow,
        inputCardFill: tokens.colors.inputCardFill,
        catOrange: tokens.categories.orange,
        catIndigo: tokens.categories.indigo,
        catTeal: tokens.categories.teal,
        catPink: tokens.categories.pink,
        catSlate: tokens.categories.slate,
      },
      borderRadius: {
        xs: `${tokens.radius.xs}px`,
        sm: `${tokens.radius.sm}px`,
        md: `${tokens.radius.md}px`,
        input: `${tokens.radius.input}px`,
        card: `${tokens.radius.card}px`,
        chip: `${tokens.radius.chip}px`,
        sheet: `${tokens.radius.sheet}px`,
        tabBar: `${tokens.radius.tabBar}px`,
        button: `${tokens.radius.button}px`,
        cornerLg: `${tokens.orangeCorner.lg.radius}px`,
        cornerMd: `${tokens.orangeCorner.md.radius}px`,
        cornerSm: `${tokens.orangeCorner.sm.radius}px`,
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: tokens.shadows.shadowCard,
        shadowCard: tokens.shadows.shadowCard,
        tabBar: tokens.shadows.shadowNav,
        shadowNav: tokens.shadows.shadowNav,
        raised: tokens.shadows.shadowAccent,
        shadowAccent: tokens.shadows.shadowAccent,
        soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
