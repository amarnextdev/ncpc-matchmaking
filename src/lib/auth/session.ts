import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string | null };

/**
 * The signed-in Supabase user, or null.
 * Always checked on the server (getUser verifies the token with Supabase; never trust getSession alone).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}
