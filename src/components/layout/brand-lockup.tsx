import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { routes } from "@/config/routes";

/** NCPC logo + product name, used in the header. */
export function BrandLockup() {
  return (
    <Link
      href={routes.home}
      aria-label="NCPC Matchmaking home"
      className="flex shrink-0 items-center gap-4"
    >
      <BrandLogo className="h-9 xl:h-10" priority />
      <span aria-hidden className="hidden h-8 w-px bg-border sm:block" />
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="text-[15px] font-bold tracking-tight text-primary">Matchmaking</span>
        <span className="text-xs text-subtle-foreground">Sustainable industrial spaces</span>
      </span>
    </Link>
  );
}
