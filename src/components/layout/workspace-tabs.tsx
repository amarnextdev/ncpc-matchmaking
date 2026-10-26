"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { workspaceNav } from "@/config/site";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/** Tabs for the member workspace, shown under the normal site header. */
export function WorkspaceTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Workspace" className="-mb-px flex gap-7 overflow-x-auto">
      {workspaceNav.map((item) => {
        const active =
          item.href === routes.workspace.root
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "border-success-bar font-semibold text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
