import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import {
  docVisibility,
  needStatus,
  partnerRole,
  projectStage,
  projectStatus,
  province,
  theme,
} from "./enums";
import { files } from "./files";
import { organisations } from "./organisations";

export const projects = pgTable(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    orgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    title: text().notNull(),
    summary: text().notNull(),
    description: text(),
    theme: theme().notNull(),
    technologies: text()
      .array()
      .notNull()
      .default(sql`'{}'`),
    province: province().notNull(),
    city: text(),
    site: text(),
    stage: projectStage().notNull().default("idea"),
    status: projectStatus().notNull().default("draft"),
    /** Capital target in ZAR (null = not raising capital) */
    capitalNeeded: bigint({ mode: "number" }),
    /** Sum of confirmed investor/funder partnerships, kept up to date on confirm */
    capitalRaised: bigint({ mode: "number" }).notNull().default(0),
    /** Own funds or earlier partners, entered by the owner (shown as "already raised") */
    ownFunds: bigint({ mode: "number" }).notNull().default(0),
    /** Expected impact per year (shown on the project page, used in NCPC reports) */
    impactCo2Tonnes: integer(),
    impactMwh: integer(),
    impactJobs: integer(),
    impactWaterM3: integer("impact_water_m3"),
    expectedStart: date(),
    /** NCPC review: submitted → live, changes_requested (with a note) or rejected */
    submittedAt: timestamp({ withTimezone: true }),
    reviewNote: text(),
    reviewedAt: timestamp({ withTimezone: true }),
    reviewedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    listedAt: timestamp({ withTimezone: true }),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.orgId),
    index().on(t.status),
    check("projects_capital_positive", sql`${t.capitalRaised} >= 0`),
  ],
).enableRLS();

/** "What we're looking for": one row per role. Found when a partnership is confirmed. */
export const projectNeeds = pgTable(
  "project_needs",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    role: partnerRole().notNull(),
    headline: text(),
    notes: text(),
    /** Amount sought for investor/funder roles (ZAR) */
    amount: bigint({ mode: "number" }),
    status: needStatus().notNull().default("open"),
    foundAt: timestamp({ withTimezone: true }),
  },
  (t) => [uniqueIndex().on(t.projectId, t.role)],
).enableRLS();

export const projectUpdates = pgTable(
  "project_updates",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    stage: projectStage().notNull(),
    title: text().notNull(),
    body: text().notNull(),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.projectId)],
).enableRLS();

/** Photos (public-images bucket). update_id links a photo to a progress update. */
export const projectMedia = pgTable(
  "project_media",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    fileId: uuid()
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    caption: text(),
    isCover: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),
    updateId: uuid().references(() => projectUpdates.id, { onDelete: "set null" }),
  },
  (t) => [
    index().on(t.projectId),
    uniqueIndex("project_media_one_cover")
      .on(t.projectId)
      .where(sql`${t.isCover}`),
  ],
).enableRLS();

/** Documents (private-documents bucket). members_after_enquiry = only connected organisations. */
export const projectDocuments = pgTable(
  "project_documents",
  {
    id: uuid().primaryKey().defaultRandom(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    fileId: uuid()
      .notNull()
      .references(() => files.id, { onDelete: "restrict" }),
    name: text().notNull(),
    visibility: docVisibility().notNull().default("members_after_enquiry"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.projectId)],
).enableRLS();

/**
 * Unfinished "List a project" forms. An organisation can have several. Server-only (no browser
 * grant). Deleted when the project is submitted for review.
 */
export const projectDrafts = pgTable(
  "project_drafts",
  {
    id: uuid().primaryKey().defaultRandom(),
    orgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    /** Copy of the title for lists ("Untitled project" until named) */
    title: text(),
    /** 0-based step the person was on */
    step: smallint().notNull().default(0),
    /** The form values (checked with projectDraftSchema on save) */
    data: jsonb().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.orgId)],
).enableRLS();
