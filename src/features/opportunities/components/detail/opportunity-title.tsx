import Link from "next/link";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { OrgLogo } from "@/components/shared/org-logo";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { formatListed } from "@/lib/dates";
import type { OpportunityDetail } from "../../types";

/** Tags, H1 and the "by Owner · NCPC verified · location · listed" line. */
export function OpportunityTitle({
  opportunity: o,
  isNew,
}: {
  opportunity: OpportunityDetail;
  isNew: boolean;
}) {
  return (
    <div className="flex flex-col gap-3.5 py-6">
      <div className="flex flex-wrap items-center gap-2">
        {isNew ? <Badge>New listing</Badge> : null}
        {o.tags.map((tag) => (
          <Badge key={tag} variant="neutral" className="text-[13px]">
            {tag}
          </Badge>
        ))}
      </div>
      <h1 className="text-2xl leading-tight font-bold tracking-tight md:text-[32px]">{o.title}</h1>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
        <OrgLogo name={o.owner.name} logoUrl={o.owner.logoUrl} size="sm" />
        <span>
          by{" "}
          <Link
            href={routes.organisations.detail(o.owner.slug)}
            className="font-semibold text-primary hover:underline"
          >
            {o.owner.name}
          </Link>
          {o.owner.verified ? <VerifiedBadge className="ml-1" /> : null}
        </span>

        <span>
          · {o.location} · Listed {formatListed(o.listedAt)}
        </span>
      </div>
    </div>
  );
}
