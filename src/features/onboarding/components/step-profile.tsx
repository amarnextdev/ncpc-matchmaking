"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { acceptFor, type UploadKind } from "@/lib/storage/kinds";
import { initials } from "@/lib/utils";
import { SUMMARY_MAX } from "../constants";
import type { FileRef, OnboardingValues } from "../schema";
import { useUpload } from "../use-upload";

/** Hidden file input + the upload hook, opened by any button. */
function useImagePicker(kind: UploadKind, onDone: (ref: FileRef) => void) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { upload, busy, error } = useUpload(kind);
  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={acceptFor(kind)}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={async (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        const ref = await upload(f);
        if (ref) onDone(ref);
      }}
    />
  );
  return { open: () => inputRef.current?.click(), input, busy, error };
}

export function StepProfile() {
  const { control, setValue } = useFormContext<OnboardingValues>();
  const [logo, banner, name] = useWatch({ control, name: ["logo", "banner", "companyName"] });
  const bannerPick = useImagePicker("org-banner", (ref) =>
    setValue("banner", ref, { shouldDirty: true }),
  );
  const logoPick = useImagePicker("org-logo", (ref) =>
    setValue("logo", ref, { shouldDirty: true }),
  );
  const displayName = name?.trim() || "Your organisation";

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-6">
        {/* Banner with the logo on top, like the public profile */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">
            Banner and logo{" "}
            <span className="font-normal text-muted-foreground">
              (optional, you can add them later)
            </span>
          </p>
          <div className="relative pb-12">
            {bannerPick.input}
            {banner?.url ? (
              <div className="group relative h-44 overflow-hidden rounded-2xl border sm:h-56">
                {/* eslint-disable-next-line @next/next/no-img-element -- uploaded banner */}
                <img src={banner.url} alt="Your banner" className="size-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={bannerPick.open}
                    disabled={bannerPick.busy}
                    className="border-transparent bg-background/90 shadow-sm backdrop-blur hover:bg-background"
                  >
                    <Camera aria-hidden /> Change banner
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => setValue("banner", null, { shouldDirty: true })}
                    aria-label="Remove banner"
                    className="border-transparent bg-background/90 text-destructive shadow-sm backdrop-blur hover:bg-background"
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={bannerPick.open}
                disabled={bannerPick.busy}
                className="flex h-44 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-input bg-surface-subtle text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none sm:h-56"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-background text-primary shadow-sm">
                  <ImagePlus className="size-5" aria-hidden />
                </span>
                <strong className="text-primary">Upload a banner</strong>
                <span className="text-xs">
                  1600 × 400 px · a project, site or team photo · up to 8 MB
                </span>
              </button>
            )}
            {bannerPick.busy ? (
              <span className="absolute inset-x-0 top-0 flex h-44 items-center justify-center rounded-2xl bg-background/70 sm:h-56">
                <Loader2
                  className="size-6 animate-spin text-primary"
                  aria-label="Uploading banner"
                />
              </span>
            ) : null}

            {/* Logo */}
            {logoPick.input}
            <div className="absolute bottom-0 left-5 flex items-end gap-3">
              <button
                type="button"
                onClick={logoPick.open}
                disabled={logoPick.busy}
                aria-label={logo ? "Change logo" : "Upload logo"}
                className="group relative flex size-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-primary text-xl font-bold text-primary-foreground shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                {logo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded logo
                  <img src={logo.url} alt="" className="size-full object-cover" />
                ) : (
                  initials(displayName)
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-slate-900/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Camera className="size-5 text-white" aria-hidden />
                </span>
                {logoPick.busy ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-1">
            <span className="text-xs text-muted-foreground">
              Logo: square, at least 256 × 256 px · up to 5 MB
            </span>
            <span className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={logoPick.open}
                disabled={logoPick.busy}
              >
                <Camera aria-hidden /> {logo ? "Change logo" : "Upload logo"}
              </Button>
              {logo ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setValue("logo", null, { shouldDirty: true })}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 aria-hidden /> Remove
                </Button>
              ) : null}
            </span>
          </div>
          {bannerPick.error || logoPick.error ? (
            <p role="alert" className="text-sm text-destructive">
              {bannerPick.error ?? logoPick.error}
            </p>
          ) : null}
        </div>

        <FormField
          control={control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-line summary</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  maxLength={SUMMARY_MAX}
                  placeholder="e.g. Equity of R5m – R30m for energy and efficiency projects in industrial parks."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex justify-between gap-3">
                <span>Shown under your name on cards and in search results.</span>
                <span className="tabular-nums">
                  {(field.value ?? "").length}/{SUMMARY_MAX}
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
