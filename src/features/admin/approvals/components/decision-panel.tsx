"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { decideOrganisationAction } from "../actions";

type Decision = "approve" | "changes" | "reject";

const OPTIONS: { value: Decision; label: string; help: string; icon: typeof Check }[] = [
  {
    value: "approve",
    label: "Approve",
    help: "The organisation goes live and gets the verified badge.",
    icon: Check,
  },
  {
    value: "changes",
    label: "Ask for changes",
    help: "They fix the details and send them again.",
    icon: RotateCcw,
  },
  { value: "reject", label: "Reject", help: "The organisation can't use the platform.", icon: X },
];

/** NCPC decision for one organisation. A note is required for changes and rejections. */
export function DecisionPanel({ orgId, orgName }: { orgId: string; orgName: string }) {
  const router = useRouter();
  const [decision, setDecision] = React.useState<Decision>("approve");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const needsNote = decision !== "approve";

  function submit() {
    setError(null);
    if (needsNote && note.trim().length < 10) {
      setError("Tell the organisation what to fix (at least 10 characters).");
      return;
    }
    startTransition(async () => {
      const result = await decideOrganisationAction({ orgId, decision, note });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(
        decision === "approve"
          ? `${orgName} is approved`
          : decision === "changes"
            ? `Changes requested from ${orgName}`
            : `${orgName} was rejected`,
      );
      router.push(routes.admin.approvals);
      router.refresh();
    });
  }

  return (
    <section
      aria-labelledby="decision-title"
      className="flex flex-col gap-4 rounded-2xl border bg-background p-5"
    >
      <h2 id="decision-title" className="text-base font-bold">
        Your decision
      </h2>
      <div role="radiogroup" aria-labelledby="decision-title" className="flex flex-col gap-2">
        {OPTIONS.map((o) => {
          const on = decision === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setDecision(o.value);
                setError(null);
              }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
                on ? "border-2 border-primary bg-primary-soft p-[11px]" : "hover:bg-muted/60",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                  on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70",
                )}
              >
                <o.icon className="size-4" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{o.label}</span>
                <span className="text-xs text-muted-foreground">{o.help}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="decision-note">
          {needsNote ? "Message to the organisation" : "Note (optional, only NCPC sees it)"}
        </Label>
        <Textarea
          id="decision-note"
          rows={4}
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            decision === "changes"
              ? "e.g. The B-BBEE certificate has expired. Please upload a valid one."
              : decision === "reject"
                ? "e.g. We could not match the registration number with CIPC records."
                : ""
          }
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? "decision-error" : undefined}
          className="resize-none"
        />
      </div>

      {error ? (
        <p id="decision-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        onClick={submit}
        disabled={pending}
        variant={decision === "reject" ? "destructive" : "default"}
        className="w-full"
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {decision === "approve"
          ? "Approve organisation"
          : decision === "changes"
            ? "Send request for changes"
            : "Reject organisation"}
      </Button>
    </section>
  );
}
