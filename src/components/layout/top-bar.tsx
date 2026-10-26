import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

/** Thin institutional strip above the header (hidden on small screens). */
export function TopBar() {
  return (
    <div className="hidden bg-primary-hover text-[13px] text-[#C9D6EA] md:block">
      <Container className="flex h-9 items-center justify-between gap-6">
        <p>
          An initiative of the{" "}
          <span className="font-semibold text-white">{siteConfig.organisation}</span>
          <span aria-hidden className="mx-2 text-white/30">
            |
          </span>
          {siteConfig.host}
        </p>
        <nav aria-label="Utility" className="flex items-center gap-5">
          <Link href={routes.contact} className="hover:text-white">
            Contact
          </Link>
          <Link href={routes.about} className="hover:text-white">
            Help
          </Link>
          <a
            href={siteConfig.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-white"
          >
            ncpc.co.za <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </nav>
      </Container>
    </div>
  );
}
