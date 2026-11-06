/**
 * Ready-made demo content (sample organisations, projects, funding offers, chats).
 * Shown in development only. In production it is off, so the site shows real data only;
 * set DEMO_MODE=1 on a preview deployment to bring it back for a demo.
 */
export const SHOW_DEMO_DATA =
  process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "1";
