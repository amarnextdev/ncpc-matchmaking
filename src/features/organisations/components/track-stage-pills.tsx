import Link from "next/link";
import { cn } from "@/lib/utils";

const DOT: Record<string, string> = {
  operational: "bg-success",
  construction: "bg-primary",
  funding: "bg-primary/70",
  feasibility: "bg-primary/45",
  idea: "bg-primary/25",
};

type Stage = { value: string; label: string; count: number };

/** "14 projects · ● 5 Operational · ● 2 Construction …" — each pill links to the filtered list. */
export function TrackStagePills({
  total,
  stages,
  hrefFor,
}: {
  total: number;
  stages: Stage[];
  hrefFor: (stage: string | null) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={hrefFor(null)}
        className="rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover"
      >
        {total} {total === 1 ? "project" : "projects"}
      </Link>
      {[...stages].reverse().map((stage) => (
        <Link
          key={stage.value}
          href={hrefFor(stage.value)}
          className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground/80 hover:border-primary/30 hover:text-primary"
        >
          <span
            aria-hidden
            className={cn("size-2 rounded-full", DOT[stage.value] ?? "bg-border")}
          />
          <strong className="font-semibold text-foreground">{stage.count}</strong> {stage.label}
        </Link>
      ))}
    </div>
  );
}
