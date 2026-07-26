import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely — use
 * only in trusted server code (route handlers, server actions) for tasks the
 * signed-in user genuinely cannot do themselves under RLS: verifying a
 * monthly-update token before the person is authenticated, issuing signed
 * URLs for private storage, admin-only writes, etc.
 *
 * The `server-only` import makes any accidental client-bundle import a
 * build-time error instead of a leaked secret.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
