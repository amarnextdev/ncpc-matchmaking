import Link from "next/link";
import { Building2, FolderKanban } from "lucide-react";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

/** Switch between the two review queues: organisations and projects, with waiting counts. */
export function ReviewSwitch({
  active,
  organisations,
  projects,
}: {
  active: "organisations" | "projects";
  organisations: number;
  projects: number;
}) {
  const items = [
    {
      value: "organisations",
      label: "Organisations",
      href: routes.admin.approvals,
      count: organisations,
      icon: Building2,
    },
    {
      value: "projects",
      label: "Projects",
      href: routes.admin.projects,
      count: projects,
      icon: FolderKanban,
    },
  ] as const;
  return (
    <nav
      aria-label="Review queues"
      className="inline-flex gap-1 rounded-full border bg-background p-1"
    >
      {items.map((i) => {
        const on = i.value === active;
        return (
          <Link
            key={i.value}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors",
              on
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-muted hover:text-foreground",
            )}
          >
            <i.icon className="size-4" aria-hidden />
            {i.label}
            {i.count ? (
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-center text-xs font-bold tabular-nums",
                  on ? "bg-white/20" : "bg-warning-soft text-warning",
                )}
              >
                {i.count}
                <span className="sr-only"> waiting</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
