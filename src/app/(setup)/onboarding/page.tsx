import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { ONBOARDING_DEFAULTS, type DraftValues } from "@/features/onboarding/schema";
import { homeForStatus } from "@/features/auth/home";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth/session";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Set up your organisation" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const viewer = await getViewer();
  if (viewer.signedIn) redirect(routes.workspace.root);
  // NCPC staff don't set up an organisation: send them to the admin panel.
  if (viewer.account?.isAdmin) redirect(routes.admin.root);
  const status = viewer.account?.orgStatus;
  if (status && homeForStatus(status) !== routes.onboarding.root) redirect(homeForStatus(status));

  const user = await getSessionUser();
  const state =
    user && process.env.DATABASE_URL
      ? await (await import("@/features/onboarding/queries")).loadOnboarding(user.id)
      : {
          values: ONBOARDING_DEFAULTS as DraftValues,
          step: 0,
          savedAt: null,
          reviewNote: null,
          mode: "new" as const,
        };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">
          {state.mode === "changes" ? "Update your organisation" : "Set up your organisation"}
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Four steps, about 10 minutes. NCPC verifies every organisation before it appears on the
          platform.
        </p>
      </div>
      <OnboardingForm
        initialValues={state.values}
        initialStep={state.step}
        savedAt={state.savedAt}
        mode={state.mode}
        reviewNote={state.reviewNote}
      />
    </div>
  );
}
