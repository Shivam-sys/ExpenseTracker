/**
 * Fetch wrappers over the Supabase `categories` table — the source of truth
 * for the category list (seeded rows + user-created ones), so
 * expenses.category carries a real FK. Presentation (icon components,
 * seeded colours, the custom-colour palette) resolves client-side from
 * theme/categories.ts, keyed by the row id / color_key.
 *
 * Table: id (text pk — the key stored in expenses.category) · created_at
 *        name (text ≤20) · icon (text, 'tag' for custom) · color_key · is_custom
 */
import { SUPABASE_HEADERS, SUPABASE_URL } from '../config/supabase';
import { CategoryDef, hexToRgba } from '../theme/tokens';
import { SEEDED_ORDER, paletteFor } from '../theme/categories';
import { ApiError } from './expensesApi';

const TABLE_URL = `${SUPABASE_URL}/rest/v1/categories`;

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color_key: string | null;
  is_custom: boolean;
}

/** 23505 = Postgres unique_violation → PostgREST responds 409. */
export function isDuplicateError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}

function rowToCategory(row: CategoryRow): CategoryDef {
  const accent = paletteFor(row.color_key ?? undefined).accent;
  return {
    id: row.id,
    label: row.name,
    color: accent,
    border: hexToRgba(accent, 0.25),
    icon: row.icon,
    colorKey: row.color_key ?? undefined,
    custom: row.is_custom,
  };
}

async function parseOrThrow(res: Response): Promise<any> {
  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => ''));
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function listCategories(): Promise<CategoryDef[]> {
  const res = await fetch(`${TABLE_URL}?order=created_at.asc`, {
    headers: SUPABASE_HEADERS,
  });
  const rows: CategoryRow[] = await parseOrThrow(res);
  // seeded rows share one created_at (single insert), so pin them to the
  // designed order; custom rows follow in creation order
  const rank = (id: string) => {
    const i = SEEDED_ORDER.indexOf(id);
    return i === -1 ? SEEDED_ORDER.length : i;
  };
  return rows.sort((a, b) => rank(a.id) - rank(b.id)).map(rowToCategory);
}

export async function createCategory(
  name: string,
  colorKey: string,
): Promise<CategoryDef> {
  // the id is the text key expenses reference, so the client mints it —
  // timestamp + random suffix keeps it unique without a server round-trip
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await fetch(TABLE_URL, {
    method: 'POST',
    headers: { ...SUPABASE_HEADERS, Prefer: 'return=representation' },
    body: JSON.stringify({
      id,
      name,
      icon: 'tag',
      color_key: colorKey,
      is_custom: true,
    }),
  });
  const rows: CategoryRow[] = await parseOrThrow(res);
  return rowToCategory(rows[0]);
}
