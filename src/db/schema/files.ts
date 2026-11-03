import {
  bigint,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { storageBucket, uploadKind } from "./enums";

/**
 * Every file uploaded to Supabase Storage.
 * public-images: shown with publicImageUrl(path).
 * private-documents: opened only through privateFileUrl(path) after a permission check.
 * owner_org_id is set once the organisation exists (null during the first onboarding uploads).
 */
export const files = pgTable(
  "files",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerOrgId: uuid(),
    uploadedBy: uuid().references(() => authUsers.id, { onDelete: "set null" }),
    kind: uploadKind().notNull(),
    bucket: storageBucket().notNull(),
    path: text().notNull(),
    mimeType: text().notNull(),
    bytes: bigint({ mode: "number" }).notNull(),
    originalName: text().notNull(),
    width: integer(),
    height: integer(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.bucket, t.path), index().on(t.ownerOrgId), index().on(t.uploadedBy)],
).enableRLS();
