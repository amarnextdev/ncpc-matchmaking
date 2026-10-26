import type * as React from "react";
import { cn } from "@/lib/utils";

/** One section of the detail page: anchor id (for the tabs), H2, optional line under it. */
export function DetailSection({
  id,
  title,
  description,
  action,
  className,
  children,
}: {
  id: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("flex scroll-mt-[140px] flex-col gap-4 pt-10", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={`${id}-title`} className="text-[22px] leading-7 font-bold tracking-tight">
            {title}
          </h2>
          {description ? <p className="text-[15px] text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
