import { create } from 'zustand';
import {
  BASE_CATEGORIES,
  CategoryDef,
  NEW_CATEGORY_COLOR_POOL,
} from '../theme/tokens';
import { Expense, ExpenseDraft } from './types';

/**
 * Raw client-side data container. This is the ONLY place that owns expense
 * state. UI never touches it directly — it goes through `useExpenses()`, so a
 * real API/persistence layer can replace the internals here (or the hook)
 * without any screen change.
 */
interface ExpenseState {
  entries: Expense[];
  customCategories: CategoryDef[];
  currency: string;
  darkMode: boolean;
  nextId: number;

  addEntry: (draft: ExpenseDraft) => Expense;
  updateEntry: (id: number, draft: ExpenseDraft) => void;
  removeEntry: (id: number) => void;
  addCategory: (label: string) => CategoryDef;
  setCurrency: (code: string) => void;
  toggleDarkMode: () => void;
}

const SEED: Expense[] = [
  { id: 1, label: 'Coffee', categoryId: 'coffee', amount: 4.5, dayOffset: 0 },
  { id: 2, label: 'Lunch', categoryId: 'food', amount: 12.0, dayOffset: 0 },
  { id: 3, label: 'Transit', categoryId: 'transit', amount: 2.75, dayOffset: 1 },
];

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  entries: SEED,
  customCategories: [],
  currency: 'USD',
  darkMode: false,
  nextId: 4,

  addEntry: draft => {
    const id = get().nextId;
    const entry: Expense = { id, ...draft };
    set(s => ({ entries: [...s.entries, entry], nextId: s.nextId + 1 }));
    return entry;
  },

  updateEntry: (id, draft) =>
    set(s => ({
      entries: s.entries.map(e => (e.id === id ? { ...e, ...draft } : e)),
    })),

  removeEntry: id =>
    set(s => ({ entries: s.entries.filter(e => e.id !== id) })),

  addCategory: label => {
    const { customCategories } = get();
    const color =
      NEW_CATEGORY_COLOR_POOL[
        customCategories.length % NEW_CATEGORY_COLOR_POOL.length
      ];
    const cat: CategoryDef = {
      id: 'custom-' + Date.now(),
      label,
      color,
      border: color + '40',
      custom: true,
    };
    set(s => ({ customCategories: [...s.customCategories, cat] }));
    return cat;
  },

  setCurrency: code => set({ currency: code }),
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
}));

/** All categories (built-in + user-created). */
export function selectAllCategories(s: ExpenseState): CategoryDef[] {
  return [...BASE_CATEGORIES, ...s.customCategories];
}
