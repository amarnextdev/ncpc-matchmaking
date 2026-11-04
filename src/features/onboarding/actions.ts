"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  auditLog,
  files,
  notifications,
  onboardingDrafts,
  organisationDocuments,
  organisationMembers,
  organisations,
  profiles,
} from "@/db/schema";
import { routes } from "@/config/routes";
import { getSessionUser } from "@/lib/auth/session";
import { BUCKETS, UPLOAD_KIND_VALUES, UPLOAD_KINDS, type UploadKind } from "@/lib/storage/kinds";
import { isOwnedPath, statObject } from "@/lib/storage/server";
import { publicImageUrl } from "@/lib/storage/url";
import { slugify } from "@/lib/utils";
import { isCapitalProvider } from "./constants";
import { getMembershipOrg, ownsFiles } from "./queries";
import { draftSchema, onboardingSchema, type FileRef, type OnboardingValues } from "./schema";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const SIGNED_OUT = {
  ok: false as const,
  error: "Your session has ended. Sign in again to continue.",
};
const LOCKED = {
  ok: false as const,
  error: "Your organisation is already with NCPC, so it can't be edited here.",
};

/** The organisation this person may still edit (none yet, a draft, or one NCPC sent back). */
async function editableOrg(userId: string) {
  const membership = await getMembershipOrg(userId);
  if (!membership) return { org: null, locked: false };
  const editable =
    (membership.org.status === "draft" || membership.org.status === "changes_requested") &&
    (membership.role === "owner" || membership.role === "admin");
  return { org: membership.org, locked: !editable };
}

// ── Draft ────────────────────────────────────────────────────────────────────

const saveSchema = z.object({ data: z.unknown(), step: z.number().int().min(0).max(3) });

/** Saves the unfinished form so the person can come back to the same step. */
export async function saveDraftAction(input: {
  data: unknown;
  step: number;
}): Promise<Result<{ savedAt: string }>> {
  const user = await getSessionUser();
  if (!user) return SIGNED_OUT;
  const parsed = saveSchema.safeParse(input);
  const data = draftSchema.safeParse(parsed.success ? parsed.data.data : null);
  if (!parsed.success || !data.success)
    return { ok: false, error: "We could not save this draft." };
  if ((await editableOrg(user.id)).locked) return LOCKED;

  const now = new Date();
  try {
    await db
      .insert(onboardingDrafts)
      .values({ userId: user.id, step: parsed.data.step, data: data.data, updatedAt: now })
      .onConflictDoUpdate({
        target: onboardingDrafts.userId,
        set: { step: parsed.data.step, data: data.data, updatedAt: now },
      });
  } catch (error) {
    const cause =
      error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
    console.error("[onboarding] could not save draft:", cause);
    return { ok: false, error: "We could not save your draft. We will try again in a moment." };
  }
  return { ok: true, savedAt: now.toISOString() };
}

// ── Uploads ──────────────────────────────────────────────────────────────────

const uploadSchema = z.object({
  kind: z.enum(UPLOAD_KIND_VALUES),
  bucket: z.enum([BUCKETS.publicImages, BUCKETS.privateDocuments]),
  path: z.string().min(1).max(300),
  originalName: z.string().trim().min(1).max(255),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
});

/**
 * Called after the browser uploaded a file to its signed URL. We never trust the browser:
 * the path must be in this person's folder, and the real size and type are read from Storage.
 */
export async function registerUploadAction(
  input: z.input<typeof uploadSchema>,
): Promise<Result<{ file: FileRef }>> {
  const user = await getSessionUser();
  if (!user) return SIGNED_OUT;
  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "The upload could not be checked." };
  const { kind, bucket, path, originalName, width, height } = parsed.data;
  const rule = UPLOAD_KINDS[kind as UploadKind];

  if (rule.bucket !== bucket || !isOwnedPath(path, kind, user.id)) {
    return { ok: false, error: "The upload could not be checked." };
  }
  const stat = await statObject(bucket, path);
  if (!stat) return { ok: false, error: "We could not find the uploaded file. Please try again." };
  if (!(rule.mimeTypes as readonly string[]).includes(stat.mimeType)) {
    return { ok: false, error: "This file type is not allowed." };
  }
  if (stat.bytes > rule.maxMb * 1024 * 1024) {
    return { ok: false, error: `The file is larger than ${rule.maxMb} MB.` };
  }

  const [row] = await db
    .insert(files)
    .values({
      uploadedBy: user.id,
      kind,
      bucket,
      path,
      mimeType: stat.mimeType,
      bytes: stat.bytes,
      originalName,
      width: width ?? null,
      height: height ?? null,
    })
    .returning({ id: files.id });
  if (!row) return { ok: false, error: "We could not save the upload." };

  return {
    ok: true,
    file: {
      fileId: row.id,
      name: originalName,
      url: bucket === BUCKETS.publicImages ? publicImageUrl(path) : undefined,
    },
  };
}

