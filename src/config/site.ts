import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { routes } from "@/config/routes";
import type { OrganisationCategory } from "@/lib/constants";
import type { NavGroup, NavItem, Viewer } from "@/types";

export const siteConfig = {
  name: "NCPC Matchmaking",
  shortName: "NCPC",
  description:
    "Investment and partnership marketplace for sustainable industrial projects in South Africa, run by the National Cleaner Production Centre.",
  organisation: "National Cleaner Production Centre South Africa",
  host: "Hosted by the CSIR",
  externalUrl: "https://www.ncpc.co.za",
  logo: {
    full: "/brand/ncpc-logo.png",
    white: "/brand/ncpc-logo-white.png",
    mark: "/brand/ncpc-mark.png",
    alt: "NCPC – Industrial Efficiency in South Africa",
  },
} as const;

/**
 * Header navigation, by role. One list per role so links are never doubled:
 *   visitor  → Explore · How it works
 *   member   → Dashboard · Explore · My projects | My offers  (Network and Messages are icons)
 *   staff    → Explore · Admin panel
 * Messages and Alerts are icons on the right; profile and settings live in the avatar menu.
 */
export type HeaderLink = {
  title: string;
  href: string;
  /** Paths that make this link active (prefix match unless `exact`). */
  match: string[];
  exact?: boolean;
  /** Small count badge, e.g. new enquiries. */
  count?: number;
  /** Makes the link a dropdown (e.g. Community). */
  children?: HeaderSubLink[];
};

export type HeaderSubLink = {
  title: string;
  href: string;
  description: string;
  /** Icon name, resolved in MainNav (icons can't be passed from server to client). */
  icon: "organisations" | "funding" | "network" | "contact";
};

/** Community dropdown: who is on the platform and how to reach NCPC. */
function communityLink(signedIn: boolean): HeaderLink {
  const children: HeaderSubLink[] = [
    {
      title: "Member directory",
      href: routes.explore.section("organisations"),
      description: "Verified organisations on the platform",
      icon: "organisations",
    },
    {
      title: "Funding partners",
      href: routes.explore.section("funding"),
      description: "Funders, grants and investment offers",
      icon: "funding",
    },
    ...(signedIn
      ? [
          {
            title: "My network",
            href: routes.workspace.network,
            description: "Your connections and invitations",
            icon: "network" as const,
          },
        ]
      : []),
    {
      title: "Contact NCPC",
      href: routes.contact,
      description: "Questions, support and partnerships",
      icon: "contact",
    },
  ];
  return {
    title: "Community",
    href: routes.workspace.network,
    match: [routes.workspace.network, routes.contact],
    children,
  };
}

const aboutLink: HeaderLink = { title: "About", href: routes.about, match: [routes.about] };

/** Paths that belong to Explore (the three browse sections). */
const exploreMatch = [routes.explore.root, "/opportunities", "/organisations", "/funding"];

/** Categories that publish projects (get "My projects"). Investors only browse; funders publish offers. */
const LISTS_PROJECTS: OrganisationCategory[] = [
  "project_developer",
  "industrial_park",
  "sez",
  "tenant",
  "property_developer",
  "esco",
  "technology_provider",
];

export type ViewerRole = "visitor" | "member" | "staff";

export function roleOf(viewer: Viewer): ViewerRole {
  if (viewer.signedIn && viewer.org) return "member";
  if (viewer.account?.isAdmin) return "staff";
  return "visitor";
}

/** The member's own-work link, if their category has one. */
export function workLinkFor(category: OrganisationCategory): HeaderLink | null {
  if (category === "funder") {
    return { title: "My offers", href: routes.workspace.offers, match: [routes.workspace.offers] };
  }
  if (LISTS_PROJECTS.includes(category)) {
    return {
      title: "My projects",
      href: routes.workspace.projects,
      match: [routes.workspace.projects],
    };
  }
  return null;
}

export function headerNavFor(viewer: Viewer, _counts: { enquiries?: number } = {}): HeaderLink[] {
  const explore: HeaderLink = {
    title: "Explore",
    href: routes.explore.root,
    match: exploreMatch,
  };
  const role = roleOf(viewer);
  if (role === "member" && viewer.org) {
    const work = workLinkFor(viewer.org.category);
    return [
      {
        title: "Dashboard",
        href: routes.workspace.root,
        match: [routes.workspace.root, routes.workspace.recommended],
        exact: true,
      },
      explore,
      ...(work ? [work] : []),
      communityLink(true),
      aboutLink,
    ];
  }
  if (role === "staff") {
    return [
      explore,
      { title: "Admin panel", href: routes.admin.root, match: [routes.admin.root] },
      communityLink(false),
      aboutLink,
    ];
  }
  return [explore, communityLink(false), aboutLink];
}

/** Is a header link active for this pathname? */
export function isLinkActive(link: Pick<HeaderLink, "match" | "exact">, pathname: string) {
  return link.match.some((m) =>
    link.exact ? pathname === m : pathname === m || pathname.startsWith(`${m}/`),
  );
}

/** The browse sections, used in the mobile menu and the Explore tabs. */
export const exploreNav: NavItem[] = [
  { title: "Opportunities", href: routes.opportunities.list },
  { title: "Organisations", href: routes.organisations.list },
  { title: "Funding", href: routes.funding.list },
];

/** Footer link groups. */
export const footerNav: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { title: "Opportunities", href: routes.opportunities.list },
      { title: "Organisations", href: routes.organisations.list },
      { title: "Funding", href: routes.funding.list },
    ],
  },
  {
    title: "NCPC",
    items: [
      { title: "About", href: routes.about },
      { title: "Contact", href: routes.contact },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy", href: routes.privacy },
      { title: "Terms of use", href: routes.terms },
    ],
  },
];

/** NCPC admin sidebar. */
export const adminNav: NavGroup[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: routes.admin.root, icon: LayoutDashboard }],
  },
  {
    title: "Members",
    items: [
      { title: "Approvals", href: routes.admin.approvals, icon: ClipboardCheck },
      { title: "Organisations", href: routes.admin.organisations, icon: Building2 },
      { title: "Users", href: routes.admin.users, icon: Users },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { title: "Projects", href: routes.admin.projects, icon: FolderKanban },
      { title: "Funding offers", href: routes.admin.funding, icon: Wallet },
      { title: "Introductions", href: routes.admin.introductions, icon: Handshake },
    ],
  },
  {
    title: "Reports",
    items: [
      { title: "Insights", href: routes.admin.insights, icon: BarChart3 },
      { title: "Settings", href: routes.admin.settings, icon: Settings },
    ],
  },
];
