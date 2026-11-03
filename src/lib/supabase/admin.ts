import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAdminEnv } from "@/lib/env";

/**
 * Supabase client with the SECRET key. SERVER ONLY, and only for Storage:
 * signing upload URLs and short-lived download links AFTER our own permission checks.
 * It bypasses RLS, so never use it to read data on behalf of a user.
 */
let client: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
  if (client) return client;
  const env = getAdminEnv();
  client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
