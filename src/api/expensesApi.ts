/**
 * Thin fetch wrappers over the Supabase PostgREST `expenses` table.
 * This is the transport seam behind useExpenses() — no UI concepts here.
 *
 * Table: id (int8, auto) · created_at (timestamptz, auto) · name (text)
 *        amount (numeric) · category (text) · expense_date (date)
 */
import { SUPABASE_HEADERS, SUPABASE_URL } from '../config/supabase';
import { Expense, ExpenseDraft } from '../store/types';

const TABLE_URL = `${SUPABASE_URL}/rest/v1/expenses`;

/** Row shape as PostgREST returns it. */
interface ExpenseRow {
  id: number;
  created_at: string;
  name: string | null; // optional user note, surfaced in the UI as "note"
  amount: number | string; // numeric can serialize as string
  category: string;
  expense_date: string; // YYYY-MM-DD
}

/** Thrown for non-2xx responses; fetch rejections (offline) pass through as TypeError. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, body: string) {
    super(`Supabase request failed (${status}): ${body}`);
    this.status = status;
  }
}

/** True when the error looks like a network/offline failure rather than a server error. */
export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

// ── date ↔ dayOffset mapping (UI thinks in offsets, the table stores dates) ──
function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function offsetToDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return formatLocalDate(d);
}

export function dateToOffset(dateStr: string): number {
  // Column may serialize as "YYYY-MM-DD" or a full timestamp "YYYY-MM-DDT…";
  // only the date part is meaningful here.
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const then = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today.getTime() - then.getTime()) / 86400000));
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    note: row.name ?? '',
    categoryId: row.category,
    amount: Number(row.amount),
    dayOffset: dateToOffset(row.expense_date),
  };
}

function draftToBody(draft: ExpenseDraft) {
  return {
    // '' rather than null so blank notes also save before the migration
    // relaxing the column's NOT NULL has been applied
    name: draft.note,
    amount: draft.amount,
    category: draft.categoryId,
    expense_date: offsetToDate(draft.dayOffset),
  };
}

async function parseOrThrow(res: Response): Promise<any> {
  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => ''));
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── the four calls ───────────────────────────────────────────────────────────
export async function listExpenses(): Promise<Expense[]> {
  const res = await fetch(`${TABLE_URL}?order=expense_date.desc`, {
    headers: SUPABASE_HEADERS,
  });
  const rows: ExpenseRow[] = await parseOrThrow(res);
  return rows.map(rowToExpense);
}

export async function createExpense(draft: ExpenseDraft): Promise<Expense> {
  const res = await fetch(TABLE_URL, {
    method: 'POST',
    headers: { ...SUPABASE_HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify(draftToBody(draft)),
  });
  const rows: ExpenseRow[] = await parseOrThrow(res);
  // return=representation gives back the inserted row (server id + created_at)
  return rowToExpense(rows[0]);
}

export async function patchExpense(
  id: number,
  draft: ExpenseDraft,
): Promise<Expense> {
  const res = await fetch(`${TABLE_URL}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...SUPABASE_HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify(draftToBody(draft)),
  });
  const rows: ExpenseRow[] = await parseOrThrow(res);
  return rowToExpense(rows[0]);
}

export async function deleteExpenseRow(id: number): Promise<void> {
  const res = await fetch(`${TABLE_URL}?id=eq.${id}`, {
    method: 'DELETE',
    headers: SUPABASE_HEADERS,
  });
  await parseOrThrow(res);
}
