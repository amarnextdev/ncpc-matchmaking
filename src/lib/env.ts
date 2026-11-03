import { z } from "zod";

/**
 * Typed, validated environment variables.
 * Public values are safe in the browser; DATABASE_URL is read on the server only (see src/db).
 */
/**
 * Supabase now calls the browser key "publishable"; older projects call it "anon".
 * Both names work. (Written out in full so Next.js can inline them in the browser bundle.)
 */
const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  /** Publishable key (sb_publishable_…) or the legacy anon key. Safe in the browser. */
  NEXT_PUBLIC_SUPABASE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

export function getPublicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: supabasePublicKey,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

export function getServerEnv() {
  return serverSchema.parse({ DATABASE_URL: process.env.DATABASE_URL });
}

/** True when Supabase keys are present, so the app can run before Supabase is set up. */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && supabasePublicKey,
);

/**
 * Supabase SECRET key (sb_secret_…, or the legacy service_role key). SERVER ONLY:
 * used just for Storage signing (src/lib/supabase/admin.ts). Never prefix it with NEXT_PUBLIC_.
 */
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export function getAdminEnv() {
  return adminSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY: supabaseSecretKey,
  });
}

/** True when uploads can work (Supabase keys + the server-only secret key). */
export const isStorageConfigured = Boolean(isSupabaseConfigured && supabaseSecretKey);
