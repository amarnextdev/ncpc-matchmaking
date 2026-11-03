import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-[30px] rounded-[8px] text-[11px]",
  md: "size-9 rounded-[10px] text-xs",
  lg: "size-11 rounded-md text-sm",
} as const;

/** Square initials tile in the organisation's colour (chat lists and messages). */
export function OrgAvatar({
  initials,
  tint,
  size = "lg",
  className,
}: {
  initials: string;
  tint: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-white",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: tint }}
    >
      {initials}
    </span>
  );
}
