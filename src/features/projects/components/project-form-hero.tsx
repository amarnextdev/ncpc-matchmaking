import type * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { routes } from "@/config/routes";

/** Navy title band for "List a project" and "Edit project" (matches My projects). */
export function ProjectFormHero({
  orgName,
  title,
  description,
  children,
}: {
  orgName: string;
  title: string;
  description: string;
  /** The step progress, shown along the bottom of the hero */
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby="form-title" className="bg-primary text-white">
      <Container className="flex flex-col gap-2.5 pt-7 pb-7 lg:pt-8">
        <Link
          href={routes.workspace.projects}
          className="mb-2 flex w-fit items-center gap-1.5 text-sm font-semibold text-[#D6E0F0] hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden /> My projects
        </Link>
        <p className="flex items-center gap-1.5 text-sm text-[#B9C7DD]">
          <span className="font-semibold text-white">{orgName}</span>
          <VerifiedBadge tone="light" />
        </p>
        <h1
          id="form-title"
          className="text-[28px] leading-tight font-bold tracking-tight md:text-[32px]"
        >
          {title}
        </h1>
        <p className="max-w-[680px] text-[15px] leading-6 text-[#D6E0F0]">{description}</p>
        {children ? <div className="mt-5 border-t border-white/12 pt-5">{children}</div> : null}
      </Container>
    </section>
  );
}
