import Link from "next/link";
import { Bell, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/layout/account-menu";
import { MessagesButton } from "@/components/layout/messages-button";
import { routes } from "@/config/routes";
import { homeForStatus } from "@/features/auth/home";
import { labelFor, ORGANISATION_CATEGORIES } from "@/lib/constants";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import type { BellData } from "@/features/notifications/queries";
import type { Viewer } from "@/types";

/** Round icon button with an optional count (Messages) or dot (Alerts). */
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
      title={label}
      aria-label={count ? `${label}, ${count} unread` : label}
      className="relative flex size-11 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <Icon className="size-[21px]" strokeWidth={2} aria-hidden />
      {count ? (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-bold text-white tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Right side of the header.
 *   visitor → Sign in · Register organisation
 *   member  → Messages · Alerts · avatar menu (profile, settings, sign out)
 *   staff   → avatar menu
 *   still registering → a status button + avatar menu
 */
export function HeaderActions({
  viewer,
  unread = 0,
  requests = 0,
  bell,
}: {
  viewer: Viewer;
  unread?: number;
  /** Pending invitations (Network badge) */
  requests?: number;
  bell?: { userId: string; data: BellData };
}) {
  if (viewer.signedIn && viewer.org) {
    return (
      <div className="hidden items-center gap-1 lg:flex">
        <IconLink
          href={routes.workspace.network}
          label="My network"
          icon={UsersRound}
          count={requests}
        />
        <MessagesButton count={unread} />
        {bell ? (
          <NotificationBell userId={bell.userId} initial={bell.data} />
        ) : (
          <IconLink href={routes.workspace.notifications} label="Alerts" icon={Bell} />
        )}
        <AccountMenu
          kind="member"
          label={viewer.org.name}
          sublabel={`Verified member · ${labelFor(ORGANISATION_CATEGORIES, viewer.org.category)}`}
          tint={viewer.org.tint}
        />
      </div>
    );
  }
  if (viewer.account?.isAdmin) {
    return (
      <div className="hidden items-center lg:flex">
        <AccountMenu kind="staff" label={viewer.account.name} sublabel="NCPC staff" />
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
        <AccountMenu
          kind="registering"
          label={viewer.account.name}
          sublabel={viewer.account.email}
        />
      </div>
    );
  }
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Button variant="ghost" className="text-primary" asChild>
        <Link href={routes.auth.signIn}>Sign in</Link>
      </Button>
      <Button asChild>
        <Link href={routes.auth.register}>Register organisation</Link>
      </Button>
    </div>
  );
}
