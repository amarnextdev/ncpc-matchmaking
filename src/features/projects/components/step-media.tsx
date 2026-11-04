"use client";

import * as React from "react";
import Image from "next/image";
import { useFieldArray, useFormContext, useFormState } from "react-hook-form";
import { Eye, FileText, ImagePlus, Loader2, Lock, Star, Trash2, UploadCloud } from "lucide-react";
import { useUpload } from "@/features/onboarding/use-upload";
import { acceptFor, UPLOAD_KINDS } from "@/lib/storage/kinds";
import { cn } from "@/lib/utils";
import { DOCUMENTS_MAX, PHOTOS_MAX, PHOTOS_RECOMMENDED } from "../constants";
import type { ProjectValues } from "../schema";

/** A label that is also a drop target for files. */
function DropZone({
  inputId,
  accept,
  multiple,
  disabled,
  onFiles,
  className,
  children,
}: {
  inputId: string;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [over, setOver] = React.useState(false);
  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        "cursor-pointer rounded-2xl border-2 border-dashed transition-colors focus-within:ring-[3px] focus-within:ring-ring/40",
        over
          ? "border-primary bg-primary-soft"
          : "border-input bg-surface-subtle hover:border-primary/50 hover:bg-primary-soft/40",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      {children}
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          onFiles(files);
        }}
      />
    </label>
  );
}

function SectionHead({
  id,
  title,
  optional,
  help,
  count,
}: {
  id: string;
  title: string;
  optional?: boolean;
  help: string;
  count: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 id={id} className="text-[15px] font-semibold">
          {title}
          {optional ? <span className="font-normal text-muted-foreground"> · optional</span> : null}
        </h3>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{help}</p>
      </div>
      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground/70 tabular-nums">
        {count}
      </span>
    </div>
  );
}

