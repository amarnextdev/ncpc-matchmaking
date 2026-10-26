"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SIZES = { sm: "size-3.5", md: "size-[18px]", lg: "size-6", xl: "size-8" } as const;

type VerifiedBadgeProps = {
  size?: keyof typeof SIZES;
  /** "light" = brighter green seal (#5FA83A) for navy or coloured backgrounds. */
  tone?: "default" | "light";
  /** Tooltip text; the part before ":" is the accessible name. Offers use "Approved by NCPC: …". */
  label?: string;
  className?: string;
};

/**
 * The NCPC seal (like a social "verified" tick). After an organisation's name it means "verified";
 * after a funding offer's title it means "approved". Hover or focus explains it.
 */
export function VerifiedBadge({
  size = "md",
  tone = "default",
  label = "Verified by NCPC: company registration, B-BBEE and tax checked",
  className,
}: VerifiedBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={label.split(":")[0]}
          tabIndex={0}
          className={cn(
            "inline-flex shrink-0 rounded-full align-[-0.2em] focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
            tone === "light" ? "text-success-bar" : "text-success",
            className,
          )}
        >
          <svg viewBox="0 0 24 24" aria-hidden className={SIZES[size]}>
            <path
              fill="currentColor"
              d="M12 1.6l2.5 1.8 3.1-.1 1 2.9 2.5 1.8-.9 3 .9 3-2.5 1.8-1 2.9-3.1-.1-2.5 1.8-2.5-1.8-3.1.1-1-2.9-2.5-1.8.9-3-.9-3 2.5-1.8 1-2.9 3.1.1z"
            />
            <path
              d="m8.3 12.2 2.6 2.6 4.9-5.1"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
