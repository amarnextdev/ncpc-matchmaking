"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  CircleAlert,
  FolderKanban,
  FolderPlus,
  Handshake,
  Info,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOOKING_FOR, labelFor, type LookingFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  addProjectDealAction,
  sendCollabRequestAction,
  submitOfferAction,
} from "../../deal-actions";
import { useDealRun } from "../../deal-sync";
import type { AddableProject, ConversationView } from "../../types";
import { OFFER_FIELDS, offerSchema, type OfferField, type OfferValues } from "../../forms";

const shell = "flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[540px]";

/** Owner → partner: "Collaboration request" with what they will be asked for. */
export function CollabRequestDialog({
  open,
  onOpenChange,
  dealId,
  partner,
  role,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dealId: string;
  partner: string;
  role: LookingFor;
}) {
  const [message, setMessage] = useState("");
  const { busy, run } = useDealRun();
  const pending = busy !== null;
  const fields = OFFER_FIELDS[role];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={shell}>
        <div className="border-b px-6 pt-5 pr-14 pb-4">
          <DialogTitle className="text-xl">Collaboration request</DialogTitle>
          <DialogDescription className="mt-0.5">
            {partner} will fill in their offer as {labelFor(LOOKING_FOR, role).toLowerCase()}.
          </DialogDescription>
        </div>
        <div className="flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-4 overflow-y-auto px-6 py-5">
          <div>
            <p className="text-sm font-semibold">They will be asked for</p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {fields.map((f) => (
                <li
                  key={f.key}
                  className="flex items-center gap-1.5 text-[13px] text-foreground/80"
                >
                  <Check className="size-3.5 text-success" strokeWidth={2.6} aria-hidden />{" "}
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            <span>
              Message <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <Textarea
              rows={3}
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Thanks for the call. Please share your term sheet."
              className="resize-none font-normal"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2.5 border-t bg-surface-subtle px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={pending}
            onClick={() =>
              void run("request", () => sendCollabRequestAction({ dealId, message }), {
                success: `Request sent to ${partner}`,
                onDone: () => onOpenChange(false),
              })
            }
          >
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Send request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Partner fills in their offer (role-specific fields). */
export function OfferFormDialog({
  open,
  onOpenChange,
  requestId,
  role,
  owner,
  project,
  ownerNote,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  requestId: string;
  role: LookingFor;
  owner: string;
  project: string;
  ownerNote: string | null;
  initial: OfferValues | null;
}) {
  const fields = OFFER_FIELDS[role];
  const [values, setValues] = useState<OfferValues>(() =>
    Object.fromEntries(
      Object.entries(initial ?? {}).map(([k, v]) => [
        k,
        fields.find((f) => f.key === k)?.kind === "money" && typeof v === "string"
          ? groupDigits(v)
          : v,
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { busy, run } = useDealRun();
  const pending = busy !== null;
  const set = (k: string, v: string | string[]) => {
    setValues((s) => ({ ...s, [k]: v }));
    setFieldErrors((e) => {
      if (!e[k]) return e;
      const next = { ...e };
      delete next[k];
      return next;
    });
  };

  function submit() {
    setError(null);
    // Fields never touched are empty, so each one gets its own message instead of a bare "Required".
    const filled: OfferValues = Object.fromEntries(
      fields.map((f) => [f.key, values[f.key] ?? (f.kind === "multi" ? [] : "")]),
    );
    const parsed = offerSchema(role).safeParse(filled);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = String(i.path[0] ?? "");
        if (k && !errs[k]) errs[k] = i.message;
      }
      setFieldErrors(errs);
      const first = fields.find((f) => errs[f.key]);
      if (first)
        document
          .getElementById(`offer-${first.key}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    void run(
      "offer",
      async () => {
        const r = await submitOfferAction({ requestId, form: parsed.data });
        if (!r.ok) setError(r.error);
        return r;
      },
      { success: `Offer sent to ${owner}`, onDone: () => onOpenChange(false) },
    );
  }

  const required = fields.filter((f) => "required" in f && f.required);
  const done = required.filter((f) => {
    const v = filledValue(values[f.key]);
    return v !== "";
  }).length;
  const main = fields.filter((f) => "required" in f && f.required);
  const extra = fields.filter((f) => !("required" in f && f.required));

  const renderField = (f: OfferField) => {
    const id = `offer-${f.key}`;
    const v = values[f.key];
    const err = fieldErrors[f.key];
    const errId = `${id}-error`;
    const isRequired = "required" in f && f.required;
    const label = (
      <span className="text-sm font-semibold">
        {f.label}
        {isRequired ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
    );
    const errorText = err ? (
      <span
        id={errId}
        role="alert"
        className="flex items-center gap-1 text-xs font-medium text-destructive"
      >
        <CircleAlert className="size-3.5" aria-hidden /> {err}
      </span>
    ) : null;
    const describedBy = err ? errId : undefined;

    if (f.kind === "choice") {
      return (
        <fieldset
          key={f.key}
          id={id}
          aria-describedby={describedBy}
          className="flex flex-col gap-2"
        >
          <legend className="mb-2">{label}</legend>
          <div role="radiogroup" className="grid grid-cols-2 gap-2">
            {f.options.map((o) => {
              const on = v === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set(f.key, o.value)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
                    on
                      ? "border-primary bg-primary-soft/60 ring-1 ring-primary"
                      : err
                        ? "border-destructive/50 hover:border-primary/50"
                        : "border-input hover:border-primary/50 hover:bg-muted/40",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                      on ? "border-primary" : "border-input",
                    )}
                  >
                    {on ? <span className="size-2 rounded-full bg-primary" /> : null}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[13px] font-semibold">{o.label}</span>
                    {o.hint ? (
                      <span className="text-[11px] leading-4 text-muted-foreground">{o.hint}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          {errorText}
        </fieldset>
      );
    }

    if (f.kind === "multi") {
      const list = Array.isArray(v) ? v : [];
      return (
        <fieldset key={f.key} id={id} className="flex flex-col gap-2">
          <legend className="mb-2">{label}</legend>
          <div className="flex flex-col divide-y rounded-xl border">
            {f.options.map((o) => {
              const on = list.includes(o.value);
              const cid = `${id}-${o.value}`;
              return (
                <label
                  key={o.value}
                  htmlFor={cid}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3.5 py-3 text-[13px] transition-colors first:rounded-t-xl last:rounded-b-xl",
                    on ? "bg-primary-soft/50 font-medium" : "hover:bg-muted/40",
                  )}
                >
                  <Checkbox
                    id={cid}
                    checked={on}
                    onCheckedChange={() =>
                      set(f.key, on ? list.filter((x) => x !== o.value) : [...list, o.value])
                    }
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      );
    }

    if (f.kind === "month") {
      const current = typeof v === "string" ? v : "";
      return (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label htmlFor={id}>{label}</label>
          <Select
            value={current || NOT_SURE}
            onValueChange={(x) => set(f.key, x === NOT_SURE ? "" : x)}
          >
            <SelectTrigger
              id={id}
              aria-describedby={describedBy}
              className="w-full justify-start *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:text-left sm:max-w-[260px]"
            >
              <CalendarDays className="text-muted-foreground" aria-hidden />
              <SelectValue placeholder="Choose a month" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={NOT_SURE}>Not sure yet</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorText}
        </div>
      );
    }

    const text = typeof v === "string" ? v : "";
    return (
      <div key={f.key} className="flex flex-col gap-1.5">
        <label htmlFor={id}>{label}</label>
        {f.kind === "textarea" ? (
          <div className="relative">
            <Textarea
              id={id}
              rows={4}
              maxLength={2000}
              value={text}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={"placeholder" in f ? f.placeholder : undefined}
              aria-invalid={Boolean(err)}
              aria-describedby={describedBy}
              className="min-h-[104px] resize-none pb-6"
            />
            <span className="pointer-events-none absolute right-3 bottom-2 text-[11px] text-subtle-foreground tabular-nums">
              {text.length} / 2000
            </span>
          </div>
        ) : (
          <div className="relative">
            {f.kind === "money" ? (
              <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center rounded-l-md border-r bg-muted text-sm font-bold text-muted-foreground">
                R
              </span>
            ) : null}
            <Input
              id={id}
              type="text"
              inputMode={f.kind === "money" ? "numeric" : undefined}
              value={text}
              onChange={(e) =>
                set(f.key, f.kind === "money" ? groupDigits(e.target.value) : e.target.value)
              }
              placeholder={
                f.kind === "money" ? "0" : "placeholder" in f ? f.placeholder : undefined
              }
              aria-invalid={Boolean(err)}
              aria-describedby={describedBy}
              className={cn(
                f.kind === "money" && "h-11 pl-[52px] text-base font-semibold tabular-nums",
              )}
            />
          </div>
        )}
        {f.kind === "textarea" && TERM_HINTS[f.key]?.[role] ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Add:</span>
            {TERM_HINTS[f.key]![role]!.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  set(f.key, text.trim() ? `${text.trimEnd()}\n${h}: ` : `${h}: `);
                  requestAnimationFrame(() => {
                    const el = document.getElementById(id) as HTMLTextAreaElement | null;
                    el?.focus();
                    el?.setSelectionRange(el.value.length, el.value.length);
                  });
                }}
                className="rounded-full border border-dashed border-input px-2.5 py-0.5 text-[11px] font-semibold text-foreground/80 transition-colors hover:border-primary hover:text-primary"
              >
                + {h}
              </button>
            ))}
          </div>
        ) : null}
        {f.kind === "money" && moneyWords(text) ? (
          <span className="text-xs text-muted-foreground">{moneyWords(text)}</span>
        ) : "help" in f && f.help ? (
          <span className="text-xs text-muted-foreground">{f.help}</span>
        ) : null}
        {errorText}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={shell}>
        <div className="border-b px-6 pt-5 pr-14 pb-4">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary uppercase">
            <Handshake className="size-3.5" aria-hidden /> Collaboration offer
          </span>
          <DialogTitle className="text-xl">
            Your offer as {labelFor(LOOKING_FOR, role).toLowerCase()}
          </DialogTitle>
          <DialogDescription className="mt-0.5">
            For <span className="font-semibold text-foreground">{project}</span> · {owner}
          </DialogDescription>
        </div>
        <div className="flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-5 overflow-y-auto px-6 py-5">
          {ownerNote ? (
            <div className="flex gap-2.5">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white"
              >
                {initials(owner)}
              </span>
              <div className="min-w-0 rounded-2xl rounded-tl-sm border bg-surface-subtle px-3.5 py-2.5">
                <p className="text-[11px] font-semibold text-muted-foreground">{owner} wrote</p>
                <p className="text-[13px] leading-5">{ownerNote}</p>
              </div>
            </div>
          ) : null}

          <section aria-labelledby="offer-main" className="flex flex-col gap-4">
            <h3 id="offer-main" className="sr-only">
              Your offer
            </h3>
            {main.map(renderField)}
          </section>

          {extra.length ? (
            <section aria-labelledby="offer-extra" className="flex flex-col gap-4 border-t pt-5">
              <div>
                <h3 id="offer-extra" className="text-sm font-bold">
                  More detail <span className="font-normal text-muted-foreground">(optional)</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Helps {owner} compare offers. You can add it later in the chat.
                </p>
              </div>
              {extra.map(renderField)}
            </section>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 border-t bg-surface-subtle px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-success-bar transition-all"
                style={{ width: `${required.length ? (done / required.length) * 100 : 100}%` }}
              />
            </div>
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-semibold tabular-nums",
                done === required.length ? "text-success" : "text-muted-foreground",
              )}
            >
              {done === required.length ? (
                <>
                  <Check className="size-3.5" strokeWidth={3} aria-hidden /> Ready to send
                </>
              ) : (
                `${done} of ${required.length} required filled`
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex flex-1 items-start gap-1.5 text-xs leading-4 text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden /> Not binding. You sign the
              real agreement outside the platform.
            </span>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={pending} onClick={submit} className="px-5">
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}{" "}
              Send offer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const NOT_SURE = "not_sure";

/** Quick-add labels under a text box, per field and role. */
const TERM_HINTS: Record<string, Partial<Record<LookingFor, string[]>>> = {
  terms: {
    investor: ["Stake", "Tranches", "Board seat", "Target return"],
    funder: ["Rate", "Tenor", "Repayment", "Reporting"],
    site_host: ["Rent", "Lease length", "Who pays what"],
  },
  scope: {
    technology: ["Equipment", "Capacity", "Installation"],
    contractor: ["Phases", "Team", "Exclusions"],
  },
};
const monthLabel = new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" });
/** The next 36 months, as YYYY-MM. */
const MONTHS = Array.from({ length: 36 }, (_, i) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
  return {
    value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: monthLabel.format(d),
  };
});

const filledValue = (v: string | string[] | undefined) =>
  Array.isArray(v) ? (v.length ? "x" : "") : (v ?? "").trim();

/** "7000000" → "7 000 000" while typing. */
function groupDigits(raw: string) {
  const digits = raw
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, 13);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** "7 000 000" → "R7 million". */
function moneyWords(v: string) {
  const n = Number(v.replace(/\D/g, ""));
  if (!n) return "";
  if (n >= 1e9) return `R${+(n / 1e9).toFixed(2)} billion`;
  if (n >= 1e6) return `R${+(n / 1e6).toFixed(2)} million`;
  if (n >= 1e3) return `R${+(n / 1e3).toFixed(1)} thousand`;
  return "";
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** "GreenFuture Energy (Pty) Ltd" → "GreenFuture Energy" */
const short = (name: string) =>
  name.replace(/\s*\((pty|proprietary)\)\s*(ltd|limited)\.?$/i, "").trim();

const compactRand = (n: number) =>
  n >= 1e9
    ? `R${+(n / 1e9).toFixed(1)}bn`
    : n >= 1e6
      ? `R${+(n / 1e6).toFixed(1)}m`
      : `R${Math.round(n / 1e3)}k`;

/**
 * Already connected: start a deal on another live project of either side, no new enquiry.
 * The other side becomes the partner in a role the project still needs.
 */
export function AddProjectDialog({
  open,
  onOpenChange,
  conversation: c,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conversation: ConversationView;
  onAdded: (dealId: string) => void;
}) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [role, setRole] = useState<LookingFor | null>(null);
  const { busy, run } = useDealRun();
  const pending = busy !== null;
  const mine = c.addable.filter((p) => p.ownerIsMe);
  const theirs = c.addable.filter((p) => !p.ownerIsMe);
  const chosen = c.addable.find((p) => p.projectId === projectId) ?? null;
  const them = short(c.them.name);
  const owner = chosen ? (chosen.ownerIsMe ? "You" : them) : "";
  const partner = chosen ? (chosen.ownerIsMe ? them : "You") : "";

  function pick(p: AddableProject) {
    setProjectId(p.projectId);
    setRole(p.roles.length === 1 ? p.roles[0]! : null);
  }

  function close(v: boolean) {
    onOpenChange(v);
    if (!v) {
      setProjectId(null);
      setRole(null);
    }
  }

  function submit() {
    if (!chosen || !role) return;
    void run(
      "add",
      () => addProjectDealAction({ conversationId: c.id, projectId: chosen.projectId, role }),
      {
        success: `Deal started on ${chosen.title}`,
        onDone: (r) => {
          close(false);
          onAdded(r.dealId);
        },
      },
    );
  }

  const card = (p: AddableProject) => {
    const on = p.projectId === projectId;
    const meta = [p.theme, p.location, p.capitalNeeded ? compactRand(p.capitalNeeded) : null]
      .filter(Boolean)
      .join(" · ");
    return (
      <div
        key={p.projectId}
        className={cn(
          "overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow]",
          on ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]" : "hover:border-primary/40",
        )}
      >
        <button
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => pick(p)}
          className="flex w-full items-center gap-3 p-3 text-left focus-visible:bg-muted/40 focus-visible:outline-none"
        >
          {p.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- small thumbnail from storage
            <img
              src={p.coverUrl}
              alt=""
              className="size-14 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
            >
              <FolderKanban className="size-6" />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="line-clamp-2 text-[14px] leading-5 font-semibold">{p.title}</span>
            {meta ? <span className="truncate text-xs text-muted-foreground">{meta}</span> : null}
            <span className="mt-1 flex flex-wrap gap-1">
              {p.lookingFor.map((r) => (
                <span
                  key={r}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                    p.roles.includes(r)
                      ? "bg-success-soft text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {labelFor(LOOKING_FOR, r)}
                </span>
              ))}
            </span>
          </span>
          <span
            aria-hidden
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              on ? "border-primary bg-primary" : "border-input",
            )}
          >
            {on ? <Check className="size-3 text-white" strokeWidth={3.5} /> : null}
          </span>
        </button>
        {on ? (
          <div className="flex flex-col gap-2 border-t bg-surface-subtle px-3 py-3">
            <span className="text-xs font-semibold">
              {p.ownerIsMe ? `${them} joins as` : "You join as"}
            </span>
            <div role="radiogroup" className="flex flex-wrap gap-1.5">
              {p.roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={role === r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                    role === r
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card hover:border-primary/50",
                  )}
                >
                  {role === r ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
                  {labelFor(LOOKING_FOR, r)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const group = (title: string, hint: string, list: AddableProject[]) =>
    list.length ? (
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 flex w-full items-baseline justify-between gap-2">
          <span className="text-sm font-bold">{title}</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </legend>
        {list.map(card)}
      </fieldset>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className={shell}>
        <div className="flex gap-3.5 border-b px-6 pt-5 pr-14 pb-4">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white"
          >
            <FolderPlus className="size-5" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-xl">Add a project</DialogTitle>
            <DialogDescription className="mt-0.5">
              Start another deal with {them}. You are already connected, so no new enquiry is
              needed.
            </DialogDescription>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-6 overflow-y-auto px-6 py-5">
          {group("Your projects", `${them} becomes the partner`, mine)}
          {group(`${them}'s projects`, "You become the partner", theirs)}

          {chosen && role ? (
            <div className="flex flex-col gap-2.5 rounded-xl bg-primary-soft/60 p-3.5">
              <p className="text-xs font-bold text-primary">What happens next</p>
              <ol className="flex flex-col gap-2 text-[13px] leading-[18px]">
                {[
                  "The deal starts now, on its own tab in the deal panel.",
                  `${owner} ${owner === "You" ? "send" : "sends"} a collaboration request.`,
                  `${partner} ${partner === "You" ? "fill" : "fills"} in the offer as ${labelFor(LOOKING_FOR, role).toLowerCase()}, then you both confirm.`,
                ].map((t, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="flex items-start gap-1.5 text-xs leading-4 text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden /> Shown: live projects with an
              open role this organisation can take (in green).
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t bg-surface-subtle px-6 py-4">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {chosen && role ? (
              <>
                <strong className="font-semibold text-foreground">
                  {labelFor(LOOKING_FOR, role)}
                </strong>{" "}
                on {chosen.title}
              </>
            ) : chosen ? (
              "Choose the role"
            ) : (
              "Choose a project"
            )}
          </span>
          <Button variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button disabled={!chosen || !role || pending} onClick={submit} className="px-5">
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Start deal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
