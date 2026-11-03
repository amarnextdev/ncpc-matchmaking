import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";
import {
  fundingType,
  memberRole,
  orgCategory,
  orgStatus,
  partnerRole,
  projectStage,
  province,
  theme,
  verificationDoc,
} from "./enums";
import { files } from "./files";

export const organisations = pgTable(
  "organisations",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    category: orgCategory().notNull(),
    status: orgStatus().notNull().default("draft"),

    // Company
    registrationNo: text(),
    province: province(),
    city: text(),
    website: text(),
    bbbeeLevel: text(),
    about: text(),
    /** One line shown under the name on cards */
    summary: text(),

    // Profile look (public-images bucket)
    logoFileId: uuid().references(() => files.id, { onDelete: "set null" }),
    bannerFileId: uuid().references(() => files.id, { onDelete: "set null" }),

    // Matchmaking (fixed lists only)
    themes: theme()
      .array()
      .notNull()
      .default(sql`'{}'`),
    /** What they offer: values of ORGANISATION_OFFERS */
    offers: text()
      .array()
      .notNull()
      .default(sql`'{}'`),
    /** Partners they are looking for (non-capital organisations) */
    lookingFor: partnerRole()
      .array()
      .notNull()
      .default(sql`'{}'`),
    /** Capital providers: finance types, stages they fund and amount per project (ZAR) */
    instruments: fundingType()
      .array()
      .notNull()
      .default(sql`'{}'`),
    stages: projectStage()
      .array()
      .notNull()
      .default(sql`'{}'`),
    investMin: bigint({ mode: "number" }),
    investMax: bigint({ mode: "number" }),

    // Verification
    reviewNote: text(),
    reviewedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    submittedAt: timestamp({ withTimezone: true }),
    approvedAt: timestamp({ withTimezone: true }),

    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.status),
    index().on(t.category),
    index("organisations_themes_gin").using("gin", t.themes),
    check(
      "organisations_invest_range",
      sql`${t.investMin} is null or ${t.investMax} is null or ${t.investMin} <= ${t.investMax}`,
    ),
  ],
).enableRLS();

/** People who act for an organisation. owner/admin can act; member can view. */
export const organisationMembers = pgTable(
  "organisation_members",
  {
    orgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    role: memberRole().notNull().default("member"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.orgId, t.userId] }),
    index().on(t.userId),
    pgPolicy("org_members_read_own", {
      for: "select",
      to: authenticatedRole,
      using: sql`${authUid} = ${t.userId}`,
    }),
  ],
).enableRLS();

/** CIPC, B-BBEE and tax documents (private-documents bucket). Only the organisation and NCPC see them. */
export const organisationDocuments = pgTable(
  "organisation_documents",
  {
    id: uuid().primaryKey().defaultRandom(),
    orgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    kind: verificationDoc().notNull(),
    fileId: uuid()
      .notNull()
      .references(() => files.id, { onDelete: "restrict" }),
    uploadedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.orgId, t.kind)],
).enableRLS();

/** Organisations that blocked each other: no enquiries, deals or messages between them. */
export const organisationBlocks = pgTable(
  "organisation_blocks",
  {
    blockerOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    blockedOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.blockerOrgId, t.blockedOrgId] })],
).enableRLS();
