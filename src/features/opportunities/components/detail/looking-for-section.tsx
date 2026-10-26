import { cn } from "@/lib/utils";
import { NEED_META } from "../../detail-meta";
import type { OpportunityDetail } from "../../types";
import { DetailSection } from "./detail-section";

/** Tinted cards, one per role the project needs. */
export function LookingForSection({ opportunity: o }: { opportunity: OpportunityDetail }) {
  if (!o.needs.length) return null;
  return (
    <DetailSection id="looking-for" title="What we're looking for">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {o.needs.map((need) => {
          const meta = NEED_META[need.role];
          const Icon = meta.icon;
          const green = meta.tone === "success";
          return (
            <article
              key={need.role}
              className={cn(
                "flex flex-col gap-3.5 rounded-lg border p-5",
                green ? "border-[#D4E8C4] bg-success-soft" : "border-[#D5E0F2] bg-primary-soft",
              )}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md text-white",
                      green ? "bg-success" : "bg-primary",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3
                    className={cn("text-base font-bold", green ? "text-[#1F4F0C]" : "text-primary")}
                  >
                    {meta.label}
                  </h3>
                </div>
                <span
                  className={cn(
                    "rounded-full bg-white px-2.5 py-1 text-xs font-semibold",
                    green ? "text-[#1F4F0C]" : "text-primary",
                  )}
                >
                  {need.status === "open" ? "Open" : "Filled"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p
                  className={cn(
                    "leading-tight font-bold tracking-tight",
                    need.headline.length > 10 ? "text-xl" : "text-[26px]",
                  )}
                >
                  {need.headline}
                </p>
                <p className="text-sm text-foreground/80">{need.description}</p>
              </div>
              {need.facts.length ? (
                <p
                  className={cn(
                    "mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-[13px] text-muted-foreground",
                    green ? "border-[#D4E8C4]" : "border-[#D5E0F2]",
                  )}
                >
                  {need.facts.map((fact) => (
                    <span key={fact}>{fact}</span>
                  ))}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </DetailSection>
  );
}
