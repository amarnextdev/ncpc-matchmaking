import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Clock3,
  FileText,
  Info,
  Landmark,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { LiveRefresh } from "@/components/shared/live-refresh";
import { getSessionUser } from "@/lib/auth/session";
import { getViewer } from "@/lib/viewer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Waiting for verification" };
export const dynamic = "force-dynamic";

type StepState = "done" | "current" | "next";

const CHECKS: { label: string; note: string; icon: LucideIcon }[] = [
  { label: "Company registration", note: "Matched with CIPC records", icon: Building2 },
  { label: "B-BBEE status", note: "Certificate or affidavit is valid", icon: BadgeCheck },
  { label: "Tax compliance", note: "SARS status is in good standing", icon: Landmark },
  { label: "Profile details", note: "Clear, accurate and complete", icon: FileText },
];

const MEANWHILE: { label: string; text: string; href: string; icon: LucideIcon }[] = [
  {
    label: "Browse opportunities",
    text: "See projects looking for investors, technology and off-takers.",
    href: routes.opportunities.list,
    icon: Search,
  },
  {
    label: "See organisations",
    text: "Get to know the verified members you could partner with.",
    href: routes.organisations.list,
    icon: Building2,
  },
  {
    label: "Explore funding",
    text: "Find grants, loans and equity for cleaner production.",
    href: routes.funding.list,
    icon: Wallet,
  },
];

/** TODO(Module 3 – Auth/Onboarding): show the real organisation, submit date and status. */
export default async function Page() {
  // Always show the real status: approved → workspace, sent back → the form.
  const viewer = await getViewer();
  if (viewer.signedIn) redirect(routes.workspace.root);
  if (viewer.account?.isAdmin) redirect(routes.admin.root);
  const status = viewer.account?.orgStatus;
  if (status === "none" || status === "draft" || status === "changes_requested") {
    redirect(routes.onboarding.root);
  }

  const user = await getSessionUser();
  const membership =
    user && process.env.DATABASE_URL
      ? await (await import("@/features/onboarding/queries")).getMembershipOrg(user.id)
      : null;
  const org = membership?.org ?? null;
  const rejected = status === "rejected" || status === "suspended";

  const today = new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(org?.submittedAt ?? new Date());

  const timeline: { label: string; note: string; state: StepState; icon: LucideIcon }[] = [
    { label: "Account created", note: "Email confirmed", state: "done", icon: UserRound },
    { label: "Organisation submitted", note: today, state: "done", icon: FileText },
    {
      label: "NCPC review",
      note: "In progress · usually 2–3 working days",
      state: "current",
      icon: Clock3,
    },
    {
      label: "Verified",
      note: "Full access and the green verified badge",
      state: "next",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Approved / changes / rejected shows up here without a reload */}
      {user && !rejected ? <LiveRefresh userId={user.id} kinds={["organisation_"]} /> : null}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Status */}
        <section
          aria-labelledby="pending-title"
          className="overflow-hidden rounded-2xl border bg-background"
        >
          <div className="flex flex-col gap-4 border-b bg-gradient-to-b from-primary-soft/70 to-background px-6 pt-7 pb-6 sm:px-8">
            {rejected ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                {status === "suspended" ? "Suspended" : "Not approved"}
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning ring-1 ring-warning/15">
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-warning" />
                Under review
              </span>
            )}
            <div className="flex flex-col gap-2">
              <h1
                id="pending-title"
                className="text-2xl font-bold tracking-tight text-balance sm:text-[28px]"
              >
                {rejected
                  ? `NCPC could not approve ${org?.name ?? "your organisation"}`
                  : `Thanks, ${org?.name ?? "your organisation"} is with NCPC for review`}
              </h1>
              <p className="max-w-[60ch] text-[15px] leading-6 text-muted-foreground">
                {rejected
                  ? "Your organisation can't use the platform. If you think this is a mistake, contact the NCPC team."
                  : "We check your registration, B-BBEE and tax documents. This usually takes 2–3 working days, and we will email you as soon as you are verified."}
              </p>
              {rejected && org?.reviewNote ? (
                <p className="rounded-xl border bg-background px-4 py-3 text-sm">
                  <strong>Reason from NCPC:</strong> {org.reviewNote}
                </p>
              ) : null}
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <h2 className="sr-only">Progress</h2>
            <ol className="flex flex-col">
              {timeline.map((t, i) => {
                const Icon = t.state === "done" ? Check : t.icon;
                const last = i === timeline.length - 1;
                return (
                  <li
                    key={t.label}
                    aria-current={t.state === "current" ? "step" : undefined}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {!last ? (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-10 bottom-1 left-[19px] w-0.5 rounded-full",
                          t.state === "done" ? "bg-success" : "bg-border",
                        )}
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className={cn(
                        "relative flex size-10 shrink-0 items-center justify-center rounded-full",
                        t.state === "done" && "bg-success text-white",
                        t.state === "current" &&
                          "bg-primary text-primary-foreground ring-4 ring-primary-soft",
                        t.state === "next" &&
                          "border-2 border-dashed border-input bg-background text-muted-foreground",
                      )}
                    >
                      <Icon className="size-[18px]" strokeWidth={t.state === "done" ? 3 : 2} />
                    </span>
                    <div className="flex flex-col gap-0.5 pt-2">
                      <span
                        className={cn(
                          "text-[15px]",
                          t.state === "next"
                            ? "font-medium text-muted-foreground"
                            : "font-semibold",
                        )}
                      >
                        {t.label}
                        <span className="sr-only">
                          {t.state === "done"
                            ? " (done)"
                            : t.state === "current"
                              ? " (in progress)"
                              : " (next)"}
                        </span>
                      </span>
                      <span className="text-[13px] text-muted-foreground">{t.note}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="flex gap-3 border-t bg-surface-subtle px-6 py-4 text-[13px] leading-5 text-muted-foreground sm:px-8">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            If something needs fixing, we email you the reason. You can then update your details and
            send them again.
          </p>
        </section>

        {/* What NCPC checks + help */}
        <aside className="flex flex-col gap-4">
          <section aria-labelledby="checks-title" className="rounded-2xl border bg-background p-6">
            <h2 id="checks-title" className="text-base font-bold">
              What NCPC checks
            </h2>
            <ul className="mt-4 flex flex-col gap-4">
              {CHECKS.map((c) => (
                <li key={c.label} className="flex gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary"
                  >
                    <c.icon className="size-[18px]" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{c.label}</span>
                    <span className="text-[13px] text-muted-foreground">{c.note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex gap-2 border-t pt-4 text-[13px] leading-5 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              Only NCPC sees your documents.
            </p>
          </section>

          <section aria-labelledby="help-title" className="rounded-2xl border bg-background p-6">
            <h2 id="help-title" className="text-base font-bold">
              Questions about your review?
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
              The NCPC team replies within 2 working days.
            </p>
            <Link
              href={routes.contact}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Mail className="size-4" aria-hidden />
              Contact NCPC
            </Link>
          </section>
        </aside>
      </div>

      {/* While you wait */}
      <section aria-labelledby="meanwhile" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="meanwhile" className="text-lg font-bold">
            While you wait
          </h2>
          <p className="text-sm text-muted-foreground">
            You can browse everything now. Sending enquiries and applying open once you are
            verified.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {MEANWHILE.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="group flex flex-col gap-3 rounded-2xl border bg-background p-5 transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <span
                aria-hidden
                className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary"
              >
                <m.icon className="size-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold text-foreground">
                  {m.label}
                  <ArrowRight
                    className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="text-[13px] leading-5 text-muted-foreground">{m.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