// ── Submit ───────────────────────────────────────────────────────────────────

const millions = (v: string) => (v ? Math.round(Number(v) * 1_000_000) : null);

function uniqueSlug(name: string): string {
  const base = slugify(name).slice(0, 60) || "organisation";
  return `${base}-${randomBytes(3).toString("hex")}`;
}

/** Final step: saves the organisation, links the files and sends it to NCPC for review. */
export async function submitOnboardingAction(input: OnboardingValues): Promise<Result> {
  const user = await getSessionUser();
  if (!user) return SIGNED_OUT;
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the highlighted fields." };
  }
  const v = parsed.data;
  const { org: existing, locked } = await editableOrg(user.id);
  if (locked) return LOCKED;

  const docs = [
    { kind: "cipc" as const, ref: v.docs.cipc },
    { kind: "bbbee" as const, ref: v.docs.bbbee },
    { kind: "tax" as const, ref: v.docs.tax },
  ].filter((d): d is { kind: "cipc" | "bbbee" | "tax"; ref: FileRef } => d.ref !== null);
  const refs = [
    ...docs.map((d) => ({ fileId: d.ref.fileId, kind: "verification-doc" })),
    ...(v.logo ? [{ fileId: v.logo.fileId, kind: "org-logo" }] : []),
    ...(v.banner ? [{ fileId: v.banner.fileId, kind: "org-banner" }] : []),
  ];
  if (!(await ownsFiles(user.id, existing?.id ?? null, refs))) {
    return { ok: false, error: "One of the files could not be checked. Upload it again." };
  }

  const capital = isCapitalProvider(v.category);
  const now = new Date();
  const fields = {
    name: v.companyName,
    category: v.category,
    registrationNo: v.regNumber,
    province: v.province,
    city: v.town,
    website: v.website || null,
    bbbeeLevel: v.bbbee,
    about: v.description,
    summary: v.summary,
    logoFileId: v.logo?.fileId ?? null,
    bannerFileId: v.banner?.fileId ?? null,
    themes: v.themes,
    offers: capital ? [] : v.offers,
    lookingFor: capital ? [] : v.lookingFor,
    instruments: capital ? v.instruments : [],
    stages: capital ? v.stages : [],
    investMin: capital ? millions(v.amountMin) : null,
    investMax: capital ? millions(v.amountMax) : null,
    status: "pending" as const,
    submittedAt: now,
    updatedAt: now,
  };

  await db.transaction(async (tx) => {
    let orgId = existing?.id;
    if (orgId) {
      await tx.update(organisations).set(fields).where(eq(organisations.id, orgId));
    } else {
      const [created] = await tx
        .insert(organisations)
        .values({ ...fields, slug: uniqueSlug(v.companyName), createdBy: user.id })
        .returning({ id: organisations.id });
      orgId = created!.id;
      await tx.insert(organisationMembers).values({ orgId, userId: user.id, role: "owner" });
    }

    await tx
      .update(files)
      .set({ ownerOrgId: orgId })
      .where(
        inArray(
          files.id,
          refs.map((r) => r.fileId),
        ),
      );
    await tx.delete(organisationDocuments).where(eq(organisationDocuments.orgId, orgId));
    if (docs.length) {
      await tx.insert(organisationDocuments).values(
        docs.map((d) => ({
          orgId: orgId!,
          kind: d.kind,
          fileId: d.ref.fileId,
          uploadedBy: user.id,
        })),
      );
    }
    await tx.delete(onboardingDrafts).where(eq(onboardingDrafts.userId, user.id));
    await tx.insert(auditLog).values({
      actorId: user.id,
      action:
        existing?.status === "changes_requested"
          ? "organisation.resubmitted"
          : "organisation.submitted",
      entity: "organisation",
      entityId: orgId,
    });

    // Let NCPC staff know there is something to review.
    const admins = await tx
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.platformRole, "ncpc_admin"));
    if (admins.length) {
      await tx.insert(notifications).values(
        admins.map((a) => ({
          userId: a.id,
          kind: "organisation_submitted",
          title: `${v.companyName} is waiting for review`,
          link: routes.admin.approval(orgId!),
        })),
      );
    }
  });

  redirect(routes.onboarding.pending);
}
