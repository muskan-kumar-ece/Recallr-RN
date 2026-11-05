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
        text: tokens.colors.text,
        textSecondary: tokens.colors.textSecondary,
        textMuted: tokens.colors.textMuted,
        accent: tokens.colors.accent,
        accentTint: tokens.colors.accentTint,
        accentTintSoft: tokens.colors.accentTintSoft,
        accentDark: tokens.colors.accentDark,
        danger: tokens.colors.danger,
        dangerTint: tokens.colors.dangerTint,
        success: tokens.colors.success,
        fill: tokens.colors.fill,
        toastBg: tokens.colors.toastBg,
      },
      borderRadius: {
        card: `${tokens.radius.card}px`,
        sheet: `${tokens.radius.sheet}px`,
        chip: `${tokens.radius.chip}px`,
        button: `${tokens.radius.button}px`,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
