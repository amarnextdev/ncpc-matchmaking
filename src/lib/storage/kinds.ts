/**
 * Everything that can be uploaded, and the rules for each kind (Supabase Storage).
 * Shared by the browser (checks before uploading) and the server (only signs these settings).
 *
 * public-images     → public bucket: anyone with the URL can view (logo, banner, project photos).
 * private-documents → private bucket: opened only through a short-lived signed link from our
 *                     server, after it checks the viewer may see that file.
 */
export const BUCKETS = {
  publicImages: "public-images",
  privateDocuments: "private-documents",
} as const;
export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

const IMAGE = ["image/jpeg", "image/png", "image/webp"] as const;
const DOCUMENT = ["application/pdf", "image/jpeg", "image/png"] as const;

export const UPLOAD_KINDS = {
  "org-logo": {
    label: "Logo",
    bucket: BUCKETS.publicImages,
    mimeTypes: IMAGE,
    maxMb: 5,
    resizeTo: 512,
  },
  "org-banner": {
    label: "Banner",
    bucket: BUCKETS.publicImages,
    mimeTypes: IMAGE,
    maxMb: 8,
    resizeTo: 1600,
  },
  "project-photo": {
    label: "Project photo",
    bucket: BUCKETS.publicImages,
    mimeTypes: IMAGE,
    maxMb: 8,
    resizeTo: 1600,
  },
  "verification-doc": {
    label: "Verification document",
    bucket: BUCKETS.privateDocuments,
    mimeTypes: DOCUMENT,
    maxMb: 10,
    resizeTo: null,
  },
  "project-doc": {
    label: "Project document",
    bucket: BUCKETS.privateDocuments,
    mimeTypes: DOCUMENT,
    maxMb: 10,
    resizeTo: null,
  },
  "message-attachment": {
    label: "Attachment",
    bucket: BUCKETS.privateDocuments,
    mimeTypes: DOCUMENT,
    maxMb: 10,
    resizeTo: null,
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;
export const UPLOAD_KIND_VALUES = Object.keys(UPLOAD_KINDS) as [UploadKind, ...UploadKind[]];

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function extensionFor(mimeType: string): string | null {
  return EXT_BY_MIME[mimeType] ?? null;
}

/** Value for an <input type="file" accept="…">. */
export function acceptFor(kind: UploadKind): string {
  return UPLOAD_KINDS[kind].mimeTypes.join(",");
}

/** Human list of allowed types, e.g. "PDF, JPG or PNG". */
export function typesLabel(kind: UploadKind): string {
  const names = UPLOAD_KINDS[kind].mimeTypes.map((m) => (EXT_BY_MIME[m] ?? m).toUpperCase());
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`
    : (names[0] ?? "");
}

/** A friendly reason the file can't be used, or null when it is fine. */
export function checkFile(kind: UploadKind, file: { type: string; size: number }): string | null {
  const rule = UPLOAD_KINDS[kind];
  if (!(rule.mimeTypes as readonly string[]).includes(file.type))
    return `Use a ${typesLabel(kind)} file`;
  if (file.size > rule.maxMb * 1024 * 1024) return `The file is larger than ${rule.maxMb} MB`;
  return null;
}
