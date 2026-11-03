import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { isStorageConfigured } from "@/lib/env";
import { signUpload } from "@/lib/storage/server";
import { UPLOAD_KIND_VALUES } from "@/lib/storage/kinds";

const bodySchema = z.object({
  kind: z.enum(UPLOAD_KIND_VALUES),
  mimeType: z.string().min(1).max(100),
});

/**
 * POST { kind, mimeType } → a one-time URL to upload one file to Supabase Storage.
 * Signed-in users only. Files go under the user's id until their organisation exists;
 * TODO(Module 3): use the organisation id once onboarding saves the organisation.
 */
export async function POST(request: NextRequest) {
  if (!isStorageConfigured) {
    return NextResponse.json({ error: "Uploads are not configured" }, { status: 503 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to upload" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  try {
    const signed = await signUpload(parsed.data.kind, user.id, parsed.data.mimeType);
    return NextResponse.json(signed, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
}
