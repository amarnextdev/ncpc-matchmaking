import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import {
  applicationStatus,
  fundingType,
  offerStatus,
  orgCategory,
  projectStage,
  province,
  theme,
} from "./enums";
import { organisations } from "./organisations";
import { projects } from "./projects";

/** Funding offers posted by funders and investors (checked by NCPC before going live). */
export const fundingOffers = pgTable(
  "funding_offers",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    providerOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    title: text().notNull(),
    type: fundingType().notNull(),
    summary: text().notNull(),
    about: text(),
    amountMin: bigint({ mode: "number" }),
    amountMax: bigint({ mode: "number" }),
    themes: theme()
      .array()
      .notNull()
      .default(sql`'{}'`),
    stages: projectStage()
      .array()
      .notNull()
      .default(sql`'{}'`),
    eligibleCategories: orgCategory()
      .array()
      .notNull()
      .default(sql`'{}'`),
    /** Empty = all nine provinces */
    provinces: province()
      .array()
      .notNull()
      .default(sql`'{}'`),
    criteria: text()
      .array()
      .notNull()
      .default(sql`'{}'`),
    /** null with rolling = open all year */
    deadline: date(),
    rolling: boolean().notNull().default(false),
    status: offerStatus().notNull().default("draft"),
    approvedAt: timestamp({ withTimezone: true }),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.status),
    index().on(t.providerOrgId),
    check(
      "funding_offers_amount_range",
      sql`${t.amountMin} is null or ${t.amountMax} is null or ${t.amountMin} <= ${t.amountMax}`,
    ),
  ],
).enableRLS();

/** A project applying for an offer. */
export const fundingApplications = pgTable(
  "funding_applications",
  {
    id: uuid().primaryKey().defaultRandom(),
    offerId: uuid()
      .notNull()
      .references(() => fundingOffers.id, { onDelete: "cascade" }),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    applicantOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    note: varchar({ length: 1000 }),
    status: applicationStatus().notNull().default("submitted"),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("funding_applications_one_open")
      .on(t.offerId, t.projectId)
      .where(sql`${t.status} in ('submitted', 'shortlisted')`),
    index().on(t.applicantOrgId),
  ],
).enableRLS();
