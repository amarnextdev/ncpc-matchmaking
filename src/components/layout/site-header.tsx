import { BrandLockup } from "@/components/layout/brand-lockup";
import { Container } from "@/components/layout/container";
import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderShell } from "@/components/layout/header-shell";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav, type MobileNavGroup } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";
import { routes } from "@/config/routes";
import { exploreNav, headerNavFor, roleOf, workLinkFor } from "@/config/site";
import type { BellData } from "@/features/notifications/queries";
import type { Viewer } from "@/types";

/**
 * One header for everyone; the links change with the role (config/site.ts → headerNavFor):
 *   visitor  [logo]  Explore  How it works                          Sign in  [Register organisation]
 *   member   [logo]  Dashboard  Explore  Enquiries (3)  My projects   💬  🔔  (avatar ▾)
 *   staff    [logo]  Explore  Admin panel                             (avatar ▾)
 */
export function SiteHeader({
  viewer,
  unread = 0,
  requests = 0,
  bell,
}: {
  viewer: Viewer;
  unread?: number;
  requests?: number;
  /** Live notifications for a signed-in member */
  bell?: { userId: string; data: BellData };
}) {
  const role = roleOf(viewer);
  const links = headerNavFor(viewer, { enquiries: requests });

  return (
    <>
      <TopBar />
      <HeaderShell>
        <Container className="relative flex h-[76px] items-stretch gap-8 xl:gap-10">
          <div className="flex items-center">
            <BrandLockup href={role === "member" ? routes.workspace.root : routes.home} />
          </div>
          <MainNav links={links} className="flex-1" />
          <div className="ml-auto flex items-center gap-2">
            <HeaderActions viewer={viewer} unread={unread} requests={requests} bell={bell} />
            <MobileNav
              groups={mobileGroups(viewer, { unread, requests })}
              signedIn={role !== "visitor" || Boolean(viewer.account)}
            />
          </div>
        </Container>
      </HeaderShell>
    </>
  );
}

/** Mobile menu: the same links as desktop, grouped so nothing repeats. */
function mobileGroups(
  viewer: Viewer,
  { unread, requests }: { unread: number; requests: number },
): MobileNavGroup[] {
  const explore: MobileNavGroup = {
    title: "Explore",
    items: [...exploreNav, { title: "How it works", href: routes.about }],
  };
  const role = roleOf(viewer);

  if (role === "member" && viewer.org) {
    const work = workLinkFor(viewer.org.category);
    return [
      {
        title: "My work",
        items: [
          { title: "Dashboard", href: routes.workspace.root, exact: true },
          { title: "My network", href: routes.workspace.network, count: requests },
          {
            title: "Messages",
            href: `${routes.workspace.network}?tab=connections&dock=1`,
            count: unread,
          },
          ...(work ? [{ title: work.title, href: work.href }] : []),
          { title: "Alerts", href: routes.workspace.notifications },
        ],
      },
      explore,
      {
        title: "Account",
        items: [
          { title: "Organisation profile", href: routes.workspace.organisation },
          { title: "Settings", href: routes.workspace.settings },
          { title: "Help centre", href: routes.contact },
        ],
      },
    ];
  }
  if (role === "staff") {
    return [{ title: "NCPC", items: [{ title: "Admin panel", href: routes.admin.root }] }, explore];
  }
  return [explore];
}
