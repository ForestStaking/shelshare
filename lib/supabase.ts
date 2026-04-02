/**
 * Supabase Client Helpers
 *
 * Supabase is used ONLY as a lightweight metadata index for ShelShare.
 * File bytes are stored on Shelby Protocol — Supabase stores:
 *   - short_id → shelbyAddress mappings for shareable links
 *   - password hashes for protected links
 *   - expiry dates
 *   - download counts
 *   - user file listings for the dashboard
 *
 * This is a deliberate architectural decision. Shelby owns the bytes.
 * Supabase owns the metadata. See README.md for rationale.
 */

import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Client-side Supabase client (uses anon key, respects RLS)
// ---------------------------------------------------------------------------

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(url, anonKey);
}

// ---------------------------------------------------------------------------
// Server-side Supabase client (uses service role key, bypasses RLS)
// ---------------------------------------------------------------------------

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceKey);
}
