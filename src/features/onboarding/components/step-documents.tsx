"use client";

import { useFormContext } from "react-hook-form";
import { Check, FileText, Loader2, Lock, Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { acceptFor } from "@/lib/storage/kinds";
import { cn } from "@/lib/utils";
import { DOC_MAX_MB, VERIFICATION_DOCS, type DocKey } from "../constants";
import type { OnboardingValues } from "../schema";
import { useUpload } from "../use-upload";

function DocRow({ docKey, name, note }: { docKey: DocKey; name: string; note: string }) {
  const { control, setValue, clearErrors } = useFormContext<OnboardingValues>();
  const { upload, busy, error } = useUpload("verification-doc");
  const inputId = `doc-${docKey}`;

  return (
    <FormField
      control={control}
      name={`docs.${docKey}`}
      render={({ field }) => {
        const done = Boolean(field.value);
        return (
          <FormItem
            className={cn(
              "flex-row flex-wrap items-center gap-3 rounded-2xl px-4 py-4 transition-colors",
              done
                ? "border border-success/25 bg-success-soft/40"
                : "border border-dashed border-input bg-background",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                done ? "bg-success text-white" : "bg-primary-soft text-primary",
              )}
            >
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : done ? (
                <Check className="size-5" strokeWidth={3} />
              ) : (
                <FileText className="size-5" />
              )}
            </span>
            <span className="flex min-w-[200px] flex-1 flex-col gap-0.5">
              <span className="text-sm font-bold">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {busy
                  ? "Uploading…"
                  : done
                    ? `Uploaded · ${field.value?.name}`
                    : `${note} · PDF, JPG or PNG, up to ${DOC_MAX_MB} MB`}
              </span>
            </span>
            <label
              htmlFor={inputId}
              className={cn(
                buttonVariants({ variant: done ? "outline" : "default", size: "sm" }),
                "cursor-pointer focus-within:ring-[3px] focus-within:ring-ring/40",
                busy && "pointer-events-none opacity-60",
              )}
            >
              {!done ? <Upload aria-hidden /> : null}
              {done ? "Replace" : "Upload"}
              <span className="sr-only"> {name}</span>
            </label>
            <input
              id={inputId}
              ref={field.ref}
              type="file"
              accept={acceptFor("verification-doc")}
              className="sr-only"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const ref = await upload(file);
                if (ref) {
                  clearErrors(field.name);
                  setValue(field.name, ref, { shouldDirty: true });
                }
              }}
            />
            {error ? (
              <p role="alert" className="basis-full text-sm text-destructive">
                {error}
              </p>
            ) : (
              <FormMessage className="basis-full" />
            )}
          </FormItem>
        );
      }}
    />
  );
}

/** Verification documents: private bucket, only NCPC can open them. */
export function StepDocuments() {
  return (
    <>
      <ul className="flex flex-col gap-3">
        {VERIFICATION_DOCS.map((d) => (
          <li key={d.key}>
            <DocRow docKey={d.key} name={d.name} note={d.note} />
          </li>
        ))}
      </ul>
      <p className="flex gap-2.5 rounded-xl bg-surface-subtle px-4 py-3 text-[13px] leading-5 text-muted-foreground">
        <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        Only NCPC sees these documents. Other members see the green verified badge once you are
        approved.
      </p>
    </>
  );
}
