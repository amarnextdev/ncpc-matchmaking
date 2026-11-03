"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Info, Sun } from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ENQUIRY_EXPIRY_DAYS, NOTE_MAX, ROLE_CATEGORIES, canPlay, rolesFor } from "../constants";
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

const categoriesText = (role: LookingFor) =>
  ROLE_CATEGORIES[role]
    .map((c) => labelFor(ORGANISATION_CATEGORIES, c).toLowerCase())
    .join(", ")
    .replace(/, ([^,]*)$/, " and $1");

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
 * TODO(Module 9): server action that creates the enquiry, notifies the owner and expires it after 30 days.
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
  const firstAllowed = projectRoles.find((r) => canPlay(viewerOrg.category, r));
  const partnerRoles = target.org.category ? rolesFor(target.org.category) : [];

  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const [ownProject, setOwnProject] = useState(GENERAL);
  const [role, setRole] = useState<LookingFor | undefined>(
    fromProject ? firstAllowed : partnerRoles[0],
  );

  const withOwnProject = !fromProject && ownProject !== GENERAL;
  const roleOptions = fromProject ? projectRoles : withOwnProject ? partnerRoles : [];
  const canSend = fromProject ? Boolean(firstAllowed && role) : true;
  const expires = formatDay(new Date(Date.now() + ENQUIRY_EXPIRY_DAYS * 86_400_000).toISOString());
  const projectTitle =
    target.project?.title ??
    viewerOrg.projects.find((p) => (p.slug ?? p.title) === ownProject)?.title;

  function reset(next: boolean) {
    setOpen(next);
    if (!next) {
      setSent(false);
      setNote("");
    }
  }

  function send() {
    setSent(true);
    toast.success(`Enquiry sent to ${target.org.name}`);
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
          "gap-0 p-0 sm:max-w-[580px]",
          "max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-b-none",
        )}
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3.5 px-7 pt-8 pb-7 text-center">
            <span className="flex size-[60px] items-center justify-center rounded-full bg-success-soft">
              <Check className="size-7 text-success" strokeWidth={2.5} aria-hidden />
            </span>
            <DialogTitle className="text-[22px]">Enquiry sent</DialogTitle>
            <DialogDescription className="max-w-[420px] text-[15px] leading-[23px]">
              {target.org.name} will be notified by email and in their bell. You can message each
              other as soon as they accept.
            </DialogDescription>
            <dl className="mt-1.5 w-full rounded-md border text-left text-sm">
              {projectTitle ? (
                <div className="flex justify-between gap-3 px-4 py-3">
                  <dt className="text-subtle-foreground">Project</dt>
                  <dd className="text-right font-semibold">{projectTitle}</dd>
                </div>
              ) : null}
              {role && roleOptions.length ? (
                <div className="flex justify-between gap-3 border-t border-muted px-4 py-3 first:border-t-0">
                  <dt className="text-subtle-foreground">Role</dt>
                  <dd className="font-semibold">{labelFor(LOOKING_FOR, role)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 border-t border-muted px-4 py-3 first:border-t-0">
                <dt className="text-subtle-foreground">Status</dt>
                <dd className="flex items-center gap-1.5 font-semibold text-warning">
                  <span aria-hidden className="size-2 rounded-full bg-[#C98A16]" />
                  Pending · expires {expires}
                </dd>
              </div>
            </dl>
            <div className="mt-1.5 flex w-full gap-2.5">
              <Button asChild variant="outline" className="flex-1">
                <Link href={routes.workspace.enquiries}>View my enquiries</Link>
              </Button>
              <Button className="flex-1" onClick={() => reset(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-muted px-6 pt-5 pb-4">
              <DialogTitle className="text-xl">Send enquiry</DialogTitle>
              <DialogDescription className="sr-only">
                Send an enquiry with a short note. You can message each other once it is accepted.
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-[18px] px-6 py-5">
              <div className="flex items-center gap-3">
                <OrgAvatar
                  initials={target.org.initials}
                  tint={target.org.tint}
                  className="size-12"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-base font-bold">
                    {target.org.name}
                    {target.org.verified ? <VerifiedBadge size="sm" /> : null}
                  </span>
                  <span className="text-[13px] text-subtle-foreground">{target.org.meta}</span>
                </div>
              </div>

              {target.project ? (
                <div className="flex items-center gap-3 rounded-md border bg-surface-subtle p-3">
                  <span
                    aria-hidden
                    className="flex size-[52px] shrink-0 items-center justify-center rounded-[10px] text-white"
                    style={{ backgroundColor: target.project.tint }}
                  >
                    <Sun className="size-[22px]" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs text-subtle-foreground">About this project</span>
                    <span className="text-[15px] font-bold">{target.project.title}</span>
                    <span className="text-[13px] text-muted-foreground">{target.project.meta}</span>
                  </div>
                </div>
              ) : viewerOrg.projects.length ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="enquiry-project" className="text-sm font-semibold">
                    About one of your projects{" "}
                    <span className="font-normal text-subtle-foreground">(optional)</span>
                  </label>
                  <Select value={ownProject} onValueChange={setOwnProject}>
                    <SelectTrigger id="enquiry-project" className="h-11 w-full">
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

              {roleOptions.length ? (
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-sm font-semibold">
                    {fromProject ? "You are enquiring as" : `${target.org.name} would join as`}
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roleOptions.map((r) => {
                      const ok = fromProject ? canPlay(viewerOrg.category, r) : true;
                      const on = ok && role === r;
                      return (
                        <label
                          key={r}
                          className={cn(
                            "flex items-start gap-2.5 rounded-md border px-3.5 py-3",
                            on ? "border-2 border-primary bg-primary-soft" : "border-border",
                            ok ? "cursor-pointer" : "cursor-not-allowed opacity-55",
                          )}
                        >
                          <input
                            type="radio"
                            name="enquiry-role"
                            className="mt-0.5 size-4 accent-primary"
                            checked={on}
                            disabled={!ok}
                            onChange={() => setRole(r)}
                          />
                          <span className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold">
                              {labelFor(LOOKING_FOR, r)}
                            </span>
                            <span className="text-xs text-subtle-foreground">
                              {ok
                                ? fromProject
                                  ? "Matches your organisation"
                                  : "Their role on your project"
                                : `For ${categoriesText(r)}`}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {fromProject ? (
                    <span className="text-xs text-subtle-foreground">
                      This project is looking for:{" "}
                      {projectRoles.map((r) => labelFor(LOOKING_FOR, r)).join(", ")}
                    </span>
                  ) : null}
                </fieldset>
              ) : null}

              {fromProject && !firstAllowed ? (
                <p className="rounded-md bg-warning-soft px-4 py-3 text-sm leading-5 text-warning">
                  This project is not looking for a{" "}
                  {labelFor(ORGANISATION_CATEGORIES, viewerOrg.category).toLowerCase()} right now.
                  You can still contact {target.org.name} from their profile.
                </p>
              ) : null}

              {target.match ? (
                <div className="flex gap-3 rounded-md bg-success-soft px-4 py-3.5">
                  <span className="shrink-0 text-[22px] leading-[26px] font-bold text-success">
                    {target.match.score}%
                  </span>
                  <ul className="flex flex-col gap-1 text-[13px] leading-[19px] text-[#1F4F0C]">
                    {target.match.reasons.slice(0, 3).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <label htmlFor="enquiry-note" className="text-sm font-semibold">
                  Add a note <span className="font-normal text-subtle-foreground">(optional)</span>
                </label>
                <Textarea
                  id="enquiry-note"
                  rows={4}
                  maxLength={NOTE_MAX}
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                  placeholder="Say who you are and what you would like to discuss."
                  className="resize-none"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  {QUICK_NOTES.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setNote(q.text)}
                      className="h-[30px] rounded-full border px-3 text-xs font-medium text-foreground/80 hover:border-primary hover:text-primary"
                    >
                      {q.label}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-subtle-foreground" aria-live="polite">
                    {note.length}/{NOTE_MAX}
                  </span>
                </div>
              </div>

              <p className="flex gap-2 text-[13px] leading-[19px] text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0 text-subtle-foreground" aria-hidden />
                If {target.org.name} accepts, you will be connected and can message each other.
                Enquiries without a reply expire after {ENQUIRY_EXPIRY_DAYS} days.
              </p>
            </div>

            <DialogFooter className="border-t border-muted px-6 pt-4 pb-5 max-sm:flex-row">
              <Button variant="outline" className="max-sm:flex-1" onClick={() => reset(false)}>
                Cancel
              </Button>
              <Button className="max-sm:flex-1" disabled={!canSend} onClick={send}>
                Send enquiry
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
