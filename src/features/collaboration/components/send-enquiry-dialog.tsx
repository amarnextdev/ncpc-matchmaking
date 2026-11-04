"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Check, Clock3, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { LOOKING_FOR, ORGANISATION_CATEGORIES, labelFor, type LookingFor } from "@/lib/constants";
import { formatDay } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ViewerOrg } from "@/types";
import { sendEnquiryAction } from "../actions";
import { ENQUIRY_EXPIRY_DAYS, NOTE_MAX, canPlay, rolesFor } from "../constants";
import type { EnquiryTarget } from "../types";
import { OrgAvatar } from "./org-avatar";

const GENERAL = "__general";

const QUICK_NOTES = [
  {
    label: "Ask for the financial model",
    text: "Hello, we are interested in this project. Could you share your financial model and feasibility study?",
  },
  {
    label: "Suggest a call",
    text: "Hello, we would like to set up a short call to learn more and see how we could work together.",
  },
  {
    label: "Introduce us",
    text: "Hello, we would like to introduce our organisation and discuss how we could work together.",
  },
];

const ROLE_HELP: Record<LookingFor, string> = {
  investor: "Equity or debt into the project",
  funder: "Grant, loan or guarantee",
  technology: "Supply or install the technology",
  contractor: "Build, install or maintain",
  site_host: "Provide the site or roof space",
  off_taker: "Buy the power, water or output",
};

type Props = {
  target: EnquiryTarget;
  viewerOrg: ViewerOrg;
  size?: "sm" | "default" | "lg";
  inverse?: boolean;
  className?: string;
};

/**
 * "Send enquiry" button + dialog (bottom sheet on phones), like a LinkedIn invitation with a note.
 * From a project page the project is fixed and the role comes from its "Looking for";
 * from an organisation profile the project is optional.
 */
