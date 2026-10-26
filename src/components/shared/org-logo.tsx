import Image from "next/image";
import { cn, initials } from "@/lib/utils";

type OrgLogoProps = {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  /** White ring, for logos that overlap a banner. */
  ring?: boolean;
  className?: string;
};

const SIZES = {
  sm: "size-8 text-[11px] rounded-sm",
  md: "size-12 text-sm rounded-md",
  lg: "size-16 text-lg rounded-lg",
};
const PX = { sm: 32, md: 48, lg: 64 };

/** Organisation logo, or navy initials when there is no logo yet. */
export function OrgLogo({ name, logoUrl, size = "md", ring, className }: OrgLogoProps) {
  const base = cn(
    "flex shrink-0 items-center justify-center overflow-hidden bg-primary font-bold text-primary-foreground",
    SIZES[size],
    ring && "border-[3px] border-background",
    className,
  );
  if (logoUrl) {
    return (
      <span className={cn(base, "bg-background")}>
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={PX[size]}
          height={PX[size]}
          className="size-full object-contain"
        />
      </span>
    );
  }
  return (
    <span className={base} aria-hidden>
      {initials(name)}
    </span>
  );
}
