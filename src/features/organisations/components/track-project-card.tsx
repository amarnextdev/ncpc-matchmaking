import Link from "next/link";
import { Lock } from "lucide-react";
import { OrgLogo } from "@/components/shared/org-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { PROJECT_STAGES, PROVINCES, labelFor, type ProjectStage } from "@/lib/constants";
import { formatMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { TrackRecordItem } from "../types";

const STATUS: Record<ProjectStage, { dot: string; ink: string }> = {
  operational: { dot: "bg-success", ink: "text-success" },
  construction: { dot: "bg-primary", ink: "text-primary" },
  funding: { dot: "bg-[#C98A16]", ink: "text-warning" },
  feasibility: { dot: "bg-subtle-foreground", ink: "text-foreground/80" },
  idea: { dot: "bg-input", ink: "text-foreground/80" },
};

/** A project in an organisation's track record — same card shape as the marketplace cards. */
export function TrackProjectCard({
  item,
  organisationName,
}: {
  item: TrackRecordItem;
  organisationName: string;
}) {
  const index = PROJECT_STAGES.findIndex((s) => s.value === item.stage);
  const finished = item.stage === "operational";
  const status = STATUS[item.stage];
  const href = item.projectSlug ? routes.opportunities.detail(item.projectSlug) : null;

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-lg border bg-card shadow-card">
      <div className="relative h-32" style={{ backgroundColor: item.tint }}>
        <span
          className={cn(
            "absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow-[0_2px_8px_rgb(15_23_42/0.12)]",
            status.ink,
          )}
        >
          <span aria-hidden className={cn("size-[7px] rounded-full", status.dot)} />
          {labelFor(PROJECT_STAGES, item.stage)}
        </span>
        {href ? null : (
          <Badge variant="overlay" className="absolute top-3.5 right-3.5">
            <Lock aria-hidden />
            Private
          </Badge>
        )}
        <OrgLogo
          name={item.projectOwner}
          logoUrl={null}
          ring
          className="absolute -bottom-[22px] left-[18px] size-[46px]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-[18px] pt-[34px] pb-[18px]">
        <div className="flex flex-col gap-1.5">
          <p className="text-eyebrow">Since {formatMonth(item.since)}</p>
          <h3 className="text-[17px] leading-[23px] font-bold">
            {href ? (
              <Link href={href} className="hover:text-primary">
                {item.projectTitle}
              </Link>
            ) : (
              item.projectTitle
            )}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            by {item.projectOwner} · {labelFor(PROVINCES, item.province)}
          </p>
        </div>

        <div className="flex flex-col gap-0.5 rounded-md bg-success-soft px-3 py-2.5">
          <span className="text-xs font-semibold text-[#1F4F0C]">
            {organisationName}&apos;s role
          </span>
          <span className="text-sm">{item.detail}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] text-muted-foreground">
            <strong className="text-foreground">{labelFor(PROJECT_STAGES, item.stage)}</strong> ·
            stage {index + 1} of {PROJECT_STAGES.length}
          </p>
          <div aria-hidden className="grid grid-cols-5 gap-[3px]">
            {PROJECT_STAGES.map((stage, i) => (
              <span
                key={stage.value}
                className={cn(
                  "h-1.5 rounded-full",
                  i < index || finished ? "bg-success" : i === index ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-1">
          {href ? (
            <Button asChild className="w-full">
              <Link href={href}>View project</Link>
            </Button>
          ) : (
            <p className="flex h-11 items-center justify-center rounded-full border border-dashed border-input text-[13px] text-subtle-foreground">
              Not listed publicly
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
