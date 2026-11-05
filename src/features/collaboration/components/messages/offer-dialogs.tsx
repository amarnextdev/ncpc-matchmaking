"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LOOKING_FOR, labelFor, type LookingFor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { sendCollabRequestAction, submitOfferAction } from "../../deal-actions";
import { OFFER_FIELDS, offerSchema, type OfferValues } from "../../forms";

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
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
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
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
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
              start(async () => {
                const r = await sendCollabRequestAction({ dealId, message });
                if (!r.ok) return void toast.error(r.error);
                toast.success(`Request sent to ${partner}`);
                onOpenChange(false);
                router.refresh();
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
  const router = useRouter();
  const fields = OFFER_FIELDS[role];
  const [values, setValues] = useState<OfferValues>(() => initial ?? {});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: string, v: string | string[]) => setValues((s) => ({ ...s, [k]: v }));

  function submit() {
    setError(null);
    const parsed = offerSchema(role).safeParse(values);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check the form.");
    start(async () => {
      const r = await submitOfferAction({ requestId, form: parsed.data });
      if (!r.ok) return setError(r.error);
      toast.success(`Offer sent to ${owner}`);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={shell}>
        <div className="border-b px-6 pt-5 pr-14 pb-4">
          <DialogTitle className="text-xl">
            Your offer as {labelFor(LOOKING_FOR, role).toLowerCase()}
          </DialogTitle>
          <DialogDescription className="mt-0.5">
            For {project} · {owner}
          </DialogDescription>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {ownerNote ? (
            <p className="rounded-xl bg-primary-soft px-3.5 py-2.5 text-[13px] leading-5 text-primary">
              <strong>{owner}:</strong> &ldquo;{ownerNote}&rdquo;
            </p>
          ) : null}
          {fields.map((f) => {
            const id = `offer-${f.key}`;
            const v = values[f.key];
            const label = (
              <span className="text-sm font-semibold">
                {f.label}
                {"required" in f && f.required ? null : (
                  <span className="font-normal text-muted-foreground"> (optional)</span>
                )}
              </span>
            );
            if (f.kind === "choice" || f.kind === "multi") {
              const list = f.kind === "multi" ? (Array.isArray(v) ? v : []) : [];
              return (
                <fieldset key={f.key} className="flex flex-col gap-2">
                  <legend className="mb-2">{label}</legend>
                  <div
                    className={cn(
                      f.kind === "choice" ? "flex flex-wrap gap-2" : "flex flex-col gap-2",
                    )}
                  >
                    {f.options.map((o) => {
                      const on = f.kind === "choice" ? v === o.value : list.includes(o.value);
                      return f.kind === "choice" ? (
                        <button
                          key={o.value}
                          type="button"
                          aria-pressed={on}
                          onClick={() => set(f.key, o.value)}
                          className={cn(
                            "h-9 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input hover:border-primary/50",
                          )}
                        >
                          {o.label}
                        </button>
                      ) : (
                        <label
                          key={o.value}
                          className="flex cursor-pointer items-center gap-2.5 text-[13px]"
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              set(
                                f.key,
                                on ? list.filter((x) => x !== o.value) : [...list, o.value],
                              )
                            }
                            className="size-4 accent-primary"
                          />
                          {o.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            }
            return (
              <label key={f.key} htmlFor={id} className="flex flex-col gap-1.5">
                {label}
                {f.kind === "textarea" ? (
                  <Textarea
                    id={id}
                    rows={3}
                    value={typeof v === "string" ? v : ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={"placeholder" in f ? f.placeholder : undefined}
                    className="resize-none"
                  />
                ) : (
                  <div className="relative">
                    {f.kind === "money" ? (
                      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-muted-foreground">
                        R
                      </span>
                    ) : null}
                    <Input
                      id={id}
                      type={f.kind === "month" ? "month" : "text"}
                      inputMode={f.kind === "money" ? "numeric" : undefined}
                      value={typeof v === "string" ? v : ""}
                      onChange={(e) =>
                        set(
                          f.key,
                          f.kind === "money"
                            ? e.target.value.replace(/[^\d\s,]/g, "")
                            : e.target.value,
                        )
                      }
                      placeholder={"placeholder" in f ? f.placeholder : undefined}
                      className={cn(
                        f.kind === "money" && "pl-8 tabular-nums",
                        f.kind === "month" && "max-w-[240px]",
                      )}
                    />
                  </div>
                )}
                {"help" in f && f.help ? (
                  <span className="text-xs text-muted-foreground">{f.help}</span>
                ) : null}
              </label>
            );
          })}
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t bg-surface-subtle px-6 py-4">
          <span className="flex-1 text-xs text-muted-foreground max-sm:basis-full">
            Not binding. You sign the real agreement outside the platform.
          </span>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={pending} onClick={submit}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null} Send to {owner}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
