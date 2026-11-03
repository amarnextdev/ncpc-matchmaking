/**
 * Database schema (Drizzle), one file per area. Tables are created by migrations in /drizzle:
 *   npm run db:generate  → writes SQL from these files
 *   npm run db:migrate   → applies it to Supabase
 * RLS is on for every table; the browser only reads messages, conversations, notifications and
 * its own profile/memberships (Realtime). Everything else goes through server code (Drizzle).
 */
export * from "./enums";
export * from "./users";
export * from "./files";
export * from "./organisations";
export * from "./projects";
export * from "./collaboration";
export * from "./funding";
export * from "./notifications";
export * from "./onboarding";
