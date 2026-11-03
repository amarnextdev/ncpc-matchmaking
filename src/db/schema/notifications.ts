import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  index,
  jsonb,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";
import { savedItemType } from "./enums";

/** In-app notifications (bell). Read by Realtime in the browser: own rows only. */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    /** e.g. enquiry_received, enquiry_accepted, request_received, form_submitted, partnership_active */
    kind: text().notNull(),
    title: text().notNull(),
    body: text(),
    link: text(),
    readAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.userId, t.createdAt),
    pgPolicy("notifications_read_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid} = ${t.userId}`,
    }),
  ],
).enableRLS();

export const notificationSettings = pgTable("notification_settings", {
  userId: uuid()
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  emailEnquiries: boolean().notNull().default(true),
  emailMessages: boolean().notNull().default(true),
  emailDeals: boolean().notNull().default(true),
  emailDigest: boolean().notNull().default(true),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const savedItems = pgTable(
  "saved_items",
  {
    userId: uuid()
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    itemType: savedItemType().notNull(),
    itemId: uuid().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemType, t.itemId] })],
).enableRLS();

/** Every important change (who did what). Written by server actions only. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    actorId: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    action: text().notNull(),
    entity: text().notNull(),
    entityId: uuid(),
    details: jsonb(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.entity, t.entityId)],
).enableRLS();
