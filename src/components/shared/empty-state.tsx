import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Buttons or links shown under the text. */
  action?: React.ReactNode;
  className?: string;
};

/** Dashed box used whenever a list or section has no data yet. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-4 rounded-lg border border-dashed border-input bg-surface-subtle p-6",
        className,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft">
        <Icon className="size-5 text-primary" aria-hidden />
      </span>
      <div className="flex min-w-60 flex-1 flex-col gap-1.5">
        <p className="text-base font-bold">{title}</p>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-2 flex flex-wrap gap-2.5">{action}</div> : null}
      </div>
    </div>
  );
}
