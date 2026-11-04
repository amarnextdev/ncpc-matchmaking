"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Info } from "lucide-react";
import { OpportunityCard } from "@/features/opportunities/components/opportunity-card";
import type { Opportunity } from "@/features/opportunities/types";
import { toNumber, type ProjectValues } from "../schema";

/** Sticky card on the right: exactly how the project will look in Explore. */
export function ProjectPreview({
  org,
}: {
  org: { name: string; slug: string; logoUrl: string | null };
}) {
  const { control } = useFormContext<ProjectValues>();
  const v = useWatch({ control }) as Partial<ProjectValues>;

  const preview: Opportunity = {
    id: "preview",
    slug: "preview",
    title: v.title?.trim() || "Your project name",
    summary: v.summary?.trim() || "Your short summary appears here.",
    theme: v.theme ?? "energy",
    province: v.province ?? "gauteng",
    stage: v.stage ?? "idea",
    lookingFor: v.needs ?? [],
    capitalNeeded: toNumber(v.capitalNeeded ?? "") ?? 0,
    capitalRaised: toNumber(v.ownFunds ?? "") ?? 0,
    coverUrl: v.photos?.[0]?.url ?? null,
    owner: { name: org.name, slug: org.slug, logoUrl: org.logoUrl, verified: true },
    listedAt: new Date().toISOString(),
  };

  return (
    <aside aria-label="Preview" className="flex flex-col gap-3.5 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Live preview
        </p>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-success-bar" />
          How members see it
        </span>
      </div>
      {/* inert: the preview looks real but its links and buttons do nothing */}
      <div inert className="select-none">
        <OpportunityCard opportunity={preview} preview />
      </div>
      <p className="flex gap-2.5 rounded-2xl border border-dashed border-input px-4 py-3.5 text-[13px] leading-5 text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        Projects with photos, a feasibility study and impact numbers get about 3× more enquiries.
      </p>
    </aside>
  );
}
