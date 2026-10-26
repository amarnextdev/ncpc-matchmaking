"use client";

import { useState } from "react";
import type * as React from "react";
import { OrgLogo } from "@/components/shared/org-logo";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PROJECT_STAGES, labelFor, type ProjectStage } from "@/lib/constants";
import { formatDay } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ProgressUpdate } from "../../types";
import { FileBadge } from "./file-badge";
import { UpdatePhotos } from "./photo-button";

type Props = {
  updates: ProgressUpdate[];
  owner: { name: string; logoUrl: string | null };
  projectTitle: string;
  /** Send enquiry / Sign in button rendered by the server. */
  cta: React.ReactNode;
};

/** "See all N updates" → timeline of the owner's updates. Right sheet on desktop, bottom sheet on phones. */
export function UpdatesSheet({ updates, owner, projectTitle, cta }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const [stage, setStage] = useState<ProjectStage | "all">("all");

  const filters = [
    { value: "all" as const, label: "All", count: updates.length },
    ...[...PROJECT_STAGES]
      .reverse()
      .map((s) => ({
        value: s.value,
        label: s.label,
        count: updates.filter((u) => u.stage === s.value).length,
      }))
      .filter((f) => f.count > 0),
  ];
  const visible = stage === "all" ? updates : updates.filter((u) => u.stage === stage);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="self-start text-sm font-semibold text-primary hover:underline"
        >
          See all {updates.length} updates from the owner →
        </button>
      </SheetTrigger>
      <SheetContent side={isDesktop ? "right" : "bottom"} className="md:max-w-[480px]">
        <SheetHeader className="gap-3.5">
          <div className="flex items-center gap-3">
            <OrgLogo name={owner.name} logoUrl={owner.logoUrl} size="sm" className="size-10" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <SheetTitle>
                Project updates{" "}
                <span className="font-medium text-subtle-foreground">({updates.length})</span>
              </SheetTitle>
              <SheetDescription className="truncate">
                Posted by {owner.name} · {projectTitle}
              </SheetDescription>
            </div>
          </div>
          <div
            role="group"
            aria-label="Filter by stage"
            className="flex [scrollbar-width:none] gap-2 overflow-x-auto"
          >
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={stage === f.value}
                onClick={() => setStage(f.value)}
                className={cn(
                  "h-[34px] shrink-0 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
                  stage === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-foreground/80 hover:bg-muted",
                )}
              >
                {f.label} <span className="font-medium opacity-70">{f.count}</span>
              </button>
            ))}
          </div>
        </SheetHeader>

        <ol aria-label="Updates" className="flex-1 overflow-y-auto px-5 pt-5 pb-2">
          {visible.map((update, i) => (
            <li key={update.id} className="flex gap-3.5">
              <div className="flex w-3 shrink-0 flex-col items-center">
                <span
                  className={cn(
                    "mt-1 size-3 rounded-full",
                    i === 0 ? "bg-primary ring-4 ring-primary/15" : "bg-input",
                  )}
                />
                {i < visible.length - 1 ? <span className="mt-1.5 w-0.5 flex-1 bg-border" /> : null}
              </div>
              <article className="flex min-w-0 flex-1 flex-col gap-2 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <time dateTime={update.date} className="text-[13px] text-subtle-foreground">
                    {formatDay(update.date)}
                  </time>
                  <Badge variant="soft">{labelFor(PROJECT_STAGES, update.stage)}</Badge>
                </div>
                <h3 className="text-[15px] leading-[21px] font-bold">{update.title}</h3>
                <p className="text-sm leading-[21px] text-foreground/80">{update.text}</p>
                {update.photos.length ? <UpdatePhotos indexes={update.photos} max={4} /> : null}
                {update.document ? (
                  <a
                    href={update.document.url}
                    className="flex items-center gap-2.5 self-start rounded-md border px-3 py-2 text-[13px] font-semibold hover:bg-muted"
                  >
                    <FileBadge type="pdf" className="size-7 text-[9px]" />
                    {update.document.name}
                  </a>
                ) : null}
              </article>
            </li>
          ))}
        </ol>

        <SheetFooter className="flex-wrap items-center justify-between">
          <span className="text-[13px] text-muted-foreground">Interested in this project?</span>
          {cta}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
