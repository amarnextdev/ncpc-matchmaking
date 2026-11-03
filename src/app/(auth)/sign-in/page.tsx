import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { homeForStatus } from "@/features/auth/home";
import { safeNext } from "@/features/auth/safe-next";
import { routes } from "@/config/routes";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, string> = {
  link: "That link has expired or was already used. Sign in, or ask for a new email.",
  reset: "Your password has been changed. Sign in with your new password.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const viewer = await getViewer();
  if (viewer.signedIn) redirect(next ?? routes.workspace.root);
  if (viewer.account)
    redirect(homeForStatus(viewer.account.orgStatus, null, viewer.account.isAdmin));

  const key = params.error ?? params.notice;
  return (
    <SignInForm
      demoEnabled={process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "1"}
      next={next}
      notice={key ? (NOTICES[key] ?? null) : null}
    />
  );
}
