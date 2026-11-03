import type { OrganisationCategory } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

/** A link in a navigation menu (header, footer, workspace tabs, admin sidebar). */
export type NavItem = {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  /** Show a "Soon" badge and route to the coming-soon page. */
  comingSoon?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** A downloadable file shown on detail pages. */
export type DocumentType = "pdf" | "xlsx" | "doc";
export type DocumentFile = { name: string; url: string; type: DocumentType };

/** The signed-in member's organisation (demo until Auth). */
export type ViewerOrg = {
  slug: string;
  name: string;
  initials: string;
  tint: string;
  category: OrganisationCategory;
  /** The organisation's own listed projects (to attach to an enquiry). */
  projects: { slug: string | null; title: string }[];
};

/** Who is looking at a page. TODO(Module 3 – Auth): read from the Supabase session (see lib/viewer.ts). */
/** Organisation status while onboarding / verification is not finished. */
export type AccountOrgStatus =
  "none" | "draft" | "pending" | "changes_requested" | "rejected" | "suspended";

export type Viewer = {
  /** True for members: signed in AND their organisation is approved. */
  signedIn: boolean;
  org?: ViewerOrg;
  /** Signed in but not (yet) an approved member: what to show and where to send them. */
  account?: {
    name: string;
    email: string;
    orgStatus: AccountOrgStatus;
    /** NCPC staff: no organisation needed, they work in /admin */
    isAdmin?: boolean;
  };
};

/** One number in a stats strip or hero panel. */
export type Stat = {
  label: string;
  value: string;
  /** "warning" = amber value (e.g. closing soon). */ tone?: "warning";
};
