"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react";
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
  /** Shown on the avatar: the organisation for members, the person otherwise */
  label: string;
  sublabel?: string;
  tint?: string;
  /** Members get workspace links; people still onboarding only get sign out */
  member: boolean;
  /** NCPC staff get a link to the admin panel */
  admin?: boolean;
};

export function AccountMenu({ label, sublabel, tint, member, admin = false }: AccountMenuProps) {
  const [pending, startTransition] = React.useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu · ${label}`}
        className="ml-2 flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
        style={tint ? { backgroundColor: tint } : undefined}
      >
        {initials(label)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{label}</span>
          {sublabel ? (
            <span className="truncate text-xs font-normal text-muted-foreground">{sublabel}</span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {admin ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={routes.admin.root}>
                <ShieldCheck aria-hidden /> Admin panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {member ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={routes.workspace.root}>
                <LayoutDashboard aria-hidden /> My workspace
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={routes.workspace.organisation}>
                <Building2 aria-hidden /> Organisation profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={routes.workspace.settings}>
                <Settings aria-hidden /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            startTransition(() => signOutAction());
          }}
        >
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
