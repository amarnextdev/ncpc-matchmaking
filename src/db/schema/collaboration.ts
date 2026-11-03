import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";
import {
  collabRequestStatus,
  dealStage,
  enquiryStatus,
  introStatus,
  partnerRole,
  partnershipStatus,
} from "./enums";
import { files } from "./files";
import { organisationMembers, organisations } from "./organisations";
import { projects } from "./projects";

/**
 * Collaboration flow (agreed 26 Oct 2026, see docs/04):
 * enquiry → accepted → conversation (one per org pair) → deal (one per project)
 * → collaboration request (owner) → role form (partner) → partnership (both confirm).
 */

/** 1–2. Enquiry for one role on one project (note max 300 chars, expires after 30 days). */
export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid().primaryKey().defaultRandom(),
    fromOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    toOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
    role: partnerRole().notNull(),
    note: varchar({ length: 300 }),
    matchScore: integer(),
    status: enquiryStatus().notNull().default("pending"),
    closedReason: text(),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    respondedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp({ withTimezone: true }),
    expiresAt: timestamp({ withTimezone: true })
      .notNull()
      .default(sql`now() + interval '30 days'`),
  },
  (t) => [
    index().on(t.toOrgId, t.status),
    index().on(t.fromOrgId, t.status),
    // One open enquiry per sender, project and role
    uniqueIndex("enquiries_one_pending")
      .on(t.fromOrgId, t.projectId, t.role)
      .where(sql`${t.status} = 'pending'`),
    check("enquiries_not_self", sql`${t.fromOrgId} <> ${t.toOrgId}`),
  ],
).enableRLS();

/** 3. One private chat per pair of organisations (org_a < org_b). */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid().primaryKey().defaultRandom(),
    orgAId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    orgBId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    /** The enquiry or introduction that opened the chat */
    openedByEnquiryId: uuid().references(() => enquiries.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    lastMessageAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    uniqueIndex("conversations_pair").on(t.orgAId, t.orgBId),
    check("conversations_ordered_pair", sql`${t.orgAId} < ${t.orgBId}`),
    pgPolicy("conversations_read_members", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (select 1 from ${organisationMembers} m where m.user_id = ${authUid} and m.org_id in (${t.orgAId}, ${t.orgBId}))`,
    }),
  ],
).enableRLS();

export const messages = pgTable(
  "messages",
  {
    id: uuid().primaryKey().defaultRandom(),
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderUserId: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    senderOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    body: text().notNull(),
    /** Private file (private-documents bucket) */
    attachmentFileId: uuid().references(() => files.id, { onDelete: "set null" }),
    /** Optional: which deal this message is about */
    dealId: uuid(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    removedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index().on(t.conversationId, t.createdAt),
    // Read by Realtime in the browser: members of either organisation only
    pgPolicy("messages_read_members", {
      for: "select",
      to: authenticatedRole,
      using: sql`exists (select 1 from ${conversations} c join ${organisationMembers} m on m.org_id in (c.org_a_id, c.org_b_id) where c.id = ${t.conversationId} and m.user_id = ${authUid})`,
    }),
  ],
).enableRLS();

/** Unread state per person. */
export const conversationReads = pgTable(
  "conversation_reads",
  {
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    lastReadAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.conversationId, t.userId] })],
).enableRLS();

/** 4. One deal per project inside a conversation. Stage moved by the owner only. */
export const deals = pgTable(
  "deals",
  {
    id: uuid().primaryKey().defaultRandom(),
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    /** The organisation that owns the project */
    ownerOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    partnerOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    role: partnerRole().notNull(),
    stage: dealStage().notNull().default("in_discussion"),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("deals_one_per_project").on(t.conversationId, t.projectId),
    index().on(t.projectId),
    check("deals_two_orgs", sql`${t.ownerOrgId} <> ${t.partnerOrgId}`),
  ],
).enableRLS();

/**
 * 5–6. Owner sends a request; partner fills the role form (Zod-validated, see
 * features/collaboration/forms.ts); owner accepts or asks for changes.
 */
export const collaborationRequests = pgTable(
  "collaboration_requests",
  {
    id: uuid().primaryKey().defaultRandom(),
    dealId: uuid()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    role: partnerRole().notNull(),
    status: collabRequestStatus().notNull().default("requested"),
    /** The partner's answers for their role */
    form: jsonb(),
    /** Owner's message when asking for changes */
    ownerNote: text(),
    version: integer().notNull().default(0),
    sentBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    submittedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp({ withTimezone: true }),
    reviewedAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    index().on(t.dealId),
    // Only one open request per deal at a time
    uniqueIndex("collab_requests_one_open")
      .on(t.dealId)
      .where(sql`${t.status} in ('requested', 'submitted', 'changes_requested')`),
  ],
).enableRLS();

/** Every submitted version of a form, for the history. */
export const collaborationRequestVersions = pgTable(
  "collaboration_request_versions",
  {
    id: uuid().primaryKey().defaultRandom(),
    requestId: uuid()
      .notNull()
      .references(() => collaborationRequests.id, { onDelete: "cascade" }),
    version: integer().notNull(),
    form: jsonb().notNull(),
    submittedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.requestId, t.version)],
).enableRLS();

/** 7. Partnership: active once BOTH sides confirm the agreement they signed outside the platform. */
export const partnerships = pgTable(
  "partnerships",
  {
    id: uuid().primaryKey().defaultRandom(),
    dealId: uuid()
      .notNull()
      .unique()
      .references(() => deals.id, { onDelete: "restrict" }),
    requestId: uuid().references(() => collaborationRequests.id, { onDelete: "set null" }),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    ownerOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    partnerOrgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    role: partnerRole().notNull(),
    /** Investor/funder amount in ZAR, added to the project's capital raised */
    amount: bigint({ mode: "number" }),
    amountPublic: boolean().notNull().default(true),
    status: partnershipStatus().notNull().default("awaiting_confirmation"),
    ownerConfirmedAt: timestamp({ withTimezone: true }),
    ownerConfirmedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    partnerConfirmedAt: timestamp({ withTimezone: true }),
    partnerConfirmedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    activatedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.projectId),
    index().on(t.partnerOrgId),
    check(
      "partnerships_active_needs_both",
      sql`${t.status} <> 'active' or (${t.ownerConfirmedAt} is not null and ${t.partnerConfirmedAt} is not null)`,
    ),
  ],
).enableRLS();

/** Notes only the writing organisation sees. */
export const dealNotes = pgTable(
  "deal_notes",
  {
    id: uuid().primaryKey().defaultRandom(),
    dealId: uuid()
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    orgId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    body: text().notNull(),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.dealId, t.orgId)],
).enableRLS();

/** NCPC introduces two organisations; when both accept, their conversation opens. */
export const introductions = pgTable(
  "introductions",
  {
    id: uuid().primaryKey().defaultRandom(),
    orgAId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    orgBId: uuid()
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),
    projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
    reason: text().notNull(),
    statusA: introStatus().notNull().default("pending"),
    statusB: introStatus().notNull().default("pending"),
    conversationId: uuid().references(() => conversations.id, { onDelete: "set null" }),
    createdBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("introductions_two_orgs", sql`${t.orgAId} <> ${t.orgBId}`)],
).enableRLS();
