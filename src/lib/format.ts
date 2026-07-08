import { CURRENCIES } from '../store/types';

export function currencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? '$';
}

/** "$4.50" */
export function money(amount: number, code = 'USD'): string {
  return currencySymbol(code) + amount.toFixed(2);
}

/** Splits into a bold whole part and a smaller cents part: {whole:"$16", cents:"50"} */
export function splitMoney(
  amount: number,
  code = 'USD',
): { whole: string; cents: string } {
  const [whole, cents] = amount.toFixed(2).split('.');
  return { whole: currencySymbol(code) + whole, cents };
}
