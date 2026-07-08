import { CURRENCIES } from '../store/types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Human label for a day offset (0 = today). "Today"/"Yesterday" for the two
 * most recent days, otherwise the actual date ("6 Jul", or "6 Jul 2025" when
 * the year differs). Works for any offset, so the stepper can go infinitely
 * back and API-sourced dates render correctly.
 */
export function dayOffsetLabel(offset: number): string {
  if (offset <= 0) return 'Today';
  if (offset === 1) return 'Yesterday';
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear()
    ? base
    : `${base} ${d.getFullYear()}`;
}

export function currencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? '₹';
}

/** "₹4.50" */
export function money(amount: number, code = 'INR'): string {
  return currencySymbol(code) + amount.toFixed(2);
}

/** Splits into a bold whole part and a smaller cents part: {whole:"₹16", cents:"50"} */
export function splitMoney(
  amount: number,
  code = 'INR',
): { whole: string; cents: string } {
  const [whole, cents] = amount.toFixed(2).split('.');
  return { whole: currencySymbol(code) + whole, cents };
}
