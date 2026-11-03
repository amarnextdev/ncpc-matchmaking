import "server-only";
import { and, asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import {
  files,
  onboardingDrafts,
  organisationDocuments,
  organisationMembers,
  organisations,
} from "@/db/schema";
import { publicImageUrl } from "@/lib/storage/url";
import { ONBOARDING_DEFAULTS, draftSchema, type DraftValues, type FileRef } from "./schema";

/** The person's organisation (first membership), with their role. */
export async function getMembershipOrg(userId: string) {
  const [row] = await db
    .select({ org: organisations, role: organisationMembers.role })
    .from(organisationMembers)
    .innerJoin(organisations, eq(organisations.id, organisationMembers.orgId))
    .where(eq(organisationMembers.userId, userId))
    .orderBy(asc(organisationMembers.createdAt))
    .limit(1);
  return row ?? null;
}

async function fileRefs(ids: (string | null | undefined)[]): Promise<Map<string, FileRef>> {
  const list = ids.filter((v): v is string => Boolean(v));
  if (!list.length) return new Map();
  const rows = await db
    .select({ id: files.id, name: files.originalName, bucket: files.bucket, path: files.path })
    .from(files)
    .where(inArray(files.id, list));
  return new Map(
    rows.map((r) => [
      r.id,
      {
        fileId: r.id,
        name: r.name,
        url: r.bucket === "public-images" ? publicImageUrl(r.path) : undefined,
      },
    ]),
  );
}

const fromMillions = (n: number | null) =>
  n == null ? "" : String(Math.round((n / 1_000_000) * 10) / 10);

export type OnboardingState = {
  values: DraftValues;
  step: number;
  /** When the draft was last saved (ISO), if there is one */
  savedAt: string | null;
  /** NCPC's message when they asked for changes */
  reviewNote: string | null;
  mode: "new" | "draft" | "changes";
};

/** What the form opens with: the saved draft, else the organisation NCPC sent back, else empty. */
export async function loadOnboarding(userId: string): Promise<OnboardingState> {
  const membership = await getMembershipOrg(userId);
  const org = membership?.org;
  const changes = org?.status === "changes_requested" ? org : null;

  let draft: typeof onboardingDrafts.$inferSelect | undefined;
  try {
    [draft] = await db
      .select()
      .from(onboardingDrafts)
      .where(eq(onboardingDrafts.userId, userId))
      .limit(1);
  } catch (error) {
    // e.g. the onboarding_drafts migration has not run yet: open an empty form instead of crashing.
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.error("[onboarding] could not load draft:", cause);
  }
  if (draft) {
    const parsed = draftSchema.safeParse(draft.data);
    return {
      values: { ...ONBOARDING_DEFAULTS, ...(parsed.success ? parsed.data : {}) } as DraftValues,
      step: Math.min(Math.max(draft.step, 0), 3),
      savedAt: draft.updatedAt.toISOString(),
      reviewNote: changes?.reviewNote ?? null,
      mode: changes ? "changes" : "draft",
    };
  }

  if (changes) {
    const docs = await db
      .select({ kind: organisationDocuments.kind, fileId: organisationDocuments.fileId })
      .from(organisationDocuments)
      .where(eq(organisationDocuments.orgId, changes.id));
    const refs = await fileRefs([
      changes.logoFileId,
      changes.bannerFileId,
      ...docs.map((d) => d.fileId),
    ]);
    const doc = (kind: "cipc" | "bbbee" | "tax") => {
      const id = docs.find((d) => d.kind === kind)?.fileId;
      return id ? (refs.get(id) ?? null) : null;
    };
    return {
      values: {
        ...ONBOARDING_DEFAULTS,
        category: changes.category,
        companyName: changes.name,
        regNumber: changes.registrationNo ?? "",
        province: changes.province ?? undefined,
        town: changes.city ?? "",
        website: changes.website ?? "",
        bbbee: (changes.bbbeeLevel as DraftValues["bbbee"]) ?? undefined,
        description: changes.about ?? "",
        themes: changes.themes,
        offers: changes.offers as DraftValues["offers"],
        instruments: changes.instruments,
        stages: changes.stages,
        lookingFor: changes.lookingFor,
        amountMin: fromMillions(changes.investMin),
        amountMax: fromMillions(changes.investMax),
        logo: changes.logoFileId ? (refs.get(changes.logoFileId) ?? null) : null,
        banner: changes.bannerFileId ? (refs.get(changes.bannerFileId) ?? null) : null,
        summary: changes.summary ?? "",
        docs: { cipc: doc("cipc"), bbbee: doc("bbbee"), tax: doc("tax") },
      },
      step: 0,
      savedAt: null,
      reviewNote: changes.reviewNote,
      mode: "changes",
    };
  }

  return {
    values: ONBOARDING_DEFAULTS as DraftValues,
    step: 0,
    savedAt: null,
    reviewNote: null,
    mode: "new",
  };
}

/**
 * True when every file was uploaded by this person (or already belongs to their organisation)
 * and is of the expected kind, so nobody can attach someone else's file.
 */
export async function ownsFiles(
  userId: string,
  orgId: string | null,
  refs: { fileId: string; kind: string }[],
) {
  if (!refs.length) return true;
  const owner = orgId
    ? or(eq(files.uploadedBy, userId), eq(files.ownerOrgId, orgId))
    : eq(files.uploadedBy, userId);
  const rows = await db
    .select({ id: files.id, kind: files.kind })
    .from(files)
    .where(
      and(
        owner,
        inArray(
          files.id,
          refs.map((r) => r.fileId),
        ),
      ),
    );
  return refs.every((r) => rows.some((row) => row.id === r.fileId && row.kind === r.kind));
}
