import { useCallback, useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { DATE_LABELS, Expense, ExpenseDraft } from '../store/types';
import {
  BASE_CATEGORIES,
  BUILTIN_ICON_IDS,
  CategoryDef,
  CategoryId,
  categoryTint,
} from '../theme/tokens';
import { money } from '../lib/format';

/**
 * Flip to `true` to exercise the Add-Expense sheet's failure path
 * (shake + inline error). This is the single stubbed seam that a real
 * network call would replace.
 */
const FORCE_SUBMIT_FAILURE = false;
const NETWORK_LATENCY_MS = 280;

function fakeNetwork<T>(result: T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (FORCE_SUBMIT_FAILURE) {
        reject(new Error('Network request failed'));
      } else {
        resolve(result);
      }
    }, NETWORK_LATENCY_MS);
  });
}

export interface DisplayExpense {
  id: number;
  label: string;
  color: string;
  tint: string;
  iconId: string; // one of BUILTIN_ICON_IDS or 'custom'
  amountLabel: string;
  categoryId: CategoryId;
  amount: number;
  dayOffset: number;
}

export interface DayGroup {
  offset: number;
  label: string;
  entries: DisplayExpense[];
}

/**
 * The single data-access facade for the UI. Screens/components consume only
 * this hook — never the store — so the persistence/transport layer can be
 * swapped (REST, GraphQL, SQLite…) without touching a single component.
 */
export function useExpenses() {
  const entries = useExpenseStore(s => s.entries);
  const currency = useExpenseStore(s => s.currency);
  const dark = useExpenseStore(s => s.darkMode);
  const customCategories = useExpenseStore(s => s.customCategories);

  const addEntry = useExpenseStore(s => s.addEntry);
  const updateEntry = useExpenseStore(s => s.updateEntry);
  const removeEntry = useExpenseStore(s => s.removeEntry);
  const addCategoryAction = useExpenseStore(s => s.addCategory);

  const categories: CategoryDef[] = useMemo(
    () => [...BASE_CATEGORIES, ...customCategories],
    [customCategories],
  );

  const categoryById = useCallback(
    (id: CategoryId) => categories.find(c => c.id === id) ?? categories[0],
    [categories],
  );

  const monthTotal = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, 0),
    [entries],
  );
  const todayTotal = useMemo(
    () =>
      entries
        .filter(e => e.dayOffset === 0)
        .reduce((sum, e) => sum + e.amount, 0),
    [entries],
  );

  const dayGroups: DayGroup[] = useMemo(() => {
    const map = new Map<number, DayGroup>();
    entries.forEach(e => {
      const label = DATE_LABELS[e.dayOffset] ?? `${e.dayOffset} days ago`;
      if (!map.has(e.dayOffset)) {
        map.set(e.dayOffset, { offset: e.dayOffset, label, entries: [] });
      }
      const cat = categoryById(e.categoryId);
      const iconId = (BUILTIN_ICON_IDS as readonly string[]).includes(
        e.categoryId as string,
      )
        ? (e.categoryId as string)
        : 'custom';
      map.get(e.dayOffset)!.entries.push({
        id: e.id,
        label: e.label,
        color: cat.color,
        tint: categoryTint(cat.color, dark),
        iconId,
        amountLabel: money(e.amount, currency),
        categoryId: e.categoryId,
        amount: e.amount,
        dayOffset: e.dayOffset,
      });
    });
    return [...map.values()].sort((a, b) => a.offset - b.offset);
  }, [entries, categoryById, currency, dark]);

  // ── Async mutators (the swappable transport seam) ─────────────────────────
  const addExpense = useCallback(
    async (draft: ExpenseDraft): Promise<Expense> => {
      const created = addEntry(draft);
      // Optimistic: entry is already in the store; await the "network" ack.
      try {
        return await fakeNetwork(created);
      } catch (err) {
        removeEntry(created.id); // roll back on failure
        throw err;
      }
    },
    [addEntry, removeEntry],
  );

  const updateExpense = useCallback(
    async (id: number, draft: ExpenseDraft): Promise<void> => {
      await fakeNetwork(null);
      updateEntry(id, draft);
    },
    [updateEntry],
  );

  const deleteExpense = useCallback(
    (id: number) => removeEntry(id),
    [removeEntry],
  );

  const addCategory = useCallback(
    (label: string) => addCategoryAction(label),
    [addCategoryAction],
  );

  return {
    entries,
    categories,
    categoryById,
    dayGroups,
    monthTotal,
    todayTotal,
    currency,
    isEmpty: entries.length === 0,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
  };
}