function Photos() {
  const { control, clearErrors } = useFormContext<ProjectValues>();
  const { errors } = useFormState({ control, name: "photos" });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "photos",
    keyName: "key",
  });
  const { upload, busy, error } = useUpload("project-photo");
  const [queue, setQueue] = React.useState(0);
  const inputId = React.useId();
  const full = fields.length >= PHOTOS_MAX;
  const maxMb = UPLOAD_KINDS["project-photo"].maxMb;

  async function onFiles(list: File[]) {
    const picked = list
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, PHOTOS_MAX - fields.length);
    setQueue(picked.length);
    for (const file of picked) {
      const ref = await upload(file);
      if (ref) {
        append(ref);
        clearErrors("photos");
      }
      setQueue((n) => n - 1);
    }
  }

  const message = error ?? errors.photos?.message ?? errors.photos?.root?.message;
  const left = Math.max(0, PHOTOS_RECOMMENDED - fields.length);

  return (
    <section aria-labelledby="photos-title" className="flex flex-col gap-3.5">
      <SectionHead
        id="photos-title"
        title="Photos"
        help={`The first photo is the cover. ${PHOTOS_RECOMMENDED} or more work best: the site, the roof or land, and the equipment.`}
        count={`${fields.length}/${PHOTOS_MAX}`}
      />

      {fields.length === 0 && queue === 0 ? (
        <DropZone
          inputId={inputId}
          accept={acceptFor("project-photo")}
          multiple
          disabled={busy}
          onFiles={onFiles}
          className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center"
        >
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-2xl bg-background text-primary shadow-card"
          >
            <ImagePlus className="size-6" />
          </span>
          <span className="mt-1 text-[15px] font-semibold">
            Drag photos here or{" "}
            <span className="text-primary underline underline-offset-2">browse</span>
          </span>
          <span className="text-[13px] text-muted-foreground">
            JPG, PNG or WebP · up to {maxMb} MB each · landscape looks best
          </span>
        </DropZone>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {fields.map((photo, i) => (
            <li
              key={photo.key}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-muted",
                i === 0 ? "col-span-2 row-span-2 aspect-[4/3] sm:col-span-2" : "aspect-[4/3]",
              )}
            >
              {photo.url ? (
                <Image
                  src={photo.url}
                  alt={`Photo ${i + 1}`}
                  fill
                  sizes={i === 0 ? "480px" : "240px"}
                  className="object-cover"
                />
              ) : null}
              {i === 0 ? (
                <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary shadow-card">
                  <Star className="size-3 fill-current" aria-hidden /> Cover
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent p-2 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                {i > 0 ? (
                  <button
                    type="button"
                    onClick={() => move(i, 0)}
                    className="flex h-8 items-center gap-1 rounded-full bg-white/95 px-2.5 text-xs font-semibold text-primary hover:bg-white"
                  >
                    <Star className="size-3.5" aria-hidden /> Make cover
                    <span className="sr-only"> (photo {i + 1})</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex size-8 items-center justify-center rounded-full bg-white/95 text-destructive hover:bg-white"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: queue }, (_, i) => (
            <li
              key={`up-${i}`}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border bg-muted text-xs text-muted-foreground"
            >
              <Loader2 className="size-5 animate-spin" aria-hidden /> Uploading…
            </li>
          ))}
          {!full ? (
            <li className="aspect-[4/3]">
              <DropZone
                inputId={inputId}
                accept={acceptFor("project-photo")}
                multiple
                disabled={busy}
                onFiles={onFiles}
                className="flex h-full flex-col items-center justify-center gap-1.5 rounded-xl text-center"
              >
                <ImagePlus className="size-5 text-primary" aria-hidden />
                <span className="text-[13px] font-semibold text-primary">Add photos</span>
                {left ? (
                  <span className="text-xs text-muted-foreground">{left} more recommended</span>
                ) : null}
              </DropZone>
            </li>
          ) : null}
        </ul>
      )}

      {message ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function Documents() {
  const { control } = useFormContext<ProjectValues>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "documents",
    keyName: "key",
  });
  const { upload, busy, error } = useUpload("project-doc");
  const inputId = React.useId();
  const full = fields.length >= DOCUMENTS_MAX;
  const maxMb = UPLOAD_KINDS["project-doc"].maxMb;

  async function onFiles(list: File[]) {
    for (const file of list.slice(0, DOCUMENTS_MAX - fields.length)) {
      const ref = await upload(file);
      if (ref) append({ ...ref, visibility: "members_after_enquiry" });
    }
  }

  return (
    <section aria-labelledby="docs-title" className="flex flex-col gap-3.5">
      <SectionHead
        id="docs-title"
        title="Documents"
        optional
        help="Feasibility study, financial model or site layout. You choose who can open each one."
        count={`${fields.length}/${DOCUMENTS_MAX}`}
      />

      {fields.length ? (
        <ul className="divide-y overflow-hidden rounded-xl border">
          {fields.map((doc, i) => {
            const open = doc.visibility === "public";
            return (
              <li key={doc.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
                >
                  <FileText className="size-[18px]" />
                </span>
                <span className="flex min-w-[160px] flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{doc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {open
                      ? "Anyone on NCPC Matchmaking can open it"
                      : "Shared when you accept an enquiry"}
                  </span>
                </span>
                <div
                  role="radiogroup"
                  aria-label={`Who can open ${doc.name}`}
                  className="flex rounded-full border bg-muted p-0.5"
                >
                  {(
                    [
                      { value: "members_after_enquiry", label: "After enquiry", icon: Lock },
                      { value: "public", label: "Public", icon: Eye },
                    ] as const
                  ).map((o) => {
                    const on = doc.visibility === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => update(i, { ...doc, visibility: o.value })}
                        className={cn(
                          "flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-colors",
                          on
                            ? "bg-background text-foreground shadow-card"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <o.icon className="size-3.5" aria-hidden /> {o.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${doc.name}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!full ? (
        <DropZone
          inputId={inputId}
          accept={acceptFor("project-doc")}
          multiple
          disabled={busy}
          onFiles={onFiles}
          className="flex items-center gap-3.5 px-5 py-4"
        >
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary shadow-card"
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <UploadCloud className="size-5" />
            )}
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold">
              {busy ? (
                "Uploading…"
              ) : (
                <>
                  Drag documents here or{" "}
                  <span className="text-primary underline underline-offset-2">browse</span>
                </>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, JPG or PNG · up to {maxMb} MB each
            </span>
          </span>
        </DropZone>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function StepMedia() {
  return (
    <>
      <Photos />
      <div className="border-t" />
      <Documents />
    </>
  );
}
