import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { Expense, ExpenseDraft } from '../store/types';
import { CategoryDef, CategoryId, categoryTint, hexToRgba } from '../theme/tokens';
import { paletteFor } from '../theme/categories';
import { dayOffsetLabel, money } from '../lib/format';
import {
  createExpense,
  deleteExpenseRow,
  isNetworkError,
  listExpenses,
  patchExpense,
} from '../api/expensesApi';
import {
  createCategory,
  isDuplicateError,
  listCategories,
} from '../api/categoriesApi';

const RESTORED_TOAST_MS = 2500;

/**
 * Safe stand-in for a category that hasn't loaded yet (categories starts
 * empty; the fetch lands a beat after first render) or was deleted server-side.
 */
const UNKNOWN_CATEGORY: CategoryDef = {
  id: '',
  label: 'Uncategorized',
  color: '#6B7280',
  border: 'rgba(107,114,128,0.25)',
  icon: 'tag',
};

/** Thrown by addCategory when the server rejects a duplicate name. */
export class DuplicateCategoryError extends Error {}

export interface DisplayExpense {
  id: number;
  /** primary row text — the category name */
  label: string;
  /** secondary row text — the user's note, '' when blank */
  note: string;
  /** icon key from the category row, resolved via iconFor() */
  icon?: string;
  color: string;
  tint: string;
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
 * this hook — never the store or fetch directly — so the transport
 * (currently Supabase REST) can be swapped without touching a component.
 *
 * Public surface is unchanged from the local-only version:
 * addExpense / updateExpense / deleteExpense / dayGroups / totals, plus
 * isLoading / loadFailed / isOffline / restoredLabel / retryLoad for the
 * new status UI.
 */
export function useExpenses() {
  const entries = useExpenseStore(s => s.entries);
  const currency = useExpenseStore(s => s.currency);
  const dark = useExpenseStore(s => s.darkMode);
  const categories = useExpenseStore(s => s.categories);
  const isLoading = useExpenseStore(s => s.isLoading);
  const hasLoaded = useExpenseStore(s => s.hasLoaded);
  const loadFailed = useExpenseStore(s => s.loadFailed);
  const isOffline = useExpenseStore(s => s.offline);
  const restoredLabel = useExpenseStore(s => s.restoredLabel);

  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Flag network-shaped failures for the offline pill; clear it on success. */
  const noteResult = useCallback((err?: unknown) => {
    const store = useExpenseStore.getState();
    if (err === undefined) {
      if (store.offline) store.setOffline(false);
    } else {
      console.error('[expenses] request failed:', err);
      if (isNetworkError(err)) store.setOffline(true);
    }
  }, []);

  // ── initial load (GET) — once per app launch ─────────────────────────────
  const load = useCallback(async () => {
    const store = useExpenseStore.getState();
    store.setLoading(true);
    // the category list loads alongside expenses; on failure the store keeps
    // its current list (the code-derived fallback on a cold start), so a
    // categories outage never blocks the expense flow
    listCategories()
      .then(cats => useExpenseStore.getState().setCategories(cats))
      .catch(err => console.warn('[categories] load failed:', err));
    try {
      const rows = await listExpenses();
      store.setEntries(rows);
      store.setLoadResult(true);
      noteResult();
    } catch (err) {
      // keep last-known-good entries visible; just surface the failure
      store.setLoadResult(false);
      noteResult(err);
    } finally {
      store.setLoading(false);
    }
  }, [noteResult]);

  useEffect(() => {
    const store = useExpenseStore.getState();
    if (!store.hasLoaded && !store.isLoading) {
      load();
    }
  }, [load]);

  // ── derived data ──────────────────────────────────────────────────────────
  const categoryById = useCallback(
    (id: CategoryId) => categories.find(c => c.id === id) ?? UNKNOWN_CATEGORY,
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
      const label = dayOffsetLabel(e.dayOffset);
      if (!map.has(e.dayOffset)) {
        map.set(e.dayOffset, { offset: e.dayOffset, label, entries: [] });
      }
      const cat = categoryById(e.categoryId);
      map.get(e.dayOffset)!.entries.push({
        id: e.id,
        label: cat.label,
        note: e.note,
        icon: cat.icon,
        color: cat.color,
        tint: categoryTint(cat.color, dark),
        amountLabel: money(e.amount, currency),
        categoryId: e.categoryId,
        amount: e.amount,
        dayOffset: e.dayOffset,
      });
    });
    return [...map.values()].sort((a, b) => a.offset - b.offset);
  }, [entries, categoryById, currency, dark]);

  // ── mutations ─────────────────────────────────────────────────────────────
  /**
   * POST. Nothing is inserted locally until the server confirms — the
   * returned row (server id + created_at) is the source of truth. Throws on
   * failure so the sheet can shake and stay open.
   */
  const addExpense = useCallback(
    async (draft: ExpenseDraft): Promise<Expense> => {
      try {
        const created = await createExpense(draft);
        useExpenseStore.getState().insertEntry(created);
        noteResult();
        return created;
      } catch (err) {
        noteResult(err);
        throw err;
      }
    },
    [noteResult],
  );

  /**
   * PATCH. The sheet keeps showing the draft until this resolves, so there is
   * no optimistic local change to revert — on failure we throw (shake) and
   * the stored entry is untouched.
   */
  const updateExpense = useCallback(
    async (id: number, draft: ExpenseDraft): Promise<void> => {
      try {
        const updated = await patchExpense(id, draft);
        useExpenseStore.getState().replaceEntry(id, updated);
        noteResult();
      } catch (err) {
        noteResult(err);
        throw err;
      }
    },
    [noteResult],
  );

  /**
   * DELETE, optimistic: the row leaves the list immediately so the swipe
   * animation completes instantly; on failure the buffered entry is
   * re-inserted and a "restored" toast is shown.
   */
  const deleteExpense = useCallback(
    (id: number) => {
      const store = useExpenseStore.getState();
      const buffered = store.entries.find(e => e.id === id);
      if (!buffered) return;
      store.removeEntry(id);
      deleteExpenseRow(id)
        .then(() => noteResult())
        .catch(err => {
          noteResult(err);
          const s = useExpenseStore.getState();
          s.insertEntry(buffered);
          s.setRestoredLabel(buffered.note || categoryById(buffered.categoryId).label);
          if (restoreTimer.current) clearTimeout(restoreTimer.current);
          restoreTimer.current = setTimeout(
            () => useExpenseStore.getState().setRestoredLabel(null),
            RESTORED_TOAST_MS,
          );
        });
    },
    [noteResult, categoryById],
  );

  /**
   * Creates a category on the server and inserts it into the pill row on
   * confirm (no refetch). A duplicate name (DB unique index) surfaces as
   * DuplicateCategoryError for the modal's inline error; any other failure
   * (offline, categories table missing) falls back to a local-only category
   * so the flow still works — it just won't survive a reinstall.
   */
  const addCategory = useCallback(
    async (name: string, colorKey: string): Promise<CategoryDef> => {
      const store = useExpenseStore.getState();
      try {
        const created = await createCategory(name, colorKey);
        store.insertCategory(created);
        noteResult();
        return created;
      } catch (err) {
        if (isDuplicateError(err)) {
          throw new DuplicateCategoryError(name);
        }
        noteResult(err);
        const palette = paletteFor(colorKey);
        const local: CategoryDef = {
          id: 'custom-local-' + Date.now(),
          label: name,
          color: palette.accent,
          border: hexToRgba(palette.accent, 0.25),
          icon: 'tag',
          colorKey,
          custom: true,
        };
        store.insertCategory(local);
        return local;
      }
    },
    [noteResult],
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
    isLoading,
    hasLoaded,
    loadFailed,
    isOffline,
    restoredLabel,
    retryLoad: load,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
  };
}
