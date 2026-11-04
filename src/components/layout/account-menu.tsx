"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  CircleHelp,
  LogOut,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth/actions";
import { initials } from "@/lib/utils";

type AccountMenuProps = {
  /** member = approved organisation · staff = NCPC admin · registering = onboarding / under review */
  kind: "member" | "staff" | "registering";
  /** Shown on the avatar: the organisation for members, the person otherwise */
  label: string;
  sublabel?: string;
  tint?: string;
};

const ITEMS: Record<AccountMenuProps["kind"], { title: string; href: string; icon: LucideIcon }[]> =
  {
    member: [
      { title: "Organisation profile", href: routes.workspace.organisation, icon: Building2 },
      { title: "Settings", href: routes.workspace.settings, icon: Settings },
      { title: "Help centre", href: routes.contact, icon: CircleHelp },
    ],
    staff: [
      { title: "Admin panel", href: routes.admin.root, icon: ShieldCheck },
      { title: "Help centre", href: routes.contact, icon: CircleHelp },
    ],
    registering: [{ title: "Help centre", href: routes.contact, icon: CircleHelp }],
  };

/** Avatar button + menu. Everything about "me" lives here, so the header stays short. */
export function AccountMenu({ kind, label, sublabel, tint }: AccountMenuProps) {
  const [pending, startTransition] = React.useTransition();
  const style = tint ? { backgroundColor: tint } : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu · ${label}`}
        className="group ml-1.5 flex h-11 items-center gap-1.5 rounded-full border bg-background py-1 pr-2.5 pl-1 transition-colors hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none data-[state=open]:border-primary"
      >
        <span
          className="flex size-[34px] items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
          style={style}
        >
          {initials(label)}
        </span>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
          strokeWidth={2.4}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-72 rounded-2xl p-2">
        <DropdownMenuLabel className="mb-1 flex items-center gap-3 px-3 pt-2.5 pb-3.5 font-normal">
          <span
            className="flex size-[42px] shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white"
            style={style}
          >
            {initials(label)}
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-bold text-foreground">{label}</span>
            {sublabel ? (
              <span className="truncate text-xs text-muted-foreground">{sublabel}</span>
            ) : null}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ITEMS[kind].map(({ title, href, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild className="gap-3 rounded-lg px-3 py-2.5 text-sm">
            <Link href={href}>
              <Icon aria-hidden /> {title}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          className="gap-3 rounded-lg px-3 py-2.5 text-sm"
          onSelect={(e) => {
            e.preventDefault();
            startTransition(() => signOutAction());
          }}
        >
          <LogOut aria-hidden /> {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
