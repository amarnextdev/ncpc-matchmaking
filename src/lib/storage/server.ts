import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKETS, UPLOAD_KINDS, extensionFor, type Bucket, type UploadKind } from "./kinds";

/**
 * Paths look like <owner id>/<kind>/<uuid>.<ext>. The server picks every part, so the browser
 * can never write into another organisation's folder or overwrite a file.
 */
function cleanId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

export type SignedUpload = { bucket: Bucket; path: string; token: string };

/**
 * A one-time URL to upload ONE file to Supabase Storage.
 * @param ownerKey organisation id, or user id before onboarding has saved the organisation
 */
export async function signUpload(
  kind: UploadKind,
  ownerKey: string,
  mimeType: string,
): Promise<SignedUpload> {
  const rule = UPLOAD_KINDS[kind];
  const ext = extensionFor(mimeType);
  if (!ext || !(rule.mimeTypes as readonly string[]).includes(mimeType)) {
    throw new Error("File type not allowed");
  }
  const path = `${cleanId(ownerKey)}/${kind}/${randomUUID()}.${ext}`;
  const { data, error } = await createAdminClient()
    .storage.from(rule.bucket)
    .createSignedUploadUrl(path);
  if (error || !data) throw new Error("Could not prepare the upload");
  return { bucket: rule.bucket, path: data.path, token: data.token };
}

/** True when a path sits in the folder we sign for this owner and kind. */
export function isOwnedPath(path: string, kind: UploadKind, ownerKey: string): boolean {
  return path.startsWith(`${cleanId(ownerKey)}/${kind}/`) && !path.includes("..");
}

/**
 * Size and type of an uploaded object, read from Storage (never trust what the browser says).
 * Returns null when the object does not exist.
 */
export async function statObject(bucket: Bucket, path: string) {
  const slash = path.lastIndexOf("/");
  const { data, error } = await createAdminClient()
    .storage.from(bucket)
    .list(path.slice(0, slash), { search: path.slice(slash + 1), limit: 1 });
  const obj = data?.[0];
  if (error || !obj) return null;
  const meta = (obj.metadata ?? {}) as { size?: number; mimetype?: string };
  return { bytes: Number(meta.size ?? 0), mimeType: String(meta.mimetype ?? "") };
}

/**
 * A short-lived link to a PRIVATE file. Call only after checking the viewer may see it.
 * @param minutes how long the link works (default 10)
 */
export async function privateFileUrl(
  path: string,
  opts: { minutes?: number; downloadName?: string } = {},
): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .storage.from(BUCKETS.privateDocuments)
    .createSignedUrl(path, 60 * (opts.minutes ?? 10), {
      download: opts.downloadName ?? false,
    });
  return error || !data ? null : data.signedUrl;
}

/** Removes files (e.g. a replaced logo). Missing files are ignored. */
export async function removeObjects(bucket: Bucket, paths: string[]): Promise<void> {
  if (paths.length) await createAdminClient().storage.from(bucket).remove(paths);
}
