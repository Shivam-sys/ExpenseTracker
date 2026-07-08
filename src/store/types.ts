import { CategoryId } from '../theme/tokens';

export interface Expense {
  id: number;
  label: string;
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
  label: string;
  categoryId: CategoryId;
  amount: number;
  dayOffset: number;
}
