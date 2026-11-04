/**
 * Every URL in the app lives here. Import from this file instead of typing paths by hand,
 * so renaming a route is a one-line change.
 */
/** The three sections of the Explore page (/explore?tab=…). /explore alone opens ?tab=opportunities. */
export type ExploreSection = "opportunities" | "organisations" | "funding";
export const EXPLORE_TAB_PARAM = "tab";

/** /explore URL for a section, optionally with that section's filter query ("theme=energy&page=2"). */
function exploreHref(section: ExploreSection, query = "") {
  const params = new URLSearchParams(query);
  params.delete(EXPLORE_TAB_PARAM);
  const rest = params.toString();
  return `/explore?${EXPLORE_TAB_PARAM}=${section}${rest ? `&${rest}` : ""}`;
}

export const routes = {
  home: "/",
  explore: {
    root: "/explore",
    section: exploreHref,
  },
  opportunities: {
    /** Explore → Opportunities tab. Add filters with routes.explore.section("opportunities", query). */
    list: exploreHref("opportunities"),
    detail: (slug: string) => `/opportunities/${slug}`,
  },
  organisations: {
    list: exploreHref("organisations"),
    detail: (slug: string) => `/organisations/${slug}`,
    projects: (slug: string) => `/organisations/${slug}/projects`,
  },
  funding: {
    list: exploreHref("funding"),
    detail: (slug: string) => `/funding/${slug}`,
  },
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",

  auth: {
    signIn: "/sign-in",
    register: "/register",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },

  onboarding: {
    root: "/onboarding",
    pending: "/onboarding/pending",
  },

  workspace: {
    root: "/workspace",
    recommended: "/workspace/recommended",
    enquiries: "/workspace/enquiries",
    /** Invitations (received · sent), connections and history in one page */
    network: "/workspace/network",
    /** Opens a chat in the messaging dock (on any page that has the dock) */
    chat: (conversationId: string) => `/workspace/network?tab=connections&chat=${conversationId}`,
    messages: "/workspace/messages",
    projects: "/workspace/projects",
    newProject: "/workspace/projects/new",
    /** Continue a saved "List a project" draft */
    projectDraft: (id: string) => `/workspace/projects/new?draft=${id}`,
    /** Edit a project that is in review or was sent back by NCPC */
    editProject: (id: string) => `/workspace/projects/${id}/edit`,
    offers: "/workspace/offers",
    organisation: "/workspace/organisation",
    notifications: "/workspace/notifications",
    settings: "/workspace/settings",
  },

  admin: {
    root: "/admin",
    approvals: "/admin/approvals",
    approval: (id: string) => `/admin/approvals/${id}`,
    file: (id: string) => `/admin/files/${id}`,
    organisations: "/admin/organisations",
    projects: "/admin/projects",
    project: (id: string) => `/admin/projects/${id}`,
    funding: "/admin/funding",
    introductions: "/admin/introductions",
    insights: "/admin/insights",
    users: "/admin/users",
    settings: "/admin/settings",
  },
} as const;
