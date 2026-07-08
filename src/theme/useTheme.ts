import { useExpenseStore } from '../store/expenseStore';
import { getTheme, Theme } from './tokens';

/** Reads dark-mode from the store and returns the resolved theme tokens. */
export function useTheme(): Theme {
  const dark = useExpenseStore(s => s.darkMode);
  return getTheme(dark);
}
