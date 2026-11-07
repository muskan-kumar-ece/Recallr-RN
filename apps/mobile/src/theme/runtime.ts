import { StyleSheet } from 'react-native';
import { categories, colors } from '@recallr/tokens';

export type AccentTheme = 'orange' | 'indigo' | 'teal' | 'pink' | 'slate';

interface AccentPalette {
  accent: string;
  accentTint: string;
  accentTintSoft: string;
  accentDark: string;
  accentPressed: string;
  toastAction: string;
  bannerBg: string;
  bannerText: string;
}

const palettes: Record<AccentTheme, AccentPalette> = {
  orange: { accent: categories.orange, accentTint: '#FDEBDD', accentTintSoft: '#FFF9F4', accentDark: '#B84A10', accentPressed: '#D05615', toastAction: '#FFB27F', bannerBg: '#FDEBDD', bannerText: '#8A3A0C' },
  indigo: { accent: categories.indigo, accentTint: '#E6E8FB', accentTintSoft: '#F7F7FF', accentDark: '#353D9B', accentPressed: '#3F49BE', toastAction: '#A9AEFF', bannerBg: '#E6E8FB', bannerText: '#353D9B' },
  teal: { accent: categories.teal, accentTint: '#DCF3EC', accentTintSoft: '#F5FCF9', accentDark: '#137052', accentPressed: '#178663', toastAction: '#8CE0C4', bannerBg: '#DCF3EC', bannerText: '#137052' },
  pink: { accent: categories.pink, accentTint: '#FAE5ED', accentTintSoft: '#FFF7FA', accentDark: '#993056', accentPressed: '#B83F69', toastAction: '#FFA8C6', bannerBg: '#FAE5ED', bannerText: '#993056' },
  slate: { accent: categories.slate, accentTint: '#EAEAE8', accentTintSoft: '#F8F8F7', accentDark: '#30302E', accentPressed: '#383835', toastAction: '#C7C7C3', bannerBg: '#EAEAE8', bannerText: '#30302E' },
};

interface StyleRecord {
  node: Record<string, unknown>;
  original: Map<string, unknown>;
}

const registeredStyles: StyleRecord[] = [];
const sourceColorRole = new Map<string, keyof AccentPalette>([
  [colors.accent, 'accent'],
  [colors.accentTint, 'accentTint'],
  [colors.accentTintSoft, 'accentTintSoft'],
  [colors.accentDark, 'accentDark'],
  [colors.accentPressed, 'accentPressed'],
  [colors.toastAction, 'toastAction'],
  [colors.bannerBg, 'bannerBg'],
  [colors.bannerText, 'bannerText'],
]);

function registerStyleNode(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(registerStyleNode);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const node = value as Record<string, unknown>;
  const original = new Map<string, unknown>();
  for (const [key, child] of Object.entries(node)) {
    original.set(key, child);
    registerStyleNode(child);
  }
  registeredStyles.push({ node, original });
}

function recolorStyles(palette: AccentPalette): void {
  for (const { node, original } of registeredStyles) {
    for (const [key, value] of original) {
      const role = typeof value === 'string' ? sourceColorRole.get(value) : undefined;
      node[key] = role ? palette[role] : value;
    }
  }
}

const mutableStyleSheet = StyleSheet as unknown as {
  create: (styles: Record<string, object>) => Record<string, object>;
};
const originalCreate = mutableStyleSheet.create.bind(StyleSheet);
mutableStyleSheet.create = (styles) => {
  const created = originalCreate(styles);
  registerStyleNode(created);
  return created;
};

export function setNativeAccentTheme(theme: AccentTheme): void {
  const palette = palettes[theme] || palettes.orange;
  Object.assign(colors as unknown as Record<string, string>, palette);
  recolorStyles(palette);
}
