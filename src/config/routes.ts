/**
 * Every URL in the app lives here. Import from this file instead of typing paths by hand,
 * so renaming a route is a one-line change.
 */
export const routes = {
  home: "/",
  opportunities: {
    list: "/opportunities",
    detail: (slug: string) => `/opportunities/${slug}`,
  },
  organisations: {
    list: "/organisations",
    detail: (slug: string) => `/organisations/${slug}`,
    projects: (slug: string) => `/organisations/${slug}/projects`,
  },
  funding: {
    list: "/funding",
    detail: (slug: string) => `/funding/${slug}`,
  },
  about: "/about",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",

  auth: {
    signIn: "/sign-in",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },

  workspace: {
    root: "/workspace",
    recommended: "/workspace/recommended",
    enquiries: "/workspace/enquiries",
    projects: "/workspace/projects",
    organisation: "/workspace/organisation",
    notifications: "/workspace/notifications",
    settings: "/workspace/settings",
  },

  admin: {
    root: "/admin",
    approvals: "/admin/approvals",
    organisations: "/admin/organisations",
    projects: "/admin/projects",
    funding: "/admin/funding",
    introductions: "/admin/introductions",
    insights: "/admin/insights",
    users: "/admin/users",
    settings: "/admin/settings",
  },
} as const;
