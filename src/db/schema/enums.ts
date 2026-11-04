import { pgEnum } from "drizzle-orm/pg-core";
import {
  LOOKING_FOR,
  ORGANISATION_CATEGORIES,
  PROJECT_STAGES,
  PROVINCES,
  THEMES,
} from "../../lib/constants";
import { FUNDING_TYPES } from "../../features/funding/constants";
import { BUCKETS, UPLOAD_KIND_VALUES } from "../../lib/storage/kinds";

/** Postgres enums built from the same fixed lists the UI uses, so values can never drift. */
const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

export const orgCategory = pgEnum("org_category", values(ORGANISATION_CATEGORIES));
export const province = pgEnum("province", values(PROVINCES));
export const theme = pgEnum("theme", values(THEMES));
export const projectStage = pgEnum("project_stage", values(PROJECT_STAGES));
export const partnerRole = pgEnum("partner_role", values(LOOKING_FOR));
export const fundingType = pgEnum("funding_type", values(FUNDING_TYPES));
export const uploadKind = pgEnum("upload_kind", UPLOAD_KIND_VALUES);
export const storageBucket = pgEnum("storage_bucket", [
  BUCKETS.publicImages,
  BUCKETS.privateDocuments,
]);

export const platformRole = pgEnum("platform_role", ["member", "ncpc_admin"]);
/** draft → pending (submitted) → approved, or changes_requested / rejected; suspended by NCPC. */
export const orgStatus = pgEnum("org_status", [
  "draft",
  "pending",
  "changes_requested",
  "approved",
  "rejected",
  "suspended",
]);
export const memberRole = pgEnum("member_role", ["owner", "admin", "member"]);
export const verificationDoc = pgEnum("verification_doc", ["cipc", "bbbee", "tax"]);

export const projectStatus = pgEnum("project_status", [
  "draft",
  "in_review",
  "live",
  "closed",
  "hidden",
  /** NCPC sent it back with a note; the owner edits and submits again */
  "changes_requested",
  "rejected",
]);
export const needStatus = pgEnum("need_status", ["open", "found"]);
export const docVisibility = pgEnum("doc_visibility", ["public", "members_after_enquiry"]);

export const enquiryStatus = pgEnum("enquiry_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
  "withdrawn",
]);
export const dealStage = pgEnum("deal_stage", [
  "in_discussion",
  "due_diligence",
  "agreement",
  "active_partner",
  "closed",
]);
export const collabRequestStatus = pgEnum("collab_request_status", [
  "requested",
  "submitted",
  "changes_requested",
  "accepted",
  "withdrawn",
]);
export const partnershipStatus = pgEnum("partnership_status", [
  "awaiting_confirmation",
  "active",
  "ended",
]);
export const introStatus = pgEnum("intro_status", ["pending", "accepted", "declined"]);

export const offerStatus = pgEnum("offer_status", ["draft", "in_review", "live", "closed"]);
export const applicationStatus = pgEnum("application_status", [
  "submitted",
  "shortlisted",
  "declined",
  "funded",
  "withdrawn",
]);
export const savedItemType = pgEnum("saved_item_type", [
  "project",
  "organisation",
  "funding_offer",
]);
