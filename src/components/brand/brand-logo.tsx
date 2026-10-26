import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** full = logo with tagline, mark = round gear-globe only */
  variant?: "full" | "mark";
  /** default = blue logo for light backgrounds, white = for navy backgrounds */
  tone?: "default" | "white";
  className?: string;
  priority?: boolean;
};

const SOURCES = {
  full: { src: siteConfig.logo.full, width: 500, height: 193 },
  white: { src: siteConfig.logo.white, width: 500, height: 171 },
  mark: { src: siteConfig.logo.mark, width: 128, height: 128 },
} as const;

/** The only place that renders the NCPC logo. Never stretch it: height is set, width is auto. */
export function BrandLogo({
  variant = "full",
  tone = "default",
  className,
  priority,
}: BrandLogoProps) {
  const source =
    variant === "mark" ? SOURCES.mark : tone === "white" ? SOURCES.white : SOURCES.full;
  return (
    <Image
      src={source.src}
      width={source.width}
      height={source.height}
      alt={siteConfig.logo.alt}
      priority={priority}
      className={cn("h-11 w-auto object-contain", className)}
    />
  );
}
