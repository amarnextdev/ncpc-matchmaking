"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth/actions";

/** Right side of the setup header: a way out that fits the page. */
export function SetupHeaderAction() {
  const pathname = usePathname();
  if (pathname.startsWith(routes.onboarding.pending)) {
    return (
      <Link href={routes.home} className="text-sm font-semibold text-primary hover:underline">
        Go to homepage
      </Link>
    );
  }
  // The form saves itself, so signing out never loses work.
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <LogOut className="size-4" aria-hidden /> Sign out
      </button>
    </form>
  );
}
