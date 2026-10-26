import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/layout/container";
import { footerNav, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-[#D6E0F0]">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <BrandLogo tone="white" className="h-12" />
          <p className="max-w-xs text-sm leading-6">{siteConfig.description}</p>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.08em] text-white uppercase">
              {group.title}
            </h2>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm hover:text-white">
                {item.title}
              </Link>
            ))}
          </nav>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5 text-[13px]">
          <span>
            © {new Date().getFullYear()} {siteConfig.organisation} · {siteConfig.host}
          </span>
          <a
            href={siteConfig.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white"
          >
            Visit ncpc.co.za →
          </a>
        </Container>
      </div>
    </footer>
  );
}
