import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Choose a new password" };

/** Reached from the reset email: /auth/callback signs the person in, then sends them here. */
export default async function Page() {
  const user = await getSessionUser();
  if (!user) redirect(`${routes.auth.forgotPassword}?expired=1`);
  return <ResetPasswordForm email={user.email ?? ""} />;
}
