import { cn, formatPercent, formatRand } from "@/lib/utils";

type FundingProgressProps = {
  raised: number;
  target: number;
  className?: string;
};

/** Green funding bar with "R10m raised · 55% funded". */
export function FundingProgress({ raised, target, className }: FundingProgressProps) {
  const ratio = target > 0 ? Math.min(1, raised / target) : 0;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="progressbar"
        aria-label="Funding raised"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        className="h-1.5 overflow-hidden rounded-full bg-border"
      >
        <div
          className="h-full rounded-full bg-success-bar"
          style={{ width: formatPercent(ratio) }}
        />
      </div>
      <p className="text-[13px] text-muted-foreground">
        {raised > 0 ? (
          <>
            <strong className="font-semibold text-foreground">{formatRand(raised)}</strong> raised ·{" "}
            {formatPercent(ratio)} funded
          </>
        ) : (
          "No funding committed yet"
        )}
      </p>
    </div>
  );
}
