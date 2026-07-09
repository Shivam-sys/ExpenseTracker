/**
 * Design tokens ported 1:1 from the Claude Design handoff
 * (`Expense Tracker - Bottom Sheet.dc.html`). Colours, category palette,
 * radii and the shared easing curve all live here so screens never
 * hard-code a hex value.
 */
import { Easing } from 'react-native-reanimated';

// ── Brand / semantic constants ───────────────────────────────────────────────
export const BRAND = '#2f6f4f'; // primary accent — used app-wide
export const DELETE_RED = '#c94a3f'; // destructive only (delete)

// ── Category palette ─────────────────────────────────────────────────────────
export type CategoryId =
  | 'coffee'
  | 'food'
  | 'transit'
  | 'fun'
  | 'bills'
  | 'shopping'
  | string; // custom-* ids

export interface CategoryDef {
  id: CategoryId;
  label: string;
  color: string;
  border: string; // inactive border tint
  /** icon key from categories.icon, resolved via ICON_MAP */
  icon?: string;
  /** palette key from categories.color_key (see CATEGORY_COLOR_PALETTE) */
  colorKey?: string;
  custom?: boolean;
}

// ── Radii ────────────────────────────────────────────────────────────────────
export const RADIUS = { card: 14, pill: 999, sheet: 32 } as const;

// ── Motion ───────────────────────────────────────────────────────────────────
// One consistent easing curve across the whole app.
export const EASE = Easing.bezier(0.4, 0, 0.2, 1);
export const DURATIONS = {
  press: 100,
  release: 150,
  key: 150,
  pill: 120,
  bounce: 150,
  date: 180,
  done: 200,
  sheet: 280,
  pulse: 300,
  shake: 400,
} as const;

// Spring config used for gesture-driven snaps (swipe row, sheet drag).
export const SPRING = { damping: 20, stiffness: 220, mass: 0.7 } as const;

// ── Fonts ────────────────────────────────────────────────────────────────────
export type FontWeight = 400 | 500 | 600 | 700 | 800;
const FONT_BY_WEIGHT: Record<FontWeight, string> = {
  400: 'Poppins-Regular',
  500: 'Poppins-Medium',
  600: 'Poppins-SemiBold',
  700: 'Poppins-Bold',
  800: 'Poppins-ExtraBold',
};
export const font = (weight: FontWeight = 400) => FONT_BY_WEIGHT[weight];

// ── Theme ────────────────────────────────────────────────────────────────────
export interface Theme {
  dark: boolean;
  pageBg: string;
  cardBg: string;
  sheetBg: string;
  text: string;
  textMuted45: string;
  textMuted5: string;
  textMuted55: string;
  border: string;
  divider: string;
  keyBg: string;
  keyBgAlt: string;
  keyDisabledBg: string;
  keyDisabledColor: string;
  keyColor: string;
  inputBg: string;
  chipInactiveBg: string;
  scrollFadeTo: string;
  closeBtnBg: string;
  handleColor: string;
  avatarBg: string;
  dashedBorder: string;
  cardBorder: string;
  headerFrom: string;
  headerTo: string;
  deleteRowBg: string;
  overlayColor: string;
}

export function getTheme(dark: boolean): Theme {
  return dark
    ? {
        dark: true,
        pageBg: '#18191b',
        cardBg: '#232427',
        sheetBg: '#232427',
        text: '#f2f1ec',
        textMuted45: 'rgba(242,241,236,.45)',
        textMuted5: 'rgba(242,241,236,.5)',
        textMuted55: 'rgba(242,241,236,.55)',
        border: 'rgba(255,255,255,.09)',
        divider: 'rgba(255,255,255,.08)',
        keyBg: '#2b2c30',
        keyBgAlt: '#26272a',
        keyDisabledBg: '#232427',
        keyDisabledColor: 'rgba(242,241,236,.28)',
        keyColor: '#f2f1ec',
        inputBg: '#2a2b2f',
        chipInactiveBg: '#26272a',
        scrollFadeTo: '#232427',
        closeBtnBg: 'rgba(255,255,255,.08)',
        handleColor: 'rgba(255,255,255,.22)',
        avatarBg: '#3a3b3f',
        dashedBorder: 'rgba(255,255,255,.22)',
        cardBorder: 'rgba(255,255,255,.07)',
        headerFrom: '#132e24',
        headerTo: '#1f4d3a',
        deleteRowBg: '#2a2222',
        overlayColor: 'rgba(0,0,0,.55)',
      }
    : {
        dark: false,
        pageBg: '#f8f5ef',
        cardBg: '#fffefb',
        sheetBg: '#fffdf9',
        text: '#1c1c1a',
        textMuted45: 'rgba(28,28,26,.45)',
        textMuted5: 'rgba(28,28,26,.5)',
        textMuted55: 'rgba(28,28,26,.55)',
        border: 'rgba(28,28,26,.08)',
        divider: 'rgba(28,28,26,.06)',
        keyBg: '#f7f4ee',
        keyBgAlt: '#f2efe8',
        keyDisabledBg: '#f8f6f1',
        keyDisabledColor: 'rgba(28,28,26,.28)',
        keyColor: '#1c1c1a',
        inputBg: '#ffffff',
        chipInactiveBg: '#fffefb',
        scrollFadeTo: '#fffdf9',
        closeBtnBg: 'rgba(28,28,26,.06)',
        handleColor: 'rgba(28,28,26,.18)',
        avatarBg: '#1c1c1a',
        dashedBorder: 'rgba(28,28,26,.3)',
        cardBorder: 'rgba(28,20,10,.07)',
        headerFrom: '#1a4534',
        headerTo: '#2c6a4f',
        deleteRowBg: '#faf5f4',
        overlayColor: 'rgba(20,18,15,.35)',
      };
}

// ── Colour helpers ───────────────────────────────────────────────────────────
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Soft background tint behind a category icon, theme-aware. */
export function categoryTint(color: string, dark: boolean): string {
  return hexToRgba(color, dark ? 0.22 : 0.12);
}

export const SPARK_BARS = [26, 40, 32, 55, 44, 62, 50, 70, 58, 46, 64, 38];
