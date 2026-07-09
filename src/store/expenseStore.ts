import { Appearance } from 'react-native';
import { create } from 'zustand';
import { CategoryDef } from '../theme/tokens';
import { Expense } from './types';

/**
 * Client-side state container. Expense rows mirror the Supabase `expenses`
 * table (ids are server-assigned); mutations happen in useExpenses(), which
 * owns the network calls — the store just holds state so this file stays
 * transport-agnostic.
 */
interface ExpenseState {
  entries: Expense[];
  /** true while the initial GET is in flight */
  isLoading: boolean;
  /** the initial GET has completed at least once (success or failure) */
  hasLoaded: boolean;
  /** last initial GET failed — list shows retry affordance */
  loadFailed: boolean;
  /** last request failed like a network drop — shows the offline pill */
  offline: boolean;
  /** label of an entry re-inserted after a failed DELETE (drives the toast) */
  restoredLabel: string | null;

  /** full category list from Supabase (seeded + custom); empty until the
   *  first fetch resolves — this app is online-first, no local fallback */
  categories: CategoryDef[];
  currency: string;
  darkMode: boolean;

  setEntries: (entries: Expense[]) => void;
  insertEntry: (entry: Expense) => void;
  replaceEntry: (id: number, entry: Expense) => void;
  removeEntry: (id: number) => void;
  setLoading: (v: boolean) => void;
  setLoadResult: (ok: boolean) => void;
  setOffline: (v: boolean) => void;
  setRestoredLabel: (label: string | null) => void;

  setCategories: (cats: CategoryDef[]) => void;
  insertCategory: (cat: CategoryDef) => void;
  setCurrency: (code: string) => void;
  toggleDarkMode: () => void;
}

export const useExpenseStore = create<ExpenseState>(set => ({
  entries: [],
  isLoading: false,
  hasLoaded: false,
  loadFailed: false,
  offline: false,
  restoredLabel: null,

  categories: [],
  currency: 'INR',
  darkMode: Appearance.getColorScheme() === 'dark',

  setEntries: entries => set({ entries }),
  insertEntry: entry => set(s => ({ entries: [...s.entries, entry] })),
  replaceEntry: (id, entry) =>
    set(s => ({ entries: s.entries.map(e => (e.id === id ? entry : e)) })),
  removeEntry: id =>
    set(s => ({ entries: s.entries.filter(e => e.id !== id) })),
  setLoading: v => set({ isLoading: v }),
  setLoadResult: ok => set({ hasLoaded: true, loadFailed: !ok }),
  setOffline: v => set({ offline: v }),
  setRestoredLabel: label => set({ restoredLabel: label }),

  setCategories: cats => set({ categories: cats }),
  insertCategory: cat =>
    set(s => ({ categories: [...s.categories, cat] })),

  setCurrency: code => set({ currency: code }),
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
}));
