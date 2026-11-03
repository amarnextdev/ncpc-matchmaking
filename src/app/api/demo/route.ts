import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, DEMO_ORGS } from "@/features/collaboration/data/demo-orgs";

/**
 * Demo sign-in until the Auth module exists (disabled in production unless DEMO_MODE=1).
 *   /api/demo?as=investor  → Sunridge Capital
 *   /api/demo?as=owner     → GreenFuture Energy
 *   /api/demo?as=visitor   → signed out
 * Optional &next=/path (same-site paths only).
 */
export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "1") {
    return new NextResponse("Not found", { status: 404 });
  }
  const as = request.nextUrl.searchParams.get("as") ?? "visitor";
  const nextParam = request.nextUrl.searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const response = NextResponse.redirect(new URL(next, request.url));
  if (as in DEMO_ORGS) {
    response.cookies.set(DEMO_COOKIE, as, { path: "/", sameSite: "lax", httpOnly: true });
  } else {
    response.cookies.delete(DEMO_COOKIE);
  }
  return response;
}
