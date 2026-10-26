import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FolderKanban,
  Handshake,
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { routes } from "@/config/routes";
import type { NavGroup, NavItem } from "@/types";

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

/** Public header navigation. */
export const mainNav: NavItem[] = [
  { title: "Opportunities", href: routes.opportunities.list },
  { title: "Organisations", href: routes.organisations.list, comingSoon: true },
  { title: "Funding", href: routes.funding.list, comingSoon: true },
  { title: "About", href: routes.about, comingSoon: true },
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

/** Member workspace tabs (shown under the public header). */
export const workspaceNav: NavItem[] = [
  { title: "Overview", href: routes.workspace.root, icon: LayoutDashboard },
  { title: "Recommended", href: routes.workspace.recommended, icon: Sparkles },
  { title: "Enquiries", href: routes.workspace.enquiries, icon: Inbox },
  { title: "My projects", href: routes.workspace.projects, icon: FolderKanban },
  { title: "Organisation", href: routes.workspace.organisation, icon: Building2 },
  { title: "Settings", href: routes.workspace.settings, icon: Settings },
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
