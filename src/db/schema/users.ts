import { pgPolicy, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";
import { platformRole } from "./enums";

/** One row per Supabase Auth user (same id). */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid()
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    fullName: text().notNull(),
    jobTitle: text(),
    phone: text(),
    platformRole: platformRole().notNull().default("member"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  () => [
    pgPolicy("profiles_read_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid} = id`,
    }),
  ],
).enableRLS();
