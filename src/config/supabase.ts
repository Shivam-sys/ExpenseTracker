/**
 * Supabase REST config. Values come from `.env` (git-ignored) via
 * react-native-dotenv — fill in SUPABASE_URL / SUPABASE_KEY there.
 * NOTE: .env changes are inlined at transform time; restart Metro with
 * `--reset-cache` after editing it.
 */
import {
  SUPABASE_URL as ENV_SUPABASE_URL,
  SUPABASE_KEY as ENV_SUPABASE_KEY,
} from '@env';

export const SUPABASE_URL = ENV_SUPABASE_URL ?? '';
export const SUPABASE_KEY = ENV_SUPABASE_KEY ?? '';

export const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};
