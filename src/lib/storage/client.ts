import { createClient } from "@/lib/supabase/client";
import { UPLOAD_KINDS, checkFile, type Bucket, type UploadKind } from "./kinds";

/** What the browser hands to a Server Action after uploading (verified there before saving). */
export type UploadedFile = {
  bucket: Bucket;
  path: string;
  mimeType: string;
  bytes: number;
  originalName: string;
  width?: number;
  height?: number;
};

export class UploadError extends Error {}

/** Shrinks a photo so its longest side is at most `max` px (WebP, or JPEG if WebP is unsupported). */
async function resizeImage(
  file: File,
  max: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const blob = (await toBlob("image/webp")) ?? (await toBlob("image/jpeg"));
  if (!blob) throw new UploadError("We could not read this image. Try another file.");
  return { blob, width, height };
}

/**
 * Uploads one file to Supabase Storage:
 * 1. checks it, 2. shrinks photos, 3. asks our server for a one-time upload URL, 4. uploads.
 */
export async function uploadFile(kind: UploadKind, file: File): Promise<UploadedFile> {
  const problem = checkFile(kind, file);
  if (problem) throw new UploadError(problem);

  const rule = UPLOAD_KINDS[kind];
  let body: Blob = file;
  let width: number | undefined;
  let height: number | undefined;
  if (rule.resizeTo) {
    const resized = await resizeImage(file, rule.resizeTo);
    body = resized.blob;
    width = resized.width;
    height = resized.height;
  }

  const res = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, mimeType: body.type }),
  });
  if (res.status === 401) throw new UploadError("Please sign in again to upload files.");
  if (!res.ok)
    throw new UploadError("Uploads are not available right now. Please try again later.");
  const { bucket, path, token } = (await res.json()) as {
    bucket: Bucket;
    path: string;
    token: string;
  };

  const { error } = await createClient()
    .storage.from(bucket)
    .uploadToSignedUrl(path, token, body, { contentType: body.type });
  if (error) throw new UploadError("The upload failed. Please try again.");

  return {
    bucket,
    path,
    mimeType: body.type,
    bytes: body.size,
    originalName: file.name,
    width,
    height,
  };
}
