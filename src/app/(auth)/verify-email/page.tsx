import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";
import { homeForStatus } from "@/features/auth/home";
import { routes } from "@/config/routes";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Confirm your email" };

const emailSchema = z.string().trim().toLowerCase().email().max(254);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; resend?: string }>;
}) {
  const params = await searchParams;
  const viewer = await getViewer();
  if (viewer.signedIn) redirect(routes.workspace.root);
  if (viewer.account)
    redirect(homeForStatus(viewer.account.orgStatus, null, viewer.account.isAdmin));

  const email = emailSchema.safeParse(params.email);
  if (!email.success) redirect(routes.auth.register);
  return <VerifyEmailForm email={email.data} sendOnOpen={params.resend === "1"} />;
}
