import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { routes } from "@/config/routes";
import { safeNext } from "@/features/auth/safe-next";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Links in Supabase emails land here (confirm email, reset password).
 * Supports both link styles: ?code= (PKCE) and ?token_hash=&type= (custom email templates).
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next")) ?? routes.onboarding.root;
  const failed = NextResponse.redirect(new URL(`${routes.auth.signIn}?error=link`, url.origin));
  if (!isSupabaseConfigured) return failed;

  const supabase = await createClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };

  if (error) return failed;
  return NextResponse.redirect(new URL(next, url.origin));
}
