"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils";

/** Desktop header links. The active section gets navy text and a green underline. */
export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={cn("hidden items-stretch gap-1 lg:flex", className)}>
      {mainNav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center px-3.5 text-[15px] font-medium transition-colors",
              "after:absolute after:inset-x-3.5 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
              active
                ? "font-semibold text-primary after:bg-success-bar"
                : "text-muted-foreground after:bg-transparent hover:text-foreground",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
