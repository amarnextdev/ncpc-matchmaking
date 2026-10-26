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

/** Who is looking at a page. TODO(Module 3 – Auth): read from the Supabase session. */
export type Viewer = { signedIn: boolean };

/** One number in a stats strip or hero panel. */
export type Stat = {
  label: string;
  value: string;
  /** "warning" = amber value (e.g. closing soon). */ tone?: "warning";
};