export function SendEnquiryDialog({
  target,
  viewerOrg,
  size = "default",
  inverse,
  className,
}: Props) {
  const fromProject = Boolean(target.project);
  const projectRoles = target.project?.lookingFor ?? [];
  const allowed = fromProject
    ? projectRoles.filter((r) => canPlay(viewerOrg.category, r))
    : target.org.category
      ? rolesFor(target.org.category)
      : [];
  const blocked = fromProject ? projectRoles.filter((r) => !canPlay(viewerOrg.category, r)) : [];

  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<{ expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [ownProject, setOwnProject] = useState(GENERAL);
  const [role, setRole] = useState<LookingFor | undefined>(allowed[0]);
  const [pending, start] = useTransition();

  const canSend = Boolean(role) && !pending;
  const projectTitle =
    target.project?.title ??
    viewerOrg.projects.find((p) => (p.slug ?? p.title) === ownProject)?.title;
  const myCategory = labelFor(ORGANISATION_CATEGORIES, viewerOrg.category).toLowerCase();

  function reset(next: boolean) {
    setOpen(next);
    if (!next) {
      setSent(null);
      setError(null);
      setNote("");
    }
  }

  function send() {
    if (!role) return;
    setError(null);
    start(async () => {
      const result = await sendEnquiryAction({
        toOrgSlug: target.org.slug,
        projectSlug: target.project?.slug ?? null,
        role,
        note,
      }).catch(() => ({
        ok: false as const,
        error: "We could not send the enquiry. Please try again.",
      }));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent({ expiresAt: result.expiresAt });
      toast.success(`Enquiry sent to ${target.org.name}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button
          size={size}
          className={cn(inverse && "bg-white font-bold text-primary hover:bg-white/90", className)}
        >
          Send enquiry
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]",
          "max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-b-none",
        )}
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3 px-7 pt-9 pb-7 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success-soft">
              <Check className="size-7 text-success" strokeWidth={2.5} aria-hidden />
            </span>
            <DialogTitle className="mt-1 text-[22px]">Enquiry sent</DialogTitle>
            <DialogDescription className="max-w-[400px] text-[15px] leading-[23px]">
              {target.org.name} gets an email and a notification. You can message each other as soon
              as they accept.
            </DialogDescription>
            <dl className="mt-2 w-full divide-y rounded-xl border text-left text-sm">
              {projectTitle ? (
                <div className="flex justify-between gap-3 px-4 py-3">
                  <dt className="text-muted-foreground">Project</dt>
                  <dd className="text-right font-semibold">{projectTitle}</dd>
                </div>
              ) : null}
              {role ? (
                <div className="flex justify-between gap-3 px-4 py-3">
                  <dt className="text-muted-foreground">You enquired as</dt>
                  <dd className="font-semibold">{labelFor(LOOKING_FOR, role)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 px-4 py-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-warning">
                  <span aria-hidden className="size-2 rounded-full bg-current" />
                  Waiting · expires {formatDay(sent.expiresAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-2 flex w-full gap-2.5">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`${routes.workspace.network}?tab=invitations&view=sent`}>
                  View my enquiries
                </Link>
              </Button>
              <Button className="flex-1" onClick={() => reset(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b px-6 pt-5 pr-14 pb-4">
              <DialogTitle className="text-xl">Send enquiry</DialogTitle>
              <DialogDescription className="mt-0.5 text-sm">
                Introduce yourself. If they accept, you are connected and can message each other.
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              {/* Recipient (+ project) */}
              <div className="overflow-hidden rounded-xl border">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {target.org.logoUrl ? (
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-[10px] border bg-white">
                      <Image
                        src={target.org.logoUrl}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <OrgAvatar initials={target.org.initials} tint={target.org.tint} />
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-1.5 text-[15px] font-bold">
                      <span className="truncate">{target.org.name}</span>
                      {target.org.verified ? <VerifiedBadge size="sm" /> : null}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {target.org.meta}
                    </span>
                  </div>
                </div>
                {target.project ? (
                  <div className="flex items-center gap-3 border-t bg-surface-subtle px-4 py-3">
                    <span
                      className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg"
                      style={{ backgroundColor: target.project.tint }}
                    >
                      {target.project.coverUrl ? (
                        <Image
                          src={target.project.coverUrl}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-xs text-muted-foreground">About this project</span>
                      <span className="truncate text-sm font-semibold">{target.project.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {target.project.meta}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Own project (from a profile) */}
              {!fromProject && viewerOrg.projects.length ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="enquiry-project" className="text-sm font-semibold">
                    About one of your projects{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Select value={ownProject} onValueChange={setOwnProject}>
                    <SelectTrigger id="enquiry-project" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GENERAL}>General enquiry (no project)</SelectItem>
                      {viewerOrg.projects.map((p) => (
                        <SelectItem key={p.title} value={p.slug ?? p.title}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {/* Role */}
              {allowed.length ? (
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-2.5 text-sm font-semibold">
                    {fromProject ? "You are enquiring as" : `${target.org.name} would join as`}
                  </legend>
                  <div
                    role="radiogroup"
                    className={cn("grid gap-2", allowed.length > 1 && "sm:grid-cols-2")}
                  >
                    {allowed.map((r) => {
                      const on = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setRole(r)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                            on
                              ? "border-primary bg-primary-soft ring-1 ring-primary"
                              : "hover:border-subtle-foreground",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                              on ? "border-primary bg-primary text-white" : "border-input",
                            )}
                          >
                            {on ? <Check className="size-3" strokeWidth={3.5} /> : null}
                          </span>
                          <span className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {labelFor(LOOKING_FOR, r)}
                            </span>
                            <span className="text-xs text-muted-foreground">{ROLE_HELP[r]}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {blocked.length ? (
                    <p className="text-xs text-muted-foreground">
                      Also looking for: {blocked.map((r) => labelFor(LOOKING_FOR, r)).join(", ")}{" "}
                      (other organisation types)
                    </p>
                  ) : null}
                </fieldset>
              ) : fromProject ? (
                <p className="flex gap-2.5 rounded-xl bg-warning-soft px-4 py-3 text-sm leading-5 text-warning">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  This project isn&apos;t looking for a {myCategory} right now. You can still
                  contact {target.org.name} from their profile.
                </p>
              ) : null}

              {target.match ? (
                <div className="flex gap-3 rounded-xl bg-success-soft px-4 py-3.5">
                  <span className="shrink-0 text-[22px] leading-[26px] font-bold text-success">
                    {target.match.score}%
                  </span>
                  <ul className="flex flex-col gap-1 text-[13px] leading-[19px] text-success">
                    {target.match.reasons.slice(0, 3).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Note */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="enquiry-note" className="text-sm font-semibold">
                    Add a note <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
                    {note.length}/{NOTE_MAX}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_NOTES.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setNote(q.text)}
                      className={cn(
                        "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                        note === q.text
                          ? "border-primary bg-primary-soft text-primary"
                          : "text-foreground/80 hover:border-primary/50 hover:text-primary",
                      )}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  id="enquiry-note"
                  rows={4}
                  maxLength={NOTE_MAX}
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                  placeholder="Say who you are and what you would like to discuss."
                  className="resize-none"
                />
              </div>

              {error ? (
                <p
                  role="alert"
                  className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {error}
                </p>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 border-t bg-surface-subtle px-6 py-4">
              <span className="flex flex-1 items-center gap-1.5 text-xs text-muted-foreground max-sm:basis-full">
                <Clock3 className="size-3.5 shrink-0" aria-hidden />
                Expires after {ENQUIRY_EXPIRY_DAYS} days without a reply
              </span>
              <Button variant="outline" className="max-sm:flex-1" onClick={() => reset(false)}>
                Cancel
              </Button>
              <Button className="max-sm:flex-1" disabled={!canSend} onClick={send}>
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
                {pending ? "Sending…" : "Send enquiry"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
