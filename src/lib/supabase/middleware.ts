import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";
import { routes } from "@/config/routes";

const PROTECTED_PREFIXES = [routes.workspace.root, routes.admin.root];

/** Refreshes the Supabase session cookie and guards private areas. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Let the app run (public pages, coming-soon pages) before Supabase is configured.
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = routes.auth.signIn;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}
