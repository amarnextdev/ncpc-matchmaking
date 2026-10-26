import { cn } from "@/lib/utils";

/** "92% match" pill shown on images and cards (signed-in members only). */
export function MatchBadge({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-background px-3 py-1 text-[13px] font-bold whitespace-nowrap text-primary shadow-[0_2px_8px_rgb(15_23_42/0.12)]",
        className,
      )}
    >
      {score}% match
    </span>
  );
}
