import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  return <ForgotPasswordForm expired={(await searchParams).expired === "1"} />;
}
