import Link from "next/link";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { OrgLogo } from "@/components/shared/org-logo";
import { routes } from "@/config/routes";
import { ORGANISATION_CATEGORIES, labelFor } from "@/lib/constants";
import { tabForCategory } from "../../constants";
import type { Organisation, SimilarOrganisation } from "../../types";

export function SimilarOrganisations({
  items,
  organisation,
}: {
  items: SimilarOrganisation[];
  organisation: Organisation;
}) {
  if (!items.length) return null;
  const tab = tabForCategory(organisation.category);
  return (
    <section aria-labelledby="similar-title" className="mt-12 flex flex-col gap-4 border-t pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="similar-title" className="text-[22px] leading-7 font-bold tracking-tight">
          Similar organisations
        </h2>
        <Link
          href={tab ? `${routes.organisations.list}?type=${tab.value}` : routes.organisations.list}
          className="text-sm font-semibold text-primary hover:underline"
        >
          View all {tab ? tab.label.toLowerCase() : "organisations"} →
        </Link>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3.5">
        {items.map(({ organisation: other, reason }) => (
          <li key={other.id} className="flex">
            <article className="relative flex w-full flex-col gap-3 rounded-lg border p-4 transition-shadow hover:shadow-float">
              <div className="flex items-center gap-3">
                <OrgLogo name={other.name} logoUrl={other.logoUrl} size="md" className="size-11" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex min-w-0 items-center gap-1">
                    <Link
                      href={routes.organisations.detail(other.slug)}
                      className="truncate text-[15px] font-bold after:absolute after:inset-0 hover:text-primary"
                    >
                      {other.name}
                    </Link>
                    {other.verified ? <VerifiedBadge size="sm" /> : null}
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {labelFor(ORGANISATION_CATEGORIES, other.category)} · {other.city}
                  </span>
                </div>
              </div>
              {reason ? (
                <p className="border-t border-muted pt-2.5 text-xs text-muted-foreground">
                  Similar because:{" "}
                  <strong className="font-semibold text-foreground">{reason}</strong>
                </p>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
