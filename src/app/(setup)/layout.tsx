import type * as React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { routes } from "@/config/routes";
import { SetupHeaderAction } from "@/features/onboarding/components/setup-header-action";

/** Organisation setup and verification: a calm page with only the logo and a way out. */
export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-[1040px] items-center gap-4 px-4 sm:h-[76px] sm:px-5">
          <Link href={routes.home} aria-label="NCPC Matchmaking home">
            <BrandLogo className="h-8 sm:h-11" priority />
          </Link>
          <span className="flex-1" />
          <SetupHeaderAction />
        </div>
      </header>
      <main
        id="main"
        className="mx-auto w-full max-w-[1040px] flex-1 px-4 pt-5 pb-8 sm:px-5 sm:pt-9 sm:pb-14"
      >
        {children}
      </main>
    </div>
  );
}
