"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { routes } from "@/config/routes";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getAccount, homeFor } from "./queries";
import { safeNext } from "./safe-next";
import {
  newPassword,
  registerSchema,
  signInSchema,
  type RegisterValues,
  type SignInValues,
} from "./schemas";
import { OTP_LENGTH, PASSWORD_MIN } from "./constants";

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      field?: "name" | "email" | "password";
      /** Sign in with an unconfirmed email: offer the code screen */
      needsVerification?: boolean;
    };

const NOT_READY: ActionResult = {
  ok: false,
  error: "Sign-in is not available yet. Please try again later.",
};

function callbackUrl(next: string): string {
  const { NEXT_PUBLIC_SITE_URL } = getPublicEnv();
  return `${NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Saves the person's name once the auth user exists (safe to call many times). */
async function ensureProfile(userId: string, fullName: string) {
  if (!process.env.DATABASE_URL) return;
  try {
    const { db } = await import("@/db");
    const { profiles } = await import("@/db/schema");
    await db.insert(profiles).values({ id: userId, fullName }).onConflictDoNothing();
  } catch (error) {
    // Don't block sign-up: the profile is created again on the next sign in.
    // The real reason (e.g. missing table, wrong DATABASE_URL password) is in error.cause.
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.error("[auth] could not save profile:", cause);
  }
}

/** Step 1 of registration: the person's account. Supabase sends the confirmation email. */
export async function registerAction(input: RegisterValues): Promise<ActionResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields." };
  const { name, email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl(routes.onboarding.root), data: { full_name: name } },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { ok: false, field: "password", error: "Choose a stronger password." };
    }
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
    }
    if (error.code !== "user_already_exists") {
      return { ok: false, error: "We could not create your account. Please try again." };
    }
  }

  // Supabase hides whether an email is already registered (no identities): treat it the same,
  // so nobody can find out who has an account. The real owner can sign in or reset the password.
  if (data.user && (data.user.identities?.length ?? 0) > 0) {
    await ensureProfile(data.user.id, name);
  }
  return { ok: true };
}

const otpSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  token: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`)),
});

/**
 * Confirms the email with the code from the email. On success the person is signed in
 * and sent to onboarding.
 */
export async function verifyEmailCodeAction(email: string, token: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const parsed = otpSchema.safeParse({ email, token });
  if (!parsed.success) {
    return { ok: false, error: `Enter the ${OTP_LENGTH}-digit code from the email.` };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });
  if (error || !data.user) {
    if (error?.code === "otp_expired") {
      return {
        ok: false,
        error: "This code has expired or is not right. Check the email, or send a new code.",
      };
    }
    if (error?.status === 429) {
      return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
    }
    return { ok: false, error: "We could not confirm your email. Send a new code and try again." };
  }
  const fullName = String(data.user.user_metadata?.full_name ?? "").trim();
  if (fullName) await ensureProfile(data.user.id, fullName);
  const account = await getAccount(data.user.id, data.user.email ?? parsed.data.email);
  redirect(homeFor(account));
}

/** Sends a new confirmation code. Always answers ok (no account lookup leaks). */
export async function resendConfirmationAction(email: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const parsed = z.string().trim().toLowerCase().email().safeParse(email);
  if (!parsed.success) return { ok: false, field: "email", error: "Enter a valid email." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: callbackUrl(routes.onboarding.root) },
  });
  if (error?.status === 429) {
    return { ok: false, error: "Please wait a minute before asking for another email." };
  }
  return { ok: true };
}

export async function signInAction(
  input: SignInValues,
  next: string | null,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return {
        ok: false,
        error: "Confirm your email first with the code we sent you.",
        needsVerification: true,
      };
    }
    if (error?.status === 429) {
      return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
    }
    return {
      ok: false,
      error: "That email and password don't match. Try again or reset your password.",
    };
  }

  const fullName = String(data.user.user_metadata?.full_name ?? "").trim();
  if (fullName) await ensureProfile(data.user.id, fullName);
  const account = await getAccount(data.user.id, data.user.email ?? parsed.data.email);
  redirect(homeFor(account, safeNext(next)));
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(routes.home);
}

/** Forgot password. Always answers ok, whether or not the email has an account. */
export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const parsed = z.string().trim().toLowerCase().email().max(254).safeParse(email);
  if (!parsed.success) return { ok: false, field: "email", error: "Enter a valid email." };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: callbackUrl(routes.auth.resetPassword),
  });
  if (error?.status === 429) {
    return { ok: false, error: "Please wait a minute before asking for another email." };
  }
  return { ok: true };
}

/**
 * Forgot password, step 2: the 6-digit code from the reset email.
 * A right code signs the person in for this one purpose; they then choose a new password.
 */
export async function verifyResetCodeAction(email: string, token: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  const parsed = otpSchema.safeParse({ email, token });
  if (!parsed.success) {
    return { ok: false, error: `Enter the ${OTP_LENGTH}-digit code from the email.` };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "recovery",
  });
  if (error || !data.user) {
    if (error?.status === 429) {
      return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
    }
    return {
      ok: false,
      error: "This code has expired or is not right. Check the email, or send a new code.",
    };
  }
  redirect(routes.auth.resetPassword);
}

/** Reset password: the code (or the reset link) already signed the person in. */
export async function updatePasswordAction(password: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return NOT_READY;
  if (!newPassword.safeParse(password).success) {
    return {
      ok: false,
      field: "password",
      error: `Use at least ${PASSWORD_MIN} characters, with letters and numbers.`,
    };
  }
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Your reset session has expired. Ask for a new code." };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { ok: false, field: "password", error: "Choose a password you have not used before." };
    }
    if (error.code === "weak_password") {
      return { ok: false, field: "password", error: "Choose a stronger password." };
    }
    return { ok: false, error: "We could not change your password. Please try again." };
  }
  const account = await getAccount(userData.user.id, userData.user.email ?? "");
  redirect(homeFor(account));
}
