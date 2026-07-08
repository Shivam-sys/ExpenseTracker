/**
 * Category presentation map — the single source of truth for a category's
 * icon + colour treatment. Icons are phosphor-react-native components rendered
 * at weight="duotone" (see IconContext default in App). Named imports keep this
 * tree-shakeable: Metro only bundles the ~18 icons referenced here, not the
 * entire phosphor set. Do NOT switch to `import * as Icons`.
 */
import {
  CoffeeIcon, ForkKnifeIcon, ShoppingCartIcon, BusIcon, ShoppingBagIcon, FilmSlateIcon,
  ReceiptIcon, HeartbeatIcon, HouseIcon, AirplaneIcon, ArrowsClockwiseIcon,
  GraduationCapIcon, BarbellIcon, SparkleIcon, GiftIcon, GasPumpIcon, TagIcon, ConfettiIcon,
} from 'phosphor-react-native';
import { CategoryDef, hexToRgba } from './tokens';

export const CATEGORY_MAP = {
  coffee:        { label: 'Coffee',         icon: CoffeeIcon,        bg: '#E3F0E9', iconColor: '#2F6B4F' },
  food:          { label: 'Food & Dining',  icon: ForkKnifeIcon,     bg: '#FDEBE3', iconColor: '#C9622B' },
  groceries:     { label: 'Groceries',      icon: ShoppingCartIcon,  bg: '#EAF3E0', iconColor: '#5C8A3A' },
  transit:       { label: 'Transit',        icon: BusIcon,           bg: '#E4E8FB', iconColor: '#4A5AC9' },
  fun:           { label: 'Fun',            icon: ConfettiIcon,      bg: '#FBF6E4', iconColor: '#B8942E' },
  shopping:      { label: 'Shopping',       icon: ShoppingBagIcon,   bg: '#FBEAF3', iconColor: '#C43D8D' },
  entertainment: { label: 'Entertainment',  icon: FilmSlateIcon,     bg: '#F3E8FB', iconColor: '#8B3FC4' },
  bills:         { label: 'Bills',          icon: ReceiptIcon,       bg: '#FBF3E4', iconColor: '#B8862E' },
  health:        { label: 'Health',         icon: HeartbeatIcon,     bg: '#FCE4E7', iconColor: '#C4374F' },
  rent:          { label: 'Rent',           icon: HouseIcon,         bg: '#E4F3F3', iconColor: '#2E8A8A' },
  travel:        { label: 'Travel',         icon: AirplaneIcon,      bg: '#E4EEFB', iconColor: '#2E6BB8' },
  subscriptions: { label: 'Subscriptions',  icon: ArrowsClockwiseIcon, bg: '#EDE4FB', iconColor: '#6B3FC4' },
  education:     { label: 'Education',      icon: GraduationCapIcon, bg: '#E4F3EA', iconColor: '#2E8A5C' },
  fitness:       { label: 'Fitness',        icon: BarbellIcon,       bg: '#FBE9E4', iconColor: '#C4573F' },
  personalCare:  { label: 'Personal Care',  icon: SparkleIcon,       bg: '#FBE4F0', iconColor: '#C43F8A' },
  gifts:         { label: 'Gifts',          icon: GiftIcon,          bg: '#FBEFE4', iconColor: '#C47A2E' },
  fuel:          { label: 'Fuel & Auto',    icon: GasPumpIcon,       bg: '#EAEAF3', iconColor: '#4A4A8A' },
} as const;

export type CategoryKey = keyof typeof CATEGORY_MAP;

export const DEFAULT_CATEGORY = {
  label: 'Other',
  icon: TagIcon,
  bg: '#EDEDED',
  iconColor: '#6B6B6B',
};

// Lookup helper — falls back to DEFAULT_CATEGORY for any user-added
// category key not present in CATEGORY_MAP (e.g. custom categories
// created via the "add category" flow in the Add Expense sheet)
export function getCategoryConfig(key: string) {
  return CATEGORY_MAP[key as CategoryKey] ?? DEFAULT_CATEGORY;
}

/**
 * The built-in categories as pill definitions, derived straight from
 * CATEGORY_MAP so the picker offers every category (not a hand-picked
 * subset). `color`/`border` drive the pill's active fill + outline; the
 * glyph itself comes from getCategoryConfig() at render time.
 */
export const CATEGORY_LIST: CategoryDef[] = (
  Object.keys(CATEGORY_MAP) as CategoryKey[]
).map(id => ({
  id,
  label: CATEGORY_MAP[id].label,
  color: CATEGORY_MAP[id].iconColor,
  border: hexToRgba(CATEGORY_MAP[id].iconColor, 0.25),
}));
