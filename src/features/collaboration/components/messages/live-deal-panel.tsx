"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Mail,
  Clock3,
  Loader2,
  Lock,
  PartyPopper,
  ChevronDown,
  FolderKanban,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { LOOKING_FOR, labelFor } from "@/lib/constants";
import { cn, formatRand } from "@/lib/utils";
import { DEAL_STAGES } from "../../constants";
import {
  confirmPartnershipAction,
  reviewOfferAction,
  saveDealNoteAction,
  setDealStageAction,
  startDealAction,
} from "../../deal-actions";
import { useDealRun } from "../../deal-sync";
import { dealTodo } from "../../deal-todo";
import { offerSummary } from "../../forms";
import type { ConversationView, Deal, DealLive } from "../../types";
import { AddProjectDialog, CollabRequestDialog, OfferFormDialog } from "./offer-dialogs";

const dayFmt = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short" });
const NEXT_STAGE: Record<string, "due_diligence" | "agreement" | undefined> = {
  in_discussion: "due_diligence",
  due_diligence: "agreement",
};

function Section({
  title,
  children,
  aside,
}: {
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * Deal panel for real deals: stage (owner moves it), the collaboration steps
 * (request → offer → review → both confirm), private notes and contact.
 */
export function LiveDealPanel({
  conversation: c,
  deal,
  deals,
  onDealChange,
}: {
  conversation: ConversationView;
  deal: Deal & { live: DealLive };
  deals: Deal[];
  onDealChange: (id: string) => void;
}) {
  const live = deal.live;
  const owner = live.isOwner ? c.me : c.them;
  const partner = live.isOwner ? c.them : c.me;
  const { busy, syncing, run: act } = useDealRun();
  const pending = busy !== null;
  const [requestOpen, setRequestOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [note, setNote] = useState(live.myNote);
  const [noteState, setNoteState] = useState<"idle" | "saving" | "saved">("idle");
  const [changes, setChanges] = useState("");
  const [askChanges, setAskChanges] = useState(false);
  const [amountPublic, setAmountPublic] = useState(live.partnership?.amountPublic ?? true);
  const timer = useRef<number | null>(null);

  useEffect(() => setNote(live.myNote), [live.myNote, deal.id]);

  const run = (
    fn: () => Promise<{ ok: true } | { ok: false; error: string }>,
    success?: string,
    key = "main",
    onDone?: () => void,
  ) => void act(key, fn, { success, onDone });

  function onNote(v: string) {
    setNote(v);
    if (!live.dealId) return;
    if (timer.current) window.clearTimeout(timer.current);
    setNoteState("saving");
    const id = live.dealId;
    timer.current = window.setTimeout(async () => {
      await saveDealNoteAction({ dealId: id, body: v });
      setNoteState("saved");
    }, 900);
  }

  const stageIndex = DEAL_STAGES.findIndex((s) => s.value === deal.stage);
  const next = NEXT_STAGE[deal.stage];
  const req = live.request;
  const part = live.partnership;
  const summary = req?.form ? offerSummary(deal.role, req.form) : [];
  const iConfirmed = part
    ? Boolean(live.isOwner ? part.ownerConfirmedAt : part.partnerConfirmedAt)
    : false;

  // "You" for my side, a short name for theirs ("GreenFuture Energy (Pty) Ltd" → "GreenFuture Energy").
  const who = (p: { name: string }) => (p === c.me ? "You" : shortName(p.name));
  const steps = [
    { label: "Deal started", who: "Either side", done: Boolean(live.dealId) },
    { label: "Collaboration request", who: who(owner), done: Boolean(req) },
    {
      label: req?.status === "changes_requested" ? "Offer updated" : "Offer sent",
      who: who(partner),
      done: Boolean(part) || req?.status === "submitted" || req?.status === "accepted",
    },
    { label: "Offer accepted", who: who(owner), done: Boolean(part) },
    { label: "Both confirm", who: "Both", done: part?.status === "active" },
  ];
  const progress = <Progress steps={steps} />;

  const stageLabel = DEAL_STAGES.find((x) => x.value === deal.stage)?.label ?? "Not started";
  const nextLabel = next ? DEAL_STAGES.find((x) => x.value === next)?.label : null;
  const stageRow = live.dealId ? (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t pt-3 text-xs">
      <span className="text-muted-foreground">Deal stage</span>
      <span className="flex items-center gap-1" aria-hidden>
        {DEAL_STAGES.map((x, i) => (
          <span
            key={x.value}
            className={cn(
              "h-1.5 w-5 rounded-full",
              i < stageIndex ? "bg-success-bar" : i === stageIndex ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </span>
      <span className="font-semibold">{stageLabel}</span>
      {live.isOwner && next && !part ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => setDealStageAction({ dealId: live.dealId!, stage: next }),
              `Moved to ${nextLabel}`,
            )
          }
          className="ml-auto font-semibold text-primary hover:underline disabled:opacity-60"
        >
          Move to {nextLabel} →
        </button>
      ) : null}
    </div>
  ) : null;

  // ── Not started ──
  if (!live.dealId) {
    return (
      <div className="flex h-full [scrollbar-width:thin] flex-col gap-3 overflow-y-auto bg-surface-subtle p-4">
        <DealHeader
          deal={deal}
          deals={deals}
          onDealChange={onDealChange}
          owner={owner.name}
          partner={partner.name}
          isOwner={live.isOwner}
          conversation={c}
        />
        {live.projectId ? (
          <>
            <div className="flex flex-col gap-2.5 rounded-xl bg-primary p-4 text-white">
              <p className="text-[15px] font-bold">Start a deal</p>
              <p className="text-[13px] leading-[19px] text-[#D6E0F0]">
                Track this project with {live.isOwner ? partner.name : owner.name}: the stage, your
                private notes and the collaboration request, step by step.
              </p>
              <Button
                className="mt-1 self-start bg-white font-bold text-primary hover:bg-white/90"
                disabled={pending}
                onClick={() =>
                  live.enquiryId && run(() => startDealAction(live.enquiryId!), "Deal started")
                }
              >
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Start deal
              </Button>
            </div>
            <Section title="How it works">{progress}</Section>
          </>
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-[13px] leading-[19px] text-muted-foreground">
            This is a general conversation. Deals are about a project: enquire about one of their
            projects to start one.
          </p>
        )}
        <Contact c={c} />
      </div>
    );
  }

  return (
    <div className="flex h-full [scrollbar-width:thin] flex-col gap-3 overflow-y-auto bg-surface-subtle p-4">
      <DealHeader
        deal={deal}
        deals={deals}
        onDealChange={onDealChange}
        owner={owner.name}
        partner={partner.name}
        isOwner={live.isOwner}
        conversation={c}
        stage={stageRow}
      />

      <Section
        title="Collaboration"
        aside={
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
            {syncing ? (
              <>
                <Loader2 className="size-3 animate-spin" aria-hidden /> Updating…
              </>
            ) : (
              `${steps.filter((x) => x.done).length} of ${steps.length} done`
            )}
          </span>
        }
      >
        <Progress
          steps={steps}
          current={
            <>
              {part?.status === "active" ? (
                <div className="flex flex-col gap-3 rounded-xl border border-success/20 bg-success-soft p-4">
                  <div className="flex items-center gap-2.5 text-success">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-white">
                      <PartyPopper className="size-[18px]" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold">Partnership is live</p>
                      <p className="text-xs text-success/85">
                        Shown on the project page and both profiles
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-3 divide-x divide-success/15 rounded-lg bg-card/80 text-center">
                    <div className="px-2 py-2.5">
                      <dt className="text-[11px] text-muted-foreground">Partner</dt>
                      <dd className="truncate text-[13px] font-bold">
                        {partner.name.replace(/\s*\(Pty\)\s*Ltd\.?$/i, "")}
                      </dd>
                    </div>
                    <div className="px-2 py-2.5">
                      <dt className="text-[11px] text-muted-foreground">Role</dt>
                      <dd className="text-[13px] font-bold">{labelFor(LOOKING_FOR, deal.role)}</dd>
                    </div>
                    <div className="px-2 py-2.5">
                      <dt className="text-[11px] text-muted-foreground">Amount</dt>
                      <dd className="text-[13px] font-bold tabular-nums">
                        {part.amount ? formatRand(part.amount) : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : part ? (
                <div className="flex flex-col gap-3 rounded-xl border bg-surface-subtle p-3.5">
                  <div>
                    <p className="text-sm font-bold">Confirm your partnership</p>
                    <p className="mt-0.5 text-xs leading-[18px] text-muted-foreground">
                      Sign your agreement outside the platform, then both confirm here.
                    </p>
                  </div>
                  <ul className="divide-y rounded-lg border">
                    {[
                      { who: owner, at: part.ownerConfirmedAt, role: "Project owner" },
                      {
                        who: partner,
                        at: part.partnerConfirmedAt,
                        role: `${labelFor(LOOKING_FOR, deal.role)}${part.amount ? ` · ${formatRand(part.amount)}` : ""}`,
                      },
                    ].map((row) => (
                      <li key={row.who.slug} className="flex items-center gap-2.5 px-3 py-2.5">
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[13px] font-semibold">{row.who.name}</span>
                          <span className="text-[11px] text-muted-foreground">{row.role}</span>
                        </span>
                        {row.at ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-success">
                            <Check className="size-3.5" strokeWidth={2.8} aria-hidden /> Confirmed{" "}
                            {dayFmt.format(new Date(row.at))}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                            <span className="size-1.5 rounded-full bg-current" aria-hidden />{" "}
                            Waiting
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {!iConfirmed ? (
                    <>
                      {live.isOwner && part.amount ? (
                        <label className="flex items-center gap-2.5 text-[13px]">
                          <Switch checked={amountPublic} onCheckedChange={setAmountPublic} />
                          Show the amount on the project page
                        </label>
                      ) : null}
                      <Button
                        disabled={pending}
                        onClick={() =>
                          run(
                            () =>
                              confirmPartnershipAction({ partnershipId: part.id, amountPublic }),
                            "Confirmed. Waiting for the other side, if they have not confirmed yet.",
                          )
                        }
                      >
                        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Confirm
                        partnership
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      You confirmed. Waiting for {live.isOwner ? partner.name : owner.name}.
                    </p>
                  )}
                </div>
              ) : req &&
                (req.status === "submitted" ||
                  (req.status === "changes_requested" && !live.isOwner) ||
                  req.status === "requested") ? (
                <div className="flex flex-col gap-3 rounded-xl border bg-surface-subtle p-3.5">
                  {req.status === "requested" || req.status === "changes_requested" ? (
                    live.isOwner ? (
                      <p className="flex items-center gap-2 text-[13px] text-foreground/80">
                        <Clock3 className="size-4 text-warning" aria-hidden /> Waiting for{" "}
                        {shortName(partner.name)}&apos;s offer. You get a notification when it
                        arrives.
                      </p>
                    ) : (
                      <>
                        <p className="text-[13px] leading-5 font-bold">
                          {req.status === "changes_requested"
                            ? `${shortName(owner.name)} asked for changes`
                            : `${shortName(owner.name)} asked for your offer`}
                        </p>
                        {req.ownerNote ? (
                          <div className="flex gap-2.5">
                            <span
                              aria-hidden
                              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
                            >
                              {owner.initials}
                            </span>
                            <p className="min-w-0 rounded-xl rounded-tl-sm border bg-card px-3 py-2 text-xs leading-[17px]">
                              &ldquo;{req.ownerNote}&rdquo;
                            </p>
                          </div>
                        ) : null}
                        <Button className="w-full" onClick={() => setOfferOpen(true)}>
                          {req.status === "changes_requested"
                            ? "Update your offer"
                            : "Fill in your offer"}
                        </Button>
                      </>
                    )
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">
                          {live.isOwner ? `${partner.name}'s offer` : "Your offer"}
                          <span className="font-medium text-muted-foreground">
                            {" "}
                            · v{req.version}
                          </span>
                        </p>
                        <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-bold text-warning">
                          {live.isOwner ? "Waiting for you" : "In review"}
                        </span>
                      </div>
                      <dl className="divide-y rounded-lg border text-[13px]">
                        {summary.map((s) => (
                          <div key={s.label} className="grid grid-cols-[110px_1fr] gap-2 px-3 py-2">
                            <dt className="text-muted-foreground">{s.label}</dt>
                            <dd className={cn("leading-5", s.strong && "font-bold")}>{s.value}</dd>
                          </div>
                        ))}
                      </dl>
                      {live.isOwner ? (
                        askChanges ? (
                          <div className="flex flex-col gap-2">
                            <Textarea
                              rows={3}
                              value={changes}
                              onChange={(e) => setChanges(e.target.value)}
                              placeholder="What should they change?"
                              className="resize-none text-[13px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAskChanges(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1"
                                disabled={pending || changes.trim().length < 5}
                                onClick={() =>
                                  run(
                                    () =>
                                      reviewOfferAction({
                                        requestId: req.id,
                                        decision: "changes",
                                        note: changes,
                                      }),
                                    `Changes requested. ${partner.name} can now update the offer.`,
                                    "changes",
                                    () => {
                                      setAskChanges(false);
                                      setChanges("");
                                    },
                                  )
                                }
                              >
                                {busy === "changes" ? (
                                  <Loader2 className="animate-spin" aria-hidden />
                                ) : (
                                  <RotateCcw aria-hidden />
                                )}{" "}
                                Send request for changes
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setAskChanges(true)}
                            >
                              Ask for changes
                            </Button>
                            <Button
                              className="flex-1 bg-success hover:bg-success/90"
                              disabled={pending}
                              onClick={() =>
                                run(
                                  () =>
                                    reviewOfferAction({ requestId: req.id, decision: "accept" }),
                                  "Offer accepted",
                                )
                              }
                            >
                              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}{" "}
                              Accept offer
                            </Button>
                          </div>
                        )
                      ) : null}
                    </>
                  )}
                </div>
              ) : live.isOwner ? (
                <div className="flex flex-col gap-2 rounded-xl bg-primary p-4 text-white">
                  <p className="text-[15px] font-bold">Ready to work together?</p>
                  <p className="text-[13px] leading-[19px] text-[#D6E0F0]">
                    Send {partner.name} a collaboration request. They fill in their offer, you
                    review it, then you both confirm.
                  </p>
                  <Button
                    className="mt-1 self-start bg-white font-bold text-primary hover:bg-white/90"
                    onClick={() => setRequestOpen(true)}
                  >
                    Send collaboration request
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-primary-soft p-3 text-xs leading-[18px] text-primary">
                  When you are ready, {owner.name} sends you a collaboration request to fill in your
                  offer.
                </p>
              )}
            </>
          }
        />
      </Section>

      {/* Notes */}
      <Section
        title="Private notes"
        aside={
          <span className="text-[11px] text-muted-foreground">
            {noteState === "saving" ? "Saving…" : noteState === "saved" ? "Saved" : ""}
          </span>
        }
      >
        <Textarea
          rows={4}
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Anything you want to remember about this deal."
          className="resize-none bg-surface-subtle text-[13px] focus-visible:bg-background"
        />
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="size-3" aria-hidden /> Only {c.me.name} sees this
        </span>
      </Section>

      <Contact c={c} />

      {live.isOwner ? (
        <CollabRequestDialog
          open={requestOpen}
          onOpenChange={setRequestOpen}
          dealId={live.dealId}
          partner={partner.name}
          role={deal.role}
        />
      ) : null}
      {req && !live.isOwner ? (
        <OfferFormDialog
          key={`${req.id}-${req.version}`}
          open={offerOpen}
          onOpenChange={setOfferOpen}
          requestId={req.id}
          role={deal.role}
          owner={owner.name}
          project={deal.projectTitle}
          ownerNote={req.ownerNote}
          initial={req.form}
        />
      ) : null}
    </div>
  );
}

/** Project tabs (one per deal), who is who, the deal stage, and "Add a project". */
function DealHeader({
  deal,
  deals,
  onDealChange,
  owner,
  partner,
  isOwner,
  conversation,
  stage,
}: {
  deal: Deal;
  deals: Deal[];
  onDealChange: (id: string) => void;
  owner: string;
  partner: string;
  isOwner: boolean;
  conversation: ConversationView;
  stage?: React.ReactNode;
}) {
  const [adding, setAdding] = useState(false);
  const role = labelFor(LOOKING_FOR, deal.role).toLowerCase();
  // Always offer "Add another project"; the dialog explains when nothing can be added yet.
  const canAdd = Boolean(deal.live);
  return (
    <>
      {deals.length > 1 || canAdd ? (
        <ProjectSwitcher
          deal={deal}
          deals={deals}
          them={conversation.them.name}
          canAdd={canAdd}
          onDealChange={onDealChange}
          onAdd={() => setAdding(true)}
        />
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-l-4 border-l-primary bg-card p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] leading-5 font-bold">{deal.projectTitle}</p>
          {deal.projectSlug ? (
            <Link
              href={routes.opportunities.detail(deal.projectSlug)}
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View project <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-muted-foreground">Project owner</dt>
            <dd className="font-semibold">{isOwner ? "You" : owner}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Partner as {role}</dt>
            <dd className="font-semibold">{isOwner ? partner : "You"}</dd>
          </div>
        </dl>
        {stage}
      </div>

      {canAdd ? (
        <AddProjectDialog
          open={adding}
          onOpenChange={setAdding}
          conversation={conversation}
          onAdded={onDealChange}
        />
      ) : null}
    </>
  );
}

type DealStatus = "live" | "turn" | "wait" | "new";

const STATUS_UI: Record<DealStatus, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-success-soft text-success" },
  turn: { label: "Your turn", className: "bg-warning-soft text-warning" },
  wait: { label: "Waiting", className: "bg-muted text-muted-foreground" },
  new: { label: "Not started", className: "bg-muted text-muted-foreground" },
};

function statusOf(d: Deal, them: string): DealStatus {
  const live = d.live;
  if (!live?.dealId) return "new";
  if (live.partnership?.status === "active") return "live";
  return dealTodo(live, them) ? "turn" : "wait";
}

function StatusPill({ status }: { status: DealStatus }) {
  const ui = STATUS_UI[status];
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
        ui.className,
      )}
    >
      {ui.label}
    </span>
  );
}

function ProjectThumb({ d, size }: { d: Deal; size: "sm" | "md" }) {
  const cls = size === "md" ? "size-9" : "size-8";
  return d.coverUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- small thumbnail from storage
    <img src={d.coverUrl} alt="" className={cn(cls, "shrink-0 rounded-lg border object-cover")} />
  ) : (
    <span
      aria-hidden
      className={cn(
        cls,
        "flex shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary",
      )}
    >
      <FolderKanban className="size-4" />
    </span>
  );
}

/** "Project 2 of 3 · switch" — one dropdown with every project, its status and "Add another". */
function ProjectSwitcher({
  deal,
  deals,
  them,
  canAdd,
  onDealChange,
  onAdd,
}: {
  deal: Deal;
  deals: Deal[];
  them: string;
  canAdd: boolean;
  onDealChange: (id: string) => void;
  onAdd: () => void;
}) {
  const index = Math.max(
    0,
    deals.findIndex((d) => d.id === deal.id),
  );
  const subtitle = (d: Deal) => {
    const amount = d.live?.partnership?.amount;
    return [labelFor(LOOKING_FOR, d.role), amount ? formatRand(amount) : null]
      .filter(Boolean)
      .join(" · ");
  };
  const waiting = deals.filter((d) => d.id !== deal.id && statusOf(d, them) === "turn").length;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className="group flex w-full items-center gap-2.5 rounded-xl border border-input bg-card p-2.5 text-left transition-[border-color,box-shadow] outline-none hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary-soft"
        aria-label={`Project ${index + 1} of ${deals.length}: ${deal.projectTitle}. Switch project`}
      >
        <ProjectThumb d={deal} size="md" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[11px] text-muted-foreground">
            Project {index + 1} of {deals.length} · switch
            {waiting ? (
              <span className="font-semibold text-warning"> · {waiting} more need you</span>
            ) : null}
          </span>
          <span className="truncate text-[13px] font-bold">{deal.projectTitle}</span>
        </span>
        <StatusPill status={statusOf(deal, them)} />
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
        >
          <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl p-0"
      >
        <p className="px-3 pt-2.5 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
          Projects with {them.replace(/\s*\(Pty\)\s*Ltd\.?$/i, "")}
        </p>
        {deals.map((d) => {
          const on = d.id === deal.id;
          return (
            <DropdownMenuItem
              key={d.id}
              onSelect={() => onDealChange(d.id)}
              className={cn(
                "gap-2.5 rounded-none border-t px-3 py-2.5 first-of-type:border-t-0",
                on && "bg-primary-soft/50",
              )}
            >
              <ProjectThumb d={d} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate text-[13px]", on ? "font-bold" : "font-semibold")}>
                  {d.projectTitle}
                </span>
                <span className="text-[11px] text-muted-foreground">{subtitle(d)}</span>
              </span>
              <StatusPill status={statusOf(d, them)} />
              <span className="flex w-4 justify-center">
                {on ? (
                  <Check className="size-4 text-primary" strokeWidth={2.6} aria-hidden />
                ) : null}
              </span>
            </DropdownMenuItem>
          );
        })}
        {canAdd ? (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem
              onSelect={onAdd}
              className="gap-2 rounded-none px-3 py-3 text-[13px] font-semibold text-primary"
            >
              <Plus className="size-4" aria-hidden /> Add another project
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Collaboration steps; the first unfinished one is "now" and holds what to do next. */
function Progress({
  steps,
  current,
}: {
  steps: { label: string; who: string; done: boolean }[];
  current?: React.ReactNode;
}) {
  const now = steps.findIndex((s) => !s.done);
  const [showDone, setShowDone] = useState(false);
  const fold = Boolean(current) && now >= 2 && !showDone;
  return (
    <>
      <ol className="flex flex-col">
        {fold ? (
          <li className="relative flex gap-3 pb-4">
            <span
              aria-hidden
              className="absolute top-7 bottom-1 left-[11px] w-0.5 rounded-full bg-success-bar"
            />
            <span
              aria-hidden
              className="relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full bg-success-bar text-white"
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 pt-0.5">
              <span className="text-[13px] leading-5 font-semibold">{now} steps done</span>
              <button
                type="button"
                onClick={() => setShowDone(true)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Show
              </button>
            </div>
          </li>
        ) : null}
        {steps.map((s, i) => {
          if (fold && i < now) return null;
          const isNow = i === now;
          return (
            <li key={s.label} className="relative flex gap-3 pb-4 last:pb-0">
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-7 bottom-1 left-[11px] w-0.5 rounded-full",
                    s.done ? "bg-success-bar" : "bg-border",
                  )}
                />
              ) : null}
              <span
                aria-hidden
                className={cn(
                  "relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  s.done
                    ? "bg-success-bar text-white"
                    : isNow
                      ? "bg-primary text-white ring-4 ring-primary-soft"
                      : "border-2 border-input bg-background text-muted-foreground",
                )}
              >
                {s.done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "text-[13px] leading-5",
                      isNow ? "font-bold" : s.done ? "font-semibold" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                    <span className="sr-only">{s.done ? " (done)" : isNow ? " (now)" : ""}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[11px]",
                      isNow ? "font-semibold text-primary" : "text-muted-foreground",
                    )}
                  >
                    {isNow && current ? "Now · " : ""}
                    {s.who}
                  </span>
                </div>
                {isNow && current ? <div>{current}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {now === -1 && current ? current : null}
    </>
  );
}

/** "GreenFuture Energy (Pty) Ltd" → "GreenFuture Energy" */
function shortName(name: string) {
  return name.replace(/\s*\((pty|proprietary)\)\s*(ltd|limited)\.?$/i, "").trim();
}

function Contact({ c }: { c: ConversationView }) {
  const k = c.them.contact;
  if (!k.name && !k.email) return null;
  const initials = (k.name ?? c.them.name)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
      <h3 className="text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
        Contact at {c.them.name}
      </h3>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary"
        >
          {initials}
        </span>
        <div className="flex min-w-0 flex-col text-[13px]">
          <span className="truncate font-semibold">
            {k.name}
            {k.role ? <span className="font-normal text-muted-foreground"> · {k.role}</span> : null}
          </span>
          {k.phone ? <span className="text-muted-foreground">{k.phone}</span> : null}
        </div>
      </div>
      {k.email ? (
        <a
          href={`mailto:${k.email}`}
          className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-soft/50"
        >
          <Mail className="size-4" aria-hidden /> {k.email}
        </a>
      ) : null}
    </section>
  );
}
