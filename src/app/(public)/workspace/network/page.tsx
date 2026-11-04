import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Compass, Inbox, Send, Users, type LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { LiveRefresh } from "@/components/shared/live-refresh";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ConnectionsList } from "@/features/network/components/connections-list";
import {
  InvitationActions,
  WithdrawButton,
} from "@/features/network/components/invitation-actions";
import { OrgTile } from "@/features/network/components/org-tile";
import { getNetwork } from "@/features/network/queries";
import { getMembershipOrg } from "@/features/onboarding/queries";
import { getSessionUser } from "@/lib/auth/session";
import { LOOKING_FOR, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "My network" };

const TABS = ["invitations", "connections", "history"] as const;
type Tab = (typeof TABS)[number];

const dayFmt = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short" });
function ago(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

const HISTORY_LABEL = { declined: "Declined", expired: "Expired", withdrawn: "Withdrawn" } as const;

type PageProps = { searchParams: Promise<{ tab?: string }> };

export default async function NetworkPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const membership = user ? await getMembershipOrg(user.id) : null;

  if (!user || !membership || membership.org.status !== "approved") {
    return (
      <Container className="py-10">
        <EmptyState
          icon={Users}
          title={user ? "Your network opens once you are verified" : "Sign in to see your network"}
          description="Invitations, connections and chats with other verified organisations live here."
          className="bg-card"
          action={
            user ? null : (
              <Button asChild>
                <Link
                  href={`${routes.auth.signIn}?next=${encodeURIComponent(routes.workspace.network)}`}
                >
                  Sign in
                </Link>
              </Button>
            )
          }
        />
      </Container>
    );
  }

  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "invitations";
  const data = await getNetwork(membership.org.id);
  const href = (t: Tab) =>
    t === "invitations" ? routes.workspace.network : `${routes.workspace.network}?tab=${t}`;

  const side: { tab: Tab; label: string; count: number; icon: LucideIcon; anchor?: string }[] = [
    { tab: "connections", label: "Connections", count: data.connections.length, icon: Users },
    { tab: "invitations", label: "Invitations received", count: data.received.length, icon: Inbox },
    {
      tab: "invitations",
      label: "Invitations sent",
      count: data.sent.length,
      icon: Send,
      anchor: "#sent",
    },
    { tab: "history", label: "History", count: data.history.length, icon: Clock3 },
  ];

  return (
    <div className="bg-surface pb-16">
      {/* New invitations and answers show up without a reload */}
      <LiveRefresh userId={user.id} kinds={["enquiry_"]} pollMs={0} />
      <Container className="grid items-start gap-6 pt-7 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section aria-labelledby="mnw" className="overflow-hidden rounded-2xl border bg-card">
            <h2 id="mnw" className="border-b px-5 pt-4.5 pb-3.5 text-base font-bold">
              Manage my network
            </h2>
            <ul>
              {side.map((s, i) => {
                const on = tab === s.tab && (s.tab !== "invitations" || i === 1);
                return (
                  <li key={s.label}>
                    <Link
                      href={`${href(s.tab)}${s.anchor ?? ""}`}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 border-l-[3px] px-5 py-3 text-sm transition-colors",
                        on
                          ? "border-primary bg-primary-soft/50 font-bold text-primary"
                          : "border-transparent font-medium text-foreground/80 hover:bg-surface-subtle",
                      )}
                    >
                      <s.icon className="size-[18px]" aria-hidden />
                      <span className="flex-1">{s.label}</span>
                      <span
                        className={cn(
                          "text-[13px] font-semibold tabular-nums",
                          on ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {s.count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="flex flex-col gap-2 rounded-2xl border bg-card px-5 py-4.5">
            <h2 className="text-[15px] font-bold">Find more partners</h2>
            <p className="text-[13px] leading-5 text-muted-foreground">
              Browse verified investors, funders and technology providers that match your projects.
            </p>
            <Link
              href={routes.organisations.list}
              className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Compass className="size-4" aria-hidden /> Explore organisations
            </Link>
          </section>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-col gap-4">
          {tab === "invitations" ? (
            <>
              <section
                aria-labelledby="recv"
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
                  <h2 id="recv" className="text-base font-bold">
                    Received{" "}
                    <span className="font-medium text-muted-foreground">
                      ({data.received.length})
                    </span>
                  </h2>
                  <span className="text-[13px] text-muted-foreground">Reply within 30 days</span>
                </div>
                {data.received.length ? (
                  <ul className="divide-y">
                    {data.received.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap gap-4 px-6 py-[18px] transition-colors hover:bg-surface-subtle/60 sm:flex-nowrap"
                      >
                        <OrgTile org={r.org} size={56} />
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <p className="text-[15px]">
                            <strong className="font-bold">{r.org.name}</strong>{" "}
                            {r.org.verified ? <VerifiedBadge size="sm" /> : null}{" "}
                            <span className="text-foreground/70">wants to connect</span>
                          </p>
                          <p className="text-[13px] text-muted-foreground">{r.org.meta}</p>
                          <p className="text-[13px] text-foreground/80">
                            As{" "}
                            <strong className="font-semibold">
                              {labelFor(LOOKING_FOR, r.role)}
                            </strong>
                            {r.project ? (
                              <>
                                {" "}
                                on <strong className="font-semibold">{r.project}</strong>
                              </>
                            ) : null}
                          </p>
                          {r.note ? (
                            <p className="mt-1.5 rounded-[10px] border bg-surface-subtle px-3 py-2.5 text-[13px] leading-5 text-foreground/80">
                              &ldquo;{r.note}&rdquo;
                            </p>
                          ) : null}
                          <p className="mt-0.5 text-xs text-subtle-foreground">
                            {ago(r.createdAt)}
                          </p>
                        </div>
                        <InvitationActions id={r.id} name={r.org.name} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No new invitations. When an organisation sends you an enquiry, it shows up here.
                  </p>
                )}
              </section>

              <section
                id="sent"
                aria-labelledby="sent-title"
                className="scroll-mt-6 overflow-hidden rounded-2xl border bg-card"
              >
                <div className="border-b px-6 py-4">
                  <h2 id="sent-title" className="text-base font-bold">
                    Sent{" "}
                    <span className="font-medium text-muted-foreground">({data.sent.length})</span>
                  </h2>
                </div>
                {data.sent.length ? (
                  <ul className="divide-y">
                    {data.sent.map((s) => (
                      <li key={s.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                        <OrgTile org={s.org} size={48} />
                        <div className="flex min-w-[200px] flex-1 flex-col gap-0.5">
                          <span className="text-[15px] font-bold">{s.org.name}</span>
                          <span className="text-[13px] text-muted-foreground">
                            You enquired as{" "}
                            <strong className="font-semibold text-foreground/80">
                              {labelFor(LOOKING_FOR, s.role)}
                            </strong>
                            {s.project ? ` on ${s.project}` : ""} · {ago(s.createdAt)}
                          </span>
                        </div>
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-warning">
                          <span aria-hidden className="size-[7px] rounded-full bg-current" />
                          Waiting · expires {dayFmt.format(new Date(s.expiresAt))}
                        </span>
                        <WithdrawButton id={s.id} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                    You have no invitations waiting for a reply.
                  </p>
                )}
              </section>
            </>
          ) : tab === "connections" ? (
            <ConnectionsList connections={data.connections} />
          ) : (
            <section aria-labelledby="his" className="overflow-hidden rounded-2xl border bg-card">
              <div className="border-b px-6 py-4">
                <h2 id="his" className="text-base font-bold">
                  History
                </h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Invitations that were declined, withdrawn or expired.
                </p>
              </div>
              {data.history.length ? (
                <ul className="divide-y">
                  {data.history.map((h) => (
                    <li key={h.id} className="flex items-center gap-3.5 px-6 py-3.5">
                      <OrgTile org={h.org} size={40} muted />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold">{h.org.name}</span>
                        <span className="truncate text-[13px] text-muted-foreground">
                          {labelFor(LOOKING_FOR, h.role)} · {h.project ?? "General enquiry"}
                          {h.sentByMe ? " · sent by you" : ""} · {dayFmt.format(new Date(h.at))}
                        </span>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground/70">
                        {HISTORY_LABEL[h.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Nothing here yet.
                </p>
              )}
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
