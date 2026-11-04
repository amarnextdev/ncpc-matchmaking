"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CloudOff,
  Loader2,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { routes } from "@/config/routes";
import { Container } from "@/components/layout/container";
import { Stepper } from "@/features/onboarding/components/stepper";
import { saveProjectDraftAction, submitProjectAction } from "../actions";
import { PROJECT_STEPS } from "../constants";
import type { ProjectFormState } from "../queries";
import { PROJECT_STEP_SCHEMAS, projectSchema, type ProjectValues } from "../schema";
import { ProjectFormHero } from "./project-form-hero";
import { StepBasics } from "./step-basics";
import { StepDetails } from "./step-details";
import { StepMedia } from "./step-media";
import { StepNeeds } from "./step-needs";
import { StepReview } from "./step-review";

const LAST = PROJECT_STEPS.length - 1;
const AUTOSAVE_MS = 2000;
type SaveState = { status: "idle" | "saving" | "saved" | "error"; at: Date | null };

const timeFmt = new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit" });

function SaveIndicator({ state, editing }: { state: SaveState; editing: boolean }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
    >
      {editing ? (
        <>Changes are saved when you send the project again</>
      ) : state.status === "saving" ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
        </>
      ) : state.status === "error" ? (
        <span className="flex items-center gap-1.5 text-destructive">
          <CloudOff className="size-3.5" aria-hidden /> Draft not saved, we will try again
        </span>
      ) : state.at ? (
        <>
          <Check className="size-3.5 text-success" aria-hidden /> Draft saved at{" "}
          {timeFmt.format(state.at)}
        </>
      ) : (
        <>Your draft saves automatically</>
      )}
    </span>
  );
}

type ProjectFormProps = {
  initial: ProjectFormState;
  org: { name: string; slug: string; logoUrl: string | null };
  hero: { title: string; description: string };
};

/**
 * "List a project" in five steps with a live card preview.
 * New projects autosave as a draft (the draft id goes into the URL so the person can come back).
 * Projects already with NCPC are edited in place and saved when sent again.
 */
