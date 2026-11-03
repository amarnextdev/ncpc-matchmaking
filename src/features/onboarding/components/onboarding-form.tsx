"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CloudOff,
  HelpCircle,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { saveDraftAction, submitOnboardingAction } from "../actions";
import { ONBOARDING_STEPS } from "../constants";
import { STEP_SCHEMAS, onboardingSchema, type DraftValues, type OnboardingValues } from "../schema";
import { StepCompany } from "./step-company";
import { StepDocuments } from "./step-documents";
import { StepMatchmaking } from "./step-matchmaking";
import { StepProfile } from "./step-profile";
import { Stepper } from "./stepper";

const LAST = ONBOARDING_STEPS.length - 1;
const AUTOSAVE_MS = 2000;

type SaveState = { status: "idle" | "saving" | "saved" | "error"; at: Date | null };

type OnboardingFormProps = {
  initialValues: DraftValues;
  initialStep: number;
  savedAt: string | null;
  mode: "new" | "draft" | "changes";
  reviewNote: string | null;
};

const timeFmt = new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function SaveIndicator({ state }: { state: SaveState }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
    >
      {state.status === "saving" ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
        </>
      ) : state.status === "error" ? (
        <span className="flex items-center gap-1.5 text-destructive">
          <CloudOff className="size-3.5" aria-hidden /> Draft not saved, we will try again
        </span>
      ) : state.at ? (
        <>
          <Check className="size-3.5 text-success" aria-hidden /> Saved at{" "}
          {timeFmt.format(state.at)}
        </>
      ) : (
        <>Changes save automatically</>
      )}
    </span>
  );
}

/**
 * Step 2 of registration: the organisation, in four steps.
 * Saves a draft automatically (and on every step change), so people can leave and come back
 * to the same step. Submitting sends it to NCPC's Approvals queue.
 */
