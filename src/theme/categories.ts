/**
 * Category presentation. The category *data* (id, name, icon key, color_key)
 * lives in the Supabase `categories` table and is fetched on launch — this
 * file only maps DB strings to things that can't live in a DB:
 *
 *   icon (text)      → phosphor icon component   (ICON_MAP)
 *   color_key (text) → accent/background pair    (CATEGORY_COLOR_PALETTE)
 *
 * Icons are phosphor-react-native components rendered at weight="duotone"
 * (see IconContext default in App). Named imports keep this tree-shakeable:
 * Metro only bundles the icons referenced here, not the entire phosphor set.
 * Do NOT switch to `import * as Icons`.
 */
import {
  CoffeeIcon, ForkKnifeIcon, ShoppingCartIcon, BusIcon, ShoppingBagIcon, FilmSlateIcon,
  ReceiptIcon, HeartbeatIcon, HouseIcon, AirplaneIcon, ArrowsClockwiseIcon,
  GraduationCapIcon, BarbellIcon, SparkleIcon, GiftIcon, GasPumpIcon, TagIcon, ConfettiIcon,
} from 'phosphor-react-native';
// ── icon key (categories.icon) → component ──────────────────────────────────
export const ICON_MAP = {
  'coffee':           CoffeeIcon,
  'fork-knife':       ForkKnifeIcon,
  'shopping-cart':    ShoppingCartIcon,
  'bus':              BusIcon,
  'confetti':         ConfettiIcon,
  'shopping-bag':     ShoppingBagIcon,
  'film-slate':       FilmSlateIcon,
  'receipt':          ReceiptIcon,
  'heartbeat':        HeartbeatIcon,
  'house':            HouseIcon,
  'airplane':         AirplaneIcon,
  'arrows-clockwise': ArrowsClockwiseIcon,
  'graduation-cap':   GraduationCapIcon,
  'barbell':          BarbellIcon,
  'sparkle':          SparkleIcon,
  'gift':             GiftIcon,
  'gas-pump':         GasPumpIcon,
  'tag':              TagIcon,
} as const;

/** Unknown/missing icon keys render the tag glyph (also the custom default). */
export function iconFor(key: string | undefined) {
  return ICON_MAP[key as keyof typeof ICON_MAP] ?? TagIcon;
}

// ── color_key (categories.color_key) → accent/background pair ───────────────
export const CATEGORY_COLOR_PALETTE = {
  // pickable in the New Category modal
  blue:       { label: 'Blue',       accent: '#3B82F6', bg: '#EAF2FE' },
  ochre:      { label: 'Ochre',      accent: '#A16207', bg: '#F5EFE3' },
  green:      { label: 'Green',      accent: '#16A34A', bg: '#EAF6EE' },
  terracotta: { label: 'Terracotta', accent: '#C2410C', bg: '#FBEEE8' },
  indigo:     { label: 'Indigo',     accent: '#6366F1', bg: '#EEEEFC' },
  gray:       { label: 'Gray',       accent: '#6B7280', bg: '#F1F1F2' },
  // seeded-category pairs (categories.color_key on the seeded rows)
  forest:     { label: 'Forest',     accent: '#2F6B4F', bg: '#E3F0E9' },
  rust:       { label: 'Rust',       accent: '#C9622B', bg: '#FDEBE3' },
  olive:      { label: 'Olive',      accent: '#5C8A3A', bg: '#EAF3E0' },
  periwinkle: { label: 'Periwinkle', accent: '#4A5AC9', bg: '#E4E8FB' },
  mustard:    { label: 'Mustard',    accent: '#B8942E', bg: '#FBF6E4' },
  magenta:    { label: 'Magenta',    accent: '#C43D8D', bg: '#FBEAF3' },
  violet:     { label: 'Violet',     accent: '#8B3FC4', bg: '#F3E8FB' },
  amber:      { label: 'Amber',      accent: '#B8862E', bg: '#FBF3E4' },
  crimson:    { label: 'Crimson',    accent: '#C4374F', bg: '#FCE4E7' },
  teal:       { label: 'Teal',       accent: '#2E8A8A', bg: '#E4F3F3' },
  azure:      { label: 'Azure',      accent: '#2E6BB8', bg: '#E4EEFB' },
  purple:     { label: 'Purple',     accent: '#6B3FC4', bg: '#EDE4FB' },
  emerald:    { label: 'Emerald',    accent: '#2E8A5C', bg: '#E4F3EA' },
  brick:      { label: 'Brick',      accent: '#C4573F', bg: '#FBE9E4' },
  pink:       { label: 'Pink',       accent: '#C43F8A', bg: '#FBE4F0' },
  orange:     { label: 'Orange',     accent: '#C47A2E', bg: '#FBEFE4' },
  slate:      { label: 'Slate',      accent: '#4A4A8A', bg: '#EAEAF3' },
} as const;

export type ColorKey = keyof typeof CATEGORY_COLOR_PALETTE;

/** The six swatches offered when creating a category. */
export const COLOR_KEYS: ColorKey[] = [
  'blue', 'ochre', 'green', 'terracotta', 'indigo', 'gray',
];

export function paletteFor(key: string | undefined) {
  return CATEGORY_COLOR_PALETTE[key as ColorKey] ?? CATEGORY_COLOR_PALETTE.gray;
}

// Fixed display order for the 17 seeded categories (their DB rows share one
// created_at from the single seed insert, so creation-order sort can't
// distinguish them). Custom categories sort after these by created_at.
export const SEEDED_ORDER = [
  'coffee', 'food', 'groceries', 'transit', 'fun', 'shopping', 'entertainment',
  'bills', 'health', 'rent', 'travel', 'subscriptions', 'education', 'fitness',
  'personalCare', 'gifts', 'fuel',
];
