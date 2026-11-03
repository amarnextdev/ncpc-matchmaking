import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/register-form";
import { homeForStatus } from "@/features/auth/home";
import { routes } from "@/config/routes";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Register your organisation" };

export default async function Page() {
  const viewer = await getViewer();
  if (viewer.signedIn) redirect(routes.workspace.root);
  if (viewer.account)
    redirect(homeForStatus(viewer.account.orgStatus, null, viewer.account.isAdmin));
  return <RegisterForm />;
}
