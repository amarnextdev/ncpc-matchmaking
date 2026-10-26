"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainNav, siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/** Mobile menu panel under the header. Replaced by a shadcn Sheet when that component is added. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
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
          className="absolute inset-x-0 top-full z-40 border-b bg-background shadow-overlay"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
            {mainNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-3 text-base font-medium",
                    active ? "bg-primary-soft text-primary" : "hover:bg-muted",
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-4">
              <Button variant="outline" asChild>
                <Link href={routes.auth.signIn}>Sign in</Link>
              </Button>
              <Button asChild>
                <Link href={routes.auth.register}>Register</Link>
              </Button>
            </div>
            <a
              href={siteConfig.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground"
            >
              Visit ncpc.co.za <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
