import type * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { routes } from "@/config/routes";

const POINTS = [
  {
    title: "Matched to the right partners",
    text: "See projects, organisations and funding that fit what you do, with the reasons.",
  },
  {
    title: "Every organisation is verified",
    text: "NCPC checks registration, B-BBEE and tax before anyone goes live.",
  },
  {
    title: "Deals in one place",
    text: "Enquiries, messages, documents and agreements, from first contact to partnership.",
  },
];

/** Sign in, register and onboarding: brand panel on the left (desktop), form on the right. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] xl:grid-cols-[600px_minmax(0,1fr)]">
      <aside
        aria-label="Why join NCPC Matchmaking"
        className="relative hidden overflow-hidden bg-primary px-14 py-12 text-primary-foreground lg:flex lg:flex-col lg:gap-10"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-28 -bottom-28 size-[420px] rounded-full border-[60px] border-white/5"
        />
        <Link href={routes.home} aria-label="NCPC Matchmaking home" className="self-start">
          <BrandLogo tone="white" className="h-12" priority />
        </Link>
        <div className="mt-10 flex flex-col gap-4">
          <p className="text-[40px] leading-[1.15] font-bold tracking-tight">
            Find partners and funding for sustainable industry
          </p>
          <p className="text-[17px] leading-7 text-white/80">
            Join the NCPC marketplace for investors, funders, project developers, industrial parks
            and technology providers in South Africa.
          </p>
        </div>
        <ul className="flex flex-col gap-[18px]">
          {POINTS.map((p) => (
            <li key={p.title} className="flex items-start gap-3.5">
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white/10"
              >
                <Check className="size-[18px] text-[#9BD27A]" strokeWidth={2.6} />
              </span>
              <span className="flex flex-col gap-0.5">
                <strong className="text-[15px]">{p.title}</strong>
                <span className="text-sm text-white/70">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center border-b px-5 lg:hidden">
          <Link href={routes.home} aria-label="NCPC Matchmaking home">
            <BrandLogo className="h-9" priority />
          </Link>
        </header>
        <main id="main" className="flex flex-1 items-center justify-center px-5 py-10 md:py-14">
          <div className="w-full max-w-[440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
