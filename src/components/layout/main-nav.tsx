"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown, Mail, UsersRound, Wallet, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLinkActive, type HeaderLink, type HeaderSubLink } from "@/config/site";
import { cn } from "@/lib/utils";

const SUB_ICON: Record<HeaderSubLink["icon"], LucideIcon> = {
  organisations: Building2,
  funding: Wallet,
  network: UsersRound,
  contact: Mail,
};

const linkClass = (active: boolean) =>
  cn(
    "relative flex items-center gap-2 px-3.5 text-[15px] whitespace-nowrap transition-colors outline-none focus-visible:text-primary",
    "after:absolute after:inset-x-3.5 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors",
    active
      ? "font-semibold text-primary after:bg-success-bar"
      : "font-medium text-foreground/75 after:bg-transparent hover:text-primary",
  );

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
        if (link.children?.length) {
          return (
            <DropdownMenu key={link.title} modal={false}>
              <DropdownMenuTrigger
                className={cn(linkClass(active), "data-[state=open]:text-primary")}
              >
                {link.title}
                <ChevronDown
                  className="size-4 transition-transform in-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-[300px] rounded-xl p-1.5"
              >
                {link.children.map((c) => {
                  const Icon = SUB_ICON[c.icon];
                  return (
                    <DropdownMenuItem
                      key={c.href}
                      asChild
                      className="items-start gap-3 rounded-lg px-3 py-2.5"
                    >
                      <Link href={c.href}>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <Icon className="size-[18px]" aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="text-sm font-semibold">{c.title}</span>
                          <span className="text-xs leading-4 text-muted-foreground">
                            {c.description}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={linkClass(active)}
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
