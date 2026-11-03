import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLog, files } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { privateFileUrl } from "@/lib/storage/server";

/** NCPC staff open a private document: checked here, then a 10-minute signed link. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const id = z
    .string()
    .uuid()
    .safeParse((await params).id);
  if (!id.success) return new NextResponse("Not found", { status: 404 });

  const [file] = await db
    .select({ bucket: files.bucket, path: files.path })
    .from(files)
    .where(eq(files.id, id.data))
    .limit(1);
  if (!file || file.bucket !== "private-documents") {
    return new NextResponse("Not found", { status: 404 });
  }
  const url = await privateFileUrl(file.path, { minutes: 10 });
  if (url) {
    await db.insert(auditLog).values({
      actorId: admin.id,
      action: "file.opened",
      entity: "file",
      entityId: id.data,
    });
  }
  if (!url) return new NextResponse("File not available", { status: 404 });
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}
