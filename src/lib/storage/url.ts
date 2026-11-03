import { BUCKETS } from "./kinds";

/**
 * Public URL of an image in the public-images bucket. Safe in the browser.
 * Images are resized in the browser before upload, so no server-side transform is needed.
 * Private documents never use this: ask the server for privateFileUrl() instead.
 */
export function publicImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${BUCKETS.publicImages}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
