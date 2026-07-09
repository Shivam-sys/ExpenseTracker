import { CategoryId } from '../theme/tokens';

export interface Expense {
  id: number;
  /** optional user note (the `name` column in Supabase), '' when blank */
  note: string;
  categoryId: CategoryId;
  amount: number;
  /** 0 = today, 1 = yesterday, 2 = two days ago … */
  dayOffset: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
];

/** Draft payload the Add/Edit sheet submits back to the data layer. */
export interface ExpenseDraft {
  note: string;
  categoryId: CategoryId;
  amount: number;
  dayOffset: number;
}

/** Max lengths enforced client-side; mirrored by DB constraints. */
export const NOTE_MAX_LENGTH = 100;
export const CATEGORY_NAME_MAX_LENGTH = 20;
