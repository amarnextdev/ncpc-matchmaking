import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";
import { routes } from "@/config/routes";
import { DEMO_COOKIE } from "@/features/collaboration/data/demo-orgs";

/** Pages that need a signed-in person (approval is checked by each page). */
const PROTECTED_PREFIXES = [
  routes.workspace.root,
  routes.admin.root,
  routes.onboarding.root,
  routes.auth.resetPassword,
];

/** Refreshes the Supabase session cookie and guards private areas. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Let the app run (public pages, coming-soon pages) before Supabase is configured.
  if (!isSupabaseConfigured) return response;

  const env = getPublicEnv();
  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

  // Ready-made demo members (development, or DEMO_MODE=1) can still open the workspace.
  const demoAllowed = process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "1";
  const isDemo = demoAllowed && Boolean(request.cookies.get(DEMO_COOKIE)?.value);

  if (isProtected && !user && !isDemo) {
    const url = request.nextUrl.clone();
    url.search = "";
    if (path.startsWith(routes.auth.resetPassword)) {
      // An expired or reused reset link: ask for a new one.
      url.pathname = routes.auth.forgotPassword;
      url.searchParams.set("expired", "1");
    } else {
      url.pathname = routes.auth.signIn;
      url.searchParams.set("next", path);
    }
    return NextResponse.redirect(url);
  }

  return response;
}
