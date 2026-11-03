"use client";

import { FileText, Info, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOOKING_FOR, labelFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { DEAL_STAGES } from "../../constants";
import type { ConversationView, Deal, DealDocument } from "../../types";
import { dealStageLabel } from "../../views";

const DOC_TONE: Record<DealDocument["status"], string> = {
  reviewed: "bg-success-soft text-success",
  uploaded: "bg-primary-soft text-primary",
  requested: "bg-warning-soft text-warning",
};
const DOC_LABEL: Record<DealDocument["status"], string> = {
  reviewed: "Reviewed",
  uploaded: "Uploaded",
  requested: "Requested",
};
const MEETING_TONE = {
  confirmed: "bg-primary-soft text-primary",
  done: "bg-success-soft text-success",
  proposed: "bg-warning-soft text-warning",
};

const soon = (what: string) => toast.info(`${what} comes in the next step of this module.`);

/**
 * Right column (desktop) / sheet (mobile): one deal per project with this organisation.
 * Stage, documents (Requested → Uploaded → Reviewed), meetings, key terms, private notes, contact.
 * The project owner sends the collaboration request; the partner confirms it.
 */
export function DealPanel({
  conversation: c,
  deal,
  onDealChange,
  isStarted,
  onStartDeal,
  docStatus,
  onDocStatus,
}: {
  conversation: ConversationView;
  deal: Deal;
  onDealChange: (id: string) => void;
  isStarted: (deal: Deal) => boolean;
  onStartDeal: (dealId: string) => void;
  docStatus: (deal: Deal, doc: DealDocument) => DealDocument["status"];
  onDocStatus: (deal: Deal, doc: DealDocument, status: DealDocument["status"]) => void;
}) {
  const isOwner = deal.ownerSlug === c.me.slug;
  const started = isStarted(deal);
  const stage = started && deal.stage === "not_started" ? "in_discussion" : deal.stage;
  const at = DEAL_STAGES.findIndex((s) => s.value === stage);
  const docs = deal.documents.map((d) => ({ ...d, status: docStatus(deal, d) }));
  const reviewed = docs.filter((d) => d.status === "reviewed").length;
  const partnerName = isOwner ? c.them.name : c.me.name;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-[18px] pt-[18px] pb-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="deal-pick" className="text-eyebrow">
            Deals with {c.them.name}
          </label>
          <Select value={deal.id} onValueChange={onDealChange}>
            <SelectTrigger id="deal-pick" className="h-11 w-full font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {c.deals.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.projectTitle} ·{" "}
                  {isStarted(d) && d.stage === "not_started" ? "In discussion" : dealStageLabel(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-subtle-foreground">
            {partnerName} as {labelFor(LOOKING_FOR, deal.role)} ·{" "}
            {isOwner ? "your project" : `${c.them.name}'s project`}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-bold">Stage</span>
          <ol className="grid grid-cols-4 gap-1">
            {DEAL_STAGES.map((s, i) => (
              <li
                key={s.value}
                className="flex flex-col gap-1.5"
                aria-current={i === at ? "step" : undefined}
              >
                <span
                  className={cn(
                    "h-1.5 rounded-full",
                    i < at ? "bg-success" : i === at ? "bg-primary" : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] leading-[14px]",
                    i === at ? "font-bold text-foreground" : "text-subtle-foreground",
                  )}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {started ? (
          <>
            <section className="flex flex-col gap-2.5" aria-labelledby="deal-docs">
              <div className="flex items-center justify-between gap-2">
                <h3 id="deal-docs" className="text-sm font-bold">
                  Documents
                  {docs.length ? (
                    <span className="font-medium text-subtle-foreground">
                      {" "}
                      · {reviewed} of {docs.length} reviewed
                    </span>
                  ) : null}
                </h3>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="h-[30px] px-3 text-xs"
                  onClick={() => soon(isOwner ? "Uploading documents" : "Requesting documents")}
                >
                  {isOwner ? "Upload" : "Request"}
                </Button>
              </div>
              {docs.length ? (
                <ul className="rounded-md border">
                  {docs.map((d, i) => {
                    const action =
                      !isOwner && d.status === "uploaded"
                        ? { label: "Mark reviewed", next: "reviewed" as const }
                        : isOwner && d.status === "requested"
                          ? { label: "Upload", next: "uploaded" as const }
                          : null;
                    return (
                      <li
                        key={d.name}
                        className={cn("flex items-center gap-2.5 px-3 py-2.5", i && "border-t")}
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-primary-soft">
                          <FileText className="size-3.5 text-primary" aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[13px] font-semibold">{d.name}</span>
                          <span className="text-[11px] text-subtle-foreground">{d.meta}</span>
                        </span>
                        {action ? (
                          <Button
                            size="sm"
                            className="h-7 px-2.5 text-[11px]"
                            onClick={() => onDocStatus(deal, d, action.next)}
                          >
                            {action.label}
                          </Button>
                        ) : (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              DOC_TONE[d.status],
                            )}
                          >
                            {DOC_LABEL[d.status]}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-md border border-dashed px-3 py-4 text-center text-[13px] text-subtle-foreground">
                  No documents yet.
                </p>
              )}
            </section>

            <section className="flex flex-col gap-2.5" aria-labelledby="deal-meetings">
              <div className="flex items-center justify-between gap-2">
                <h3 id="deal-meetings" className="text-sm font-bold">
                  Meetings
                </h3>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="h-[30px] px-3 text-xs"
                  onClick={() => soon("Proposing a meeting")}
                >
                  Propose meeting
                </Button>
              </div>
              {deal.meetings.length ? (
                <ul className="flex flex-col gap-2">
                  {deal.meetings.map((m) => (
                    <li
                      key={m.title}
                      className="flex items-center gap-2.5 rounded-md bg-surface-subtle px-3 py-2.5"
                    >
                      <span className="flex w-10 shrink-0 flex-col text-center">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            m.status === "done" ? "text-subtle-foreground" : "text-destructive",
                          )}
                        >
                          {m.month}
                        </span>
                        <span
                          className={cn(
                            "text-[17px] font-bold",
                            m.status === "done" && "text-subtle-foreground",
                          )}
                        >
                          {m.day}
                        </span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[13px] font-semibold">{m.title}</span>
                        <span className="text-xs text-subtle-foreground">{m.when}</span>
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
                          MEETING_TONE[m.status],
                        )}
                      >
                        {m.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-subtle-foreground">No meetings yet.</p>
              )}
            </section>

            <section className="flex flex-col gap-2.5" aria-labelledby="deal-terms">
              <div className="flex items-center justify-between gap-2">
                <h3 id="deal-terms" className="text-sm font-bold">
                  Key terms
                </h3>
                <button
                  type="button"
                  onClick={() => soon("Editing key terms")}
                  className="p-1 text-xs font-semibold text-primary hover:underline"
                >
                  {deal.terms.length ? "Edit" : "Add"}
                </button>
              </div>
              {deal.terms.length ? (
                <dl className="grid grid-cols-3 gap-1.5">
                  {deal.terms.map((t) => (
                    <div key={t.label} className="rounded-[10px] bg-surface-subtle p-2.5">
                      <dt className="text-[11px] text-subtle-foreground">{t.label}</dt>
                      <dd className="mt-0.5 truncate text-[15px] font-bold">{t.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-[13px] text-subtle-foreground">
                  Add the terms you agree on as you go.
                </p>
              )}
              {deal.termsNote ? (
                <p className="text-xs leading-[17px] text-subtle-foreground">{deal.termsNote}</p>
              ) : null}
            </section>

            <section className="flex flex-col gap-2">
              <label
                htmlFor={`notes-${deal.id}`}
                className="flex items-center gap-1.5 text-sm font-bold"
              >
                Private notes <Lock className="size-3.5 text-subtle-foreground" aria-hidden />
              </label>
              <Textarea
                id={`notes-${deal.id}`}
                key={deal.id}
                rows={3}
                defaultValue={deal.notes[c.me.slug] ?? ""}
                placeholder={`Only ${c.me.name} can see these notes.`}
                className="resize-none text-[13px]"
              />
            </section>

            <section
              className="flex flex-col gap-1 text-[13px] text-foreground/80"
              aria-labelledby="deal-contact"
            >
              <h3 id="deal-contact" className="mb-1 text-sm font-bold text-foreground">
                Contact
              </h3>
              <span>
                <strong>{c.them.contact.name}</strong> · {c.them.contact.role}
              </span>
              <a href={`mailto:${c.them.contact.email}`} className="text-primary hover:underline">
                {c.them.contact.email}
              </a>
              <span>{c.them.contact.phone}</span>
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed px-3 py-7 text-center">
            <span className="text-[15px] font-bold">No deal on this project yet</span>
            <span className="text-[13px] leading-[19px] text-muted-foreground">
              {isOwner
                ? `You shared this project with ${c.them.name}. A deal opens when they start one.`
                : `${c.them.name} shared this project with you. Start a deal to discuss it here, with its own documents and terms.`}
            </span>
            {!isOwner ? <Button onClick={() => onStartDeal(deal.id)}>Start a deal</Button> : null}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t px-[18px] pt-3.5 pb-4">
        {started && stage !== "active" ? (
          isOwner ? (
            <>
              <Button size="lg" onClick={() => soon("The collaboration request form")}>
                Send collaboration request
              </Button>
              <span className="text-center text-xs leading-[17px] text-subtle-foreground">
                {c.them.name} reviews the terms and accepts. The partnership then shows on your
                project.
              </span>
            </>
          ) : (
            <p className="flex gap-2.5 rounded-md bg-primary-soft p-3 text-xs leading-[18px] text-primary">
              <Info className="mt-px size-4 shrink-0" aria-hidden />
              When the terms are agreed, {c.them.name} sends you a collaboration request to confirm.
            </p>
          )
        ) : null}
        {stage === "active" ? (
          <p className="rounded-md bg-success-soft p-3 text-center text-xs font-semibold text-success">
            Active partnership · shown on the project page
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => soon("Closing a conversation")}
          className="p-1.5 text-[13px] font-semibold text-subtle-foreground hover:text-foreground"
        >
          Close conversation
        </button>
      </div>
    </div>
  );
}
