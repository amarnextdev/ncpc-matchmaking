"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { adminNav } from "@/config/site";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/** Navy sidebar for the NCPC admin panel. */
export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col gap-6 bg-primary px-4 py-6 text-[#D6E0F0] lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0">
      <Link href={routes.admin.root} aria-label="Admin home" className="px-2">
        <BrandLogo tone="white" className="h-10" />
      </Link>
      <nav aria-label="Admin" className="flex flex-col gap-5 overflow-y-auto">
        {adminNav.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#93A8C9] uppercase">
              {group.title}
            </p>
            {group.items.map((item) => {
              const active =
                item.href === routes.admin.root
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white",
                  )}
                >
                  {Icon ? <Icon className="size-4" aria-hidden /> : null}
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
