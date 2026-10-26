import type * as React from "react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Right side: stats, buttons. */
  aside?: React.ReactNode;
  /** Above the title: breadcrumb. */
  eyebrow?: React.ReactNode;
  className?: string;
};

/** Navy page hero used at the top of list pages. */
export function PageHeader({ title, description, aside, eyebrow, className }: PageHeaderProps) {
  return (
    <section className={cn("bg-primary text-white", className)}>
      <Container className="flex flex-wrap items-end justify-between gap-12 pt-10 pb-24 lg:pt-13">
        <div className="flex max-w-2xl flex-[1_1_520px] flex-col gap-4">
          {eyebrow}
          <h1 className="text-3xl leading-tight font-bold tracking-tight md:text-[40px]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-xl text-[17px] leading-7 text-[#D6E0F0]">{description}</p>
          ) : null}
        </div>
        {aside}
      </Container>
    </section>
  );
}
