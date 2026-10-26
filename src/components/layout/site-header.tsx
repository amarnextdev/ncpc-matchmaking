import { BrandLockup } from "@/components/layout/brand-lockup";
import { Container } from "@/components/layout/container";
import { HeaderActions } from "@/components/layout/header-actions";
import { HeaderShell } from "@/components/layout/header-shell";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";

/**
 * Public header:
 *   [ institutional strip ]
 *   [ NCPC logo | Matchmaking ]  Opportunities  Organisations  Funding  About   [search] | Sign in [Register]
 */
export function SiteHeader() {
  return (
    <>
      <TopBar />
      <HeaderShell>
        <Container className="relative flex h-[76px] items-stretch gap-10">
          <div className="flex items-center">
            <BrandLockup />
          </div>
          <MainNav className="flex-1" />
          <div className="ml-auto flex items-center">
            <HeaderActions />
            <MobileNav />
          </div>
        </Container>
      </HeaderShell>
    </>
  );
}