export function ProjectForm({ initial, org, hero }: ProjectFormProps) {
  const router = useRouter();
  const editing = initial.mode === "edit";
  const [step, setStep] = React.useState(initial.step);
  const [reached, setReached] = React.useState(editing ? LAST : initial.step);
  const [draftId, setDraftId] = React.useState(initial.draftId);
  const [save, setSave] = React.useState<SaveState>({
    status: "idle",
    at: initial.savedAt ? new Date(initial.savedAt) : null,
  });
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const timer = React.useRef<number | null>(null);
  const lastSaved = React.useRef(JSON.stringify([initial.values, initial.step]));
  const saving = React.useRef(false);

  const form = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initial.values as Partial<ProjectValues>,
    mode: "onTouched",
  });
  const submitting = form.formState.isSubmitting;
  const watched = useWatch({ control: form.control });

  const saveNow = React.useCallback(
    async (atStep: number, notify = false) => {
      if (editing) return true;
      const { confirm: _confirm, ...values } = form.getValues();
      const key = JSON.stringify([values, atStep]);
      if (key === lastSaved.current || saving.current) return true;
      // Nothing typed yet: don't create an empty draft.
      if (!draftId && !values.title?.trim() && !values.summary?.trim()) return true;
      saving.current = true;
      setSave((s) => ({ ...s, status: "saving" }));
      const result = await saveProjectDraftAction({ draftId, data: values, step: atStep }).catch(
        () => null,
      );
      saving.current = false;
      if (result?.ok) {
        lastSaved.current = key;
        setSave({ status: "saved", at: new Date(result.savedAt) });
        if (!draftId) {
          setDraftId(result.draftId);
          // Keep the page where it is; just make the URL point at this draft.
          window.history.replaceState(null, "", routes.workspace.projectDraft(result.draftId));
        }
        return true;
      }
      setSave((s) => ({ ...s, status: "error" }));
      if (notify)
        toast.error(result && !result.ok ? result.error : "We could not save your draft.");
      return false;
    },
    [draftId, editing, form],
  );

  React.useEffect(() => {
    if (editing) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void saveNow(step), AUTOSAVE_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [watched, step, saveNow, editing]);

  React.useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (save.status === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [save.status]);

  function checkStep(i: number): boolean {
    const schema = PROJECT_STEP_SCHEMAS[i];
    if (!schema) return true;
    const result = schema.safeParse(form.getValues());
    if (result.success) return true;
    let first: FieldPath<ProjectValues> | null = null;
    for (const issue of result.error.issues) {
      const name = issue.path.join(".") as FieldPath<ProjectValues>;
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
      toast.success("Draft saved. Find it under My projects → Drafts.");
      router.push(routes.workspace.projects);
    }
  }

  function onInvalid() {
    const broken = PROJECT_STEP_SCHEMAS.findIndex((s) => !s.safeParse(form.getValues()).success);
    if (broken === -1) return; // only the confirmation is missing; its message shows inline
    goTo(broken);
    requestAnimationFrame(() => checkStep(broken));
  }

  async function onSubmit(values: ProjectValues) {
    setSubmitError(null);
    if (timer.current) window.clearTimeout(timer.current);
    // On success the action redirects to My projects.
    const result = await submitProjectAction({ draftId, projectId: initial.projectId }, values);
    if (result && !result.ok) setSubmitError(result.error);
  }

  const current = PROJECT_STEPS[step] ?? PROJECT_STEPS[0];

  return (
    <Form {...form}>
      {/* Navy hero with the step progress along its bottom */}
      <ProjectFormHero orgName={org.name} title={hero.title} description={hero.description}>
        <Stepper steps={PROJECT_STEPS} current={step} reached={reached} onGo={goTo} tone="dark" />
      </ProjectFormHero>

      <Container className="pt-7">
        <div className="flex min-w-0 flex-col gap-4">
          {initial.reviewNote ? (
            <div
              role="note"
              className="flex gap-3 rounded-2xl border border-warning/25 bg-warning-soft px-4 py-3.5 text-sm text-warning"
            >
              <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">NCPC asked for changes</p>
                <p className="mt-0.5 text-warning/90">&ldquo;{initial.reviewNote}&rdquo;</p>
                <p className="mt-1 text-xs text-warning/80">
                  Update the project below, then send it again.
                </p>
              </div>
            </div>
          ) : null}

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
            className="rounded-2xl border bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-8">
              <div className="flex items-center gap-3.5">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-base font-bold text-primary"
                >
                  {step + 1}
                </span>
                <div>
                  <h2
                    id="step-title"
                    ref={headingRef}
                    tabIndex={-1}
                    className="text-xl leading-tight font-bold outline-none"
                  >
                    {current.title}
                    <span className="sr-only">
                      , step {step + 1} of {PROJECT_STEPS.length}
                    </span>
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{current.help}</p>
                </div>
              </div>
              <SaveIndicator state={save} editing={editing} />
            </div>

            <div className="flex flex-col gap-7 px-5 py-7 sm:px-8">
              {step === 0 ? <StepBasics /> : null}
              {step === 1 ? <StepNeeds /> : null}
              {step === 2 ? <StepDetails /> : null}
              {step === 3 ? <StepMedia /> : null}
              {step === 4 ? <StepReview orgName={org.name} onEdit={goTo} /> : null}

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

            {/* Stays in view while the person scrolls a long step */}
            <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2.5 rounded-b-2xl border-t bg-background/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-8">
              <span className="hidden text-xs font-medium text-muted-foreground tabular-nums sm:inline">
                Step {step + 1} of {PROJECT_STEPS.length}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={() => goTo(step - 1)}
                className="flex-1 sm:ml-3 sm:flex-none"
              >
                <ArrowLeft aria-hidden /> Back
              </Button>
              <span className="hidden flex-1 sm:block" />
              {!editing ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void saveAndLeave()}
                  disabled={save.status === "saving" || submitting}
                  className="flex-1 text-primary sm:flex-none"
                >
                  <Save aria-hidden /> Save draft
                </Button>
              ) : null}
              <Button type="submit" className="flex-1 px-6 sm:flex-none" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {step < LAST ? (
                  <>
                    Continue <ArrowRight aria-hidden />
                  </>
                ) : (
                  <>
                    {!submitting ? <Send aria-hidden /> : null}
                    {editing ? "Send to NCPC again" : "Submit for NCPC review"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </Form>
  );
}
