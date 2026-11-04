"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLinkActive, siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export type MobileNavGroup = {
  title: string;
  items: { title: string; href: string; exact?: boolean; count?: number }[];
};

/** Mobile menu panel under the header: the role's links in groups (My work · Explore · Account). */
export function MobileNav({
  groups,
  signedIn = false,
}: {
  groups: MobileNavGroup[];
  signedIn?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, startTransition] = useTransition();
  const pathname = usePathname();

  // Close the menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <Button
        variant="outline"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>
      {open ? (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-76px)] overflow-y-auto border-b bg-background shadow-overlay"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-5 p-4">
            {groups.map((group) => (
              <div key={group.title} className="flex flex-col gap-0.5">
                <p className="px-3 pb-1 text-xs font-semibold tracking-[0.08em] text-subtle-foreground uppercase">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const active = isLinkActive({ match: [item.href], exact: item.exact }, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium",
                        active ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted",
                      )}
                    >
                      {item.title}
                      {item.count ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                          {item.count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))}

            <div className="border-t pt-4">
              {signedIn ? (
                <Button
                  variant="outline"
                  className="w-full text-destructive"
                  disabled={signingOut}
                  onClick={() => startTransition(() => signOutAction())}
                >
                  <LogOut aria-hidden /> {signingOut ? "Signing out…" : "Sign out"}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild>
                    <Link href={routes.auth.signIn}>Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href={routes.auth.register}>Register</Link>
                  </Button>
                </div>
              )}
            </div>
            <a
              href={siteConfig.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="-mt-2 inline-flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground"
            >
              Visit ncpc.co.za <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
