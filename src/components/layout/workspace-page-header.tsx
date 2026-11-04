import type * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type WorkspacePageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  /** Buttons on the right (e.g. "List a project") */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Title row for member pages: no band, no breadcrumb, no second tab row.
 * The site header already says where you are.
 */
export function WorkspacePageHeader({
  title,
  description,
  back,
  actions,
  className,
}: WorkspacePageHeaderProps) {
  return (
    <Container
      className={cn("flex flex-wrap items-end justify-between gap-4 pt-8 pb-6", className)}
    >
      <div className="flex max-w-[760px] min-w-0 flex-col gap-1.5">
        {back ? (
          <Link
            href={back.href}
            className="mb-1 flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden /> {back.label}
          </Link>
        ) : null}
        <h1 className="text-[26px] leading-tight font-bold tracking-tight md:text-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="text-[15px] leading-[23px] text-foreground/70">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div> : null}
    </Container>
  );
}
