import type * as React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { routes } from "@/config/routes";

/** Sign-in and register pages. The split-screen design comes in the Auth module. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center px-5">
          <Link href={routes.home} aria-label="NCPC Matchmaking home">
            <BrandLogo className="h-10" priority />
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
