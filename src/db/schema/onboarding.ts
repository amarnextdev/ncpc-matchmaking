import { jsonb, pgTable, smallint, timestamp, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

/**
 * Unfinished "Set up your organisation" forms, one per person, so they can leave and come back
 * to the same step. Server-only (no browser grant). Deleted when the form is submitted.
 */
export const onboardingDrafts = pgTable("onboarding_drafts", {
  userId: uuid()
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  /** 0-based step the person was on */
  step: smallint().notNull().default(0),
  /** The form values (checked with draftSchema on save) */
  data: jsonb().notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();
