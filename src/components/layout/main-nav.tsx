"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLinkActive, type HeaderLink } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Desktop header links for the current role (see headerNavFor).
 * The active link gets navy text and a green underline on the header's bottom edge.
 */
export function MainNav({ links, className }: { links: HeaderLink[]; className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={cn("hidden items-stretch gap-1 lg:flex", className)}>
      {links.map((link) => {
        const active = isLinkActive(link, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-2 px-3.5 text-[15px] whitespace-nowrap transition-colors",
              "after:absolute after:inset-x-3.5 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors",
              active
                ? "font-semibold text-primary after:bg-success-bar"
                : "font-medium text-foreground/75 after:bg-transparent hover:text-primary",
            )}
          >
            {link.title}
            {link.count ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground tabular-nums">
                {link.count}
                <span className="sr-only"> new</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
