import Link from "next/link";
import { Bell, MessageSquare, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { routes } from "@/config/routes";
import { homeForStatus } from "@/features/auth/home";
import type { Viewer } from "@/types";

function IconLink({
  href,
  label,
  icon: Icon,
  count,
}: {
  href: string;
  label: string;
  icon: typeof Bell;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      <Icon className="size-[22px]" aria-hidden />
      {label}
      {count ? (
        <span className="absolute top-0 right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold text-white">
          <span className="sr-only">, </span>
          {count}
          <span className="sr-only"> new</span>
        </span>
      ) : null}
    </Link>
  );
}

/** Right side of the header: visitors get Sign in / Register; members get Network, Messages, Alerts and their organisation. */
export function HeaderActions({
  viewer,
  unread = 0,
  requests = 0,
}: {
  viewer: Viewer;
  unread?: number;
  requests?: number;
}) {
  if (viewer.signedIn && viewer.org) {
    return (
      <div className="hidden items-center gap-1 lg:flex">
        <IconLink
          href={routes.workspace.enquiries}
          label="My network"
          icon={Users}
          count={requests}
        />
        <IconLink
          href={routes.workspace.messages}
          label="Messages"
          icon={MessageSquare}
          count={unread}
        />
        <IconLink href={routes.workspace.notifications} label="Alerts" icon={Bell} />
        <AccountMenu
          label={viewer.org.name}
          sublabel="Verified member"
          tint={viewer.org.tint}
          member
        />
      </div>
    );
  }
  if (viewer.account?.isAdmin) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Button asChild>
          <Link href={routes.admin.root}>Admin panel</Link>
        </Button>
        <AccountMenu label={viewer.account.name} sublabel="NCPC staff" member={false} admin />
      </div>
    );
  }
  if (viewer.account) {
    const reviewing = viewer.account.orgStatus === "pending";
    const blocked =
      viewer.account.orgStatus === "rejected" || viewer.account.orgStatus === "suspended";
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Button variant={reviewing || blocked ? "outline" : "default"} asChild>
          <Link href={homeForStatus(viewer.account.orgStatus)}>
            {reviewing ? "Under review" : blocked ? "Registration status" : "Finish registration"}
          </Link>
        </Button>
        <AccountMenu label={viewer.account.name} sublabel={viewer.account.email} member={false} />
      </div>
    );
  }
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Button variant="ghost" size="icon" aria-label="Search opportunities" asChild>
        <Link href={routes.opportunities.list}>
          <Search className="size-5" />
        </Link>
      </Button>
      <span aria-hidden className="mx-1 h-6 w-px bg-border" />
      <Button variant="ghost" className="text-primary" asChild>
        <Link href={routes.auth.signIn}>Sign in</Link>
      </Button>
      <Button asChild>
        <Link href={routes.auth.register}>Register organisation</Link>
      </Button>
    </div>
  );
}