export function OnboardingForm({
  initialValues,
  initialStep,
  savedAt,
  mode,
  reviewNote,
}: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = React.useState(initialStep);
  const [reached, setReached] = React.useState(mode === "changes" ? LAST : initialStep);
  const [save, setSave] = React.useState<SaveState>({
    status: "idle",
    at: savedAt ? new Date(savedAt) : null,
  });
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const timer = React.useRef<number | null>(null);
  const lastSaved = React.useRef<string>(JSON.stringify([initialValues, initialStep]));

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: initialValues as Partial<OnboardingValues>,
    mode: "onTouched",
  });
  const submitting = form.formState.isSubmitting;
  const watched = useWatch({ control: form.control });

  const saveNow = React.useCallback(
    async (atStep: number, notify = false) => {
      const values = form.getValues();
      const key = JSON.stringify([values, atStep]);
      if (key === lastSaved.current) return true;
      setSave((s) => ({ ...s, status: "saving" }));
      const result = await saveDraftAction({ data: values, step: atStep }).catch(() => null);
      if (result?.ok) {
        lastSaved.current = key;
        setSave({ status: "saved", at: new Date(result.savedAt) });
        return true;
      }
      setSave((s) => ({ ...s, status: "error" }));
      // Autosave fails quietly (the indicator shows it); only an explicit save shows a message.
      if (notify) toast.error(result && !result.ok ? result.error : "We could not save your draft.");
      return false;
    },
    [form],
  );

  // Autosave a moment after the person stops typing or picking.
  React.useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void saveNow(step), AUTOSAVE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [watched, step, saveNow]);

  // Warn before closing the tab while a save is still running.
  React.useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (save.status === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [save.status]);

  /** Checks only the current step; shows its errors and focuses the first one. */
  function checkStep(i: number): boolean {
    const schema = STEP_SCHEMAS[i];
    if (!schema) return true;
    const result = schema.safeParse(form.getValues());
    if (result.success) return true;
    let first: FieldPath<OnboardingValues> | null = null;
    for (const issue of result.error.issues) {
      const name = issue.path.join(".") as FieldPath<OnboardingValues>;
      form.setError(name, { type: "manual", message: issue.message });
      first ??= name;
    }
    if (first) form.setFocus(first);
    return false;
  }

  function goTo(next: number) {
    setStep(next);
    setReached((r) => Math.max(r, next));
    void saveNow(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function saveAndLeave() {
    if (await saveNow(step, true)) {
      toast.success("Draft saved. Sign in any time to continue where you left off.");
      router.push(routes.home);
    }
  }

  function onInvalid() {
    const broken = STEP_SCHEMAS.findIndex((schema) => !schema.safeParse(form.getValues()).success);
    if (broken === -1) return;
    goTo(broken);
    requestAnimationFrame(() => checkStep(broken));
  }

  async function onSubmit(values: OnboardingValues) {
    setSubmitError(null);
    // On success the action redirects to the pending page.
    const result = await submitOnboardingAction(values);
    if (!result.ok) setSubmitError(result.error);
  }

  const current = ONBOARDING_STEPS[step] ?? ONBOARDING_STEPS[0];
  const draftDate = savedAt ? new Date(savedAt) : null;

  return (
    <div className="flex flex-col gap-5">
      <Stepper current={step} reached={reached} onGo={goTo} />


        {mode === "changes" && reviewNote ? (
          <div
            role="note"
            className="flex gap-3 rounded-2xl border border-warning/25 bg-warning-soft px-4 py-3.5 text-sm text-warning"
          >
            <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">NCPC asked for changes</p>
              <p className="mt-0.5 text-warning/90">&ldquo;{reviewNote}&rdquo;</p>
              <p className="mt-1 text-xs text-warning/80">
                Update the details below, then submit again.
              </p>
            </div>
          </div>
        ) : mode === "draft" && draftDate ? (
          <div
            role="note"
            className="flex gap-3 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3 text-sm text-primary"
          >
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              <strong>Welcome back.</strong> We kept your answers from {dayFmt.format(draftDate)}.
              Carry on where you left off.
            </p>
          </div>
        ) : null}

        <Form {...form}>
          <form
            noValidate
            onSubmit={(e) => {
              if (step < LAST) {
                e.preventDefault();
                if (checkStep(step)) goTo(step + 1);
                return;
              }
              void form.handleSubmit(onSubmit, onInvalid)(e);
            }}
            aria-labelledby="step-title"
            className="overflow-hidden rounded-2xl border bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Step {step + 1} of {ONBOARDING_STEPS.length}
                </p>
                <h2
                  id="step-title"
                  ref={headingRef}
                  tabIndex={-1}
                  className="mt-1 text-[22px] font-bold outline-none"
                >
                  {current.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{current.help}</p>
              </div>
              <SaveIndicator state={save} />
            </div>

            <div className="flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-7">
              {step === 0 ? <StepCompany /> : null}
              {step === 1 ? <StepMatchmaking /> : null}
              {step === 2 ? <StepProfile /> : null}
              {step === 3 ? <StepDocuments /> : null}

              {submitError ? (
                <p
                  role="alert"
                  className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {submitError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 border-t bg-surface-subtle px-5 py-4 sm:px-8">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={() => goTo(step - 1)}
                className="flex-1 sm:flex-none"
              >
                <ArrowLeft aria-hidden /> Back
              </Button>
              <span className="hidden flex-1 sm:block" />
              <Button
                type="button"
                variant="ghost"
                onClick={() => void saveAndLeave()}
                disabled={save.status === "saving" || submitting}
                className="flex-1 text-primary sm:flex-none"
              >
                <Save aria-hidden /> Save and finish later
              </Button>
              <Button
                type="submit"
                className={cn("flex-1 px-6 sm:flex-none")}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {step < LAST ? (
                  <>
                    Continue <ArrowRight aria-hidden />
                  </>
                ) : mode === "changes" ? (
                  "Send to NCPC again"
                ) : (
                  "Submit for verification"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-muted-foreground">
          <HelpCircle className="size-3.5" aria-hidden />
          Your answers save as you go, so you can leave and continue later from the same step.
          <Link href={routes.contact} className="font-semibold text-primary hover:underline">
            Need help?
          </Link>
        </p>
    </div>
  );
}
