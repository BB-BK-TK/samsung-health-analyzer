import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client-safe Supabase instance (anon key). Use only in browser / RLS-safe reads.
 * Kept for backwards compatibility with existing app code.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase instance (service role). Use only in API routes / server actions.
 * Requires SUPABASE_SERVICE_ROLE_KEY (do NOT expose publicly).
 */
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl?.trim() || !serviceKey?.trim()) {
    throw new Error("Supabase admin client unavailable: SUPABASE_SERVICE_ROLE_KEY not configured");
  }
  return createClient(supabaseUrl, serviceKey);
}