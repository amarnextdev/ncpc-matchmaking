import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import { OrgLogo } from "@/components/shared/org-logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { routes } from "@/config/routes";
import { LOOKING_FOR, PROJECT_STAGES, PROVINCES, labelFor } from "@/lib/constants";
import { formatDay, formatListed } from "@/lib/dates";
import { formatRand } from "@/lib/utils";
import { IMPACT_ICON } from "../../detail-meta";
import type { OpportunityDetail, Viewer } from "../../types";
import { EnquiryButton } from "./enquiry-button";

/** Sidebar card: funding progress, key facts, impact, match (members) and the main actions. */
export function FundingCard({
  opportunity: o,
  viewer,
  isNew,
}: {
  opportunity: OpportunityDetail;
  viewer: Viewer;
  isNew: boolean;
}) {
  const raised = o.capitalRaised;
  const pct = o.capitalNeeded > 0 ? Math.min(100, Math.round((raised / o.capitalNeeded) * 100)) : 0;
  const remaining = Math.max(0, o.capitalNeeded - raised);
  const backers = o.partners.filter((p) => p.backer);
  const firstBacker = backers[0];

  const facts = [
    { label: "Stage", value: labelFor(PROJECT_STAGES, o.stage) },
    { label: "Province", value: labelFor(PROVINCES, o.province) },
    { label: "Looking for", value: o.lookingFor.map((v) => labelFor(LOOKING_FOR, v)).join(", ") },
    { label: "Listed", value: formatListed(o.listedAt) },
  ];

  return (
    <section
      aria-label="Funding and actions"
      className="flex flex-col gap-4 rounded-lg border bg-card p-[22px] shadow-float"
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] text-muted-foreground">
          {raised > 0 ? "Capital raised" : "Capital needed"}
        </p>
        <p className="text-[30px] leading-tight font-bold tracking-tight text-primary">
          {formatRand(raised > 0 ? raised : o.capitalNeeded)}
          {raised > 0 ? (
            <span className="ml-1.5 text-base font-medium text-muted-foreground">
              of {formatRand(o.capitalNeeded)}
            </span>
          ) : null}
        </p>
        <Progress value={pct} aria-label="Capital raised" className="h-2.5" />
        <p className="text-[13px] leading-5 text-muted-foreground">
          {raised > 0 ? (
            <>
              {pct}% funded
              {remaining > 0 ? (
                <>
                  {" · "}
                  <strong className="text-foreground">{formatRand(remaining)} still needed</strong>
                </>
              ) : (
                " · fully funded"
              )}
              {o.closesAt ? ` · closes ${formatDay(o.closesAt)}` : null}
            </>
          ) : (
            <>
              No funding committed yet ·{" "}
              <strong className="text-foreground">open to first investors</strong>
            </>
          )}
        </p>
        {firstBacker ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="flex -space-x-2">
              {backers.slice(0, 3).map((b) => (
                <OrgLogo
                  key={b.slug}
                  name={b.name}
                  logoUrl={b.logoUrl}
                  size="sm"
                  ring
                  className="size-[26px] rounded-full text-[10px]"
                />
              ))}
            </span>
            <p className="text-[13px] text-muted-foreground">
              Backed by <strong className="text-foreground">{firstBacker.name}</strong>
              {backers.length > 1 ? ` and ${backers.length - 1} more` : null}
            </p>
          </div>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-3.5 border-t border-muted pt-3.5">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs text-subtle-foreground">{fact.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {o.impact.length ? (
        <div className="flex flex-col border-t border-muted pt-3.5">
          <p className="text-eyebrow mb-1.5">Expected impact</p>
          <ul>
            {o.impact.map((item) => {
              const Icon = IMPACT_ICON[item.kind];
              return (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 border-b border-muted py-2 text-sm last:border-0"
                >
                  <span className="flex items-center gap-2.5 text-foreground/80">
                    <Icon className="size-[18px] text-success" aria-hidden />
                    {item.label}
                  </span>
                  <strong className="text-right">{item.value}</strong>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {isNew ? (
        <div className="flex gap-2.5 rounded-md bg-primary-soft p-3.5 text-[13px] leading-[19px] text-primary">
          <Star className="mt-px size-[18px] shrink-0" aria-hidden />
          <p>
            <strong>Early opportunity.</strong> Early partners can help shape the project scope and
            terms.
          </p>
        </div>
      ) : null}

      {viewer.signedIn ? (
        <>
          {o.match ? (
            <div className="flex flex-col gap-2 rounded-md border bg-surface p-3.5">
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-eyebrow">Your match</span>
                <span className="text-xl font-bold text-primary">{o.match.score}%</span>
              </p>
              <ul className="flex list-disc flex-col gap-1 pl-[18px] text-[13px] leading-[19px] text-foreground/80">
                {o.match.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <EnquiryButton viewer={viewer} slug={o.slug} size="lg" />
          <Button variant="outline" size="lg" type="button">
            <Bookmark aria-hidden />
            Save
          </Button>
        </>
      ) : (
        <>
          <p className="rounded-md bg-surface p-3.5 text-sm leading-5 text-foreground/80">
            Sign in to see your match score, view locked documents and send an enquiry.
          </p>
          <EnquiryButton viewer={viewer} slug={o.slug} size="lg" />
          <Button asChild variant="outline" size="lg">
            <Link href={routes.auth.register}>Register your organisation</Link>
          </Button>
        </>
      )}
    </section>
  );
}
