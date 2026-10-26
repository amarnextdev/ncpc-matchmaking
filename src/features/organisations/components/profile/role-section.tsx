import type * as React from "react";
import { Building2 } from "lucide-react";
import { DetailSection } from "@/components/shared/detail-section";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoleSection as RoleSectionData } from "../../types";
import { SolutionsGrid } from "./solutions-grid";

/** Investment criteria (investors/funders) · Available sites (parks/SEZs) · Solutions (technology providers). */
export function RoleSection({
  section,
  organisationName,
  projectsHref,
  enquiry,
}: {
  section: RoleSectionData | null;
  organisationName: string;
  projectsHref: string;
  enquiry: React.ReactNode;
}) {
  if (!section) return null;
  return (
    <DetailSection id="role" title={section.title} description={section.intro}>
      {section.kind === "criteria" ? (
        <>
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-6 gap-y-5 rounded-lg border bg-surface-subtle p-[22px]">
            {section.items.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt className="text-eyebrow">{item.label}</dt>
                <dd className="text-[15px] leading-[22px] font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
          {section.offer ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3.5">
              <div className="flex flex-col gap-0.5">
                <p className="text-[15px] font-semibold">{section.offer.name}</p>
                <p className="text-[13px] text-muted-foreground">{section.offer.detail}</p>
              </div>
              {/* TODO(Funding module): link to the funding offer page. */}
              <span className="text-sm font-semibold text-primary">View offer →</span>
            </div>
          ) : null}
        </>
      ) : null}

      {section.kind === "sites" ? (
        <>
          <ul className="overflow-hidden rounded-lg border">
            {section.sites.map((site, i) => (
              <li
                key={site.name}
                className={cn(
                  "flex flex-wrap items-center gap-x-4 gap-y-3 px-[18px] py-4",
                  i > 0 && "border-t",
                )}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft">
                  <Building2 className="size-5 text-primary" aria-hidden />
                </span>
                <div className="flex flex-[1_1_240px] flex-col gap-0.5">
                  <p className="text-[15px] font-semibold">{site.name}</p>
                  <p className="text-[13px] text-muted-foreground">{site.detail}</p>
                </div>
                <Badge variant={site.status === "available" ? "verified" : "warning"}>
                  {site.status === "available" ? "Available" : "Reserved"}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            {section.utilities.length ? <span>Utilities:</span> : null}
            {section.utilities.map((u) => (
              <Badge key={u} variant="neutral">
                {u}
              </Badge>
            ))}
            {section.incentives.length ? <span className="ml-2">Incentives:</span> : null}
            {section.incentives.map((u) => (
              <Badge key={u} variant="neutral">
                {u}
              </Badge>
            ))}
          </div>
        </>
      ) : null}

      {section.kind === "solutions" ? (
        <SolutionsGrid
          solutions={section.solutions}
          organisationName={organisationName}
          projectsHref={projectsHref}
          enquiry={enquiry}
        />
      ) : null}
    </DetailSection>
  );
}
