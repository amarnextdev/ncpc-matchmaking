import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  Check,
  Droplets,
  Gauge,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type * as React from "react";
import type { Solution } from "../../types";

const ICONS: Record<Solution["icon"], LucideIcon> = {
  solar: Sun,
  battery: BatteryCharging,
  software: Activity,
  water: Droplets,
  efficiency: Gauge,
};

/**
 * Technology provider's catalogue, 2 per row: photo, category, 3 key specs, certifications and
 * "Used in N projects" (→ track record). Ends with a quote prompt (datasheets come with the enquiry).
 */
export function SolutionsGrid({
  solutions,
  organisationName,
  projectsHref,
  enquiry,
}: {
  solutions: Solution[];
  organisationName: string;
  projectsHref: string;
  /** Enquiry button rendered by the page (knows who is viewing). */
  enquiry: React.ReactNode;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {solutions.map((s) => {
          const Icon = ICONS[s.icon];
          return (
            <article
              key={s.name}
              className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-card"
            >
              <div
                className="relative flex h-[112px] items-center justify-center"
                style={s.imageUrl ? undefined : { backgroundColor: s.tint }}
              >
                {s.imageUrl ? (
                  <Image
                    src={s.imageUrl}
                    alt={s.name}
                    fill
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15"
                  >
                    <Icon className="size-7 text-white" strokeWidth={1.8} />
                  </span>
                )}
                <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary">
                  {s.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[17px] font-bold">{s.name}</h3>
                  <p className="line-clamp-2 text-sm leading-[21px] text-muted-foreground">
                    {s.description}
                  </p>
                </div>

                <dl className="grid grid-cols-3 gap-3 rounded-md bg-surface-subtle px-3.5 py-3">
                  {s.specs.map((spec) => (
                    <div key={spec.label} className="flex min-w-0 flex-col gap-0.5">
                      <dt className="text-[11px] text-subtle-foreground">{spec.label}</dt>
                      <dd className="text-[13px] leading-[18px] font-semibold">{spec.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  {s.usedIn > 0 ? (
                    <Link
                      href={projectsHref}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      Used in {s.usedIn} {s.usedIn === 1 ? "project" : "projects"}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  ) : (
                    <span className="text-[13px] text-subtle-foreground">
                      Not used in a listed project yet
                    </span>
                  )}
                  {s.certifications.length ? (
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="size-3.5 text-success" strokeWidth={3} aria-hidden />
                      <span className="sr-only">Certified:</span>
                      {s.certifications.join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-surface-subtle px-4 py-3.5">
        <p className="text-sm text-foreground/80">
          <strong className="text-foreground">Need a quote?</strong> Mention a solution in your
          enquiry and {organisationName} replies with sizing and pricing.
        </p>
        {enquiry}
      </div>
    </>
  );
}
