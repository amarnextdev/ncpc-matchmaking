import Image from "next/image";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Bookmark, CalendarDays, Globe, MapPin } from "lucide-react";
import { EnquiryButton } from "@/components/shared/enquiry-button";
import { OrgLogo } from "@/components/shared/org-logo";
import { ShareButton } from "@/components/shared/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ORGANISATION_CATEGORIES, PROVINCES, labelFor } from "@/lib/constants";
import { formatMonth } from "@/lib/dates";
import type { Viewer } from "@/types";
import { isNewMember } from "../../constants";
import type { OrganisationDetail } from "../../types";

/** Cover band, big logo, name, badges, meta line, actions and the 4-number stats strip. */
export function ProfileHeader({
  organisation: o,
  viewer,
}: {
  organisation: OrganisationDetail;
  viewer: Viewer;
}) {
  return (
    <section aria-labelledby="organisation-title" className="flex flex-col">
      <div
        aria-hidden
        className="relative h-[150px] overflow-hidden rounded-xl bg-primary md:h-[220px]"
      >
        {o.coverUrl ? (
          <Image src={o.coverUrl} alt="" fill priority sizes="1280px" className="object-cover" />
        ) : (
          <>
            {/* Placeholder until the organisation uploads a cover photo: quiet dot grid + soft rings. */}
            <span className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.09)_1px,transparent_1px)] [background-size:18px_18px]" />
            <span className="absolute -top-24 -right-16 size-[340px] rounded-full border-[48px] border-white/[0.05]" />
            <span className="absolute -right-4 -bottom-28 size-[220px] rounded-full border-[32px] border-success-bar/15" />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-5 px-1 md:px-6">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3.5">
          <OrgLogo
            name={o.name}
            logoUrl={o.logoUrl}
            size="lg"
            className="relative z-10 -mt-[38px] size-[76px] rounded-[18px] border-4 border-background text-2xl shadow-float md:-mt-[52px] md:size-[104px] md:text-[32px]"
          />
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {isNewMember(o.memberSince) ? <Badge>New member</Badge> : null}
              <Badge variant="soft">{labelFor(ORGANISATION_CATEGORIES, o.category)}</Badge>
            </div>
            <h1
              id="organisation-title"
              className="text-[26px] leading-tight font-bold tracking-tight md:text-[34px]"
            >
              {o.name}
              {o.verified ? <VerifiedBadge size="lg" className="ml-2" /> : null}
            </h1>
            <p className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-[15px] text-subtle-foreground" aria-hidden />
                {o.city}, {labelFor(PROVINCES, o.province)}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-[15px] text-subtle-foreground" aria-hidden />
                Member since {formatMonth(o.memberSince)}
              </span>
              {o.website ? (
                <a
                  href={`https://${o.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  <Globe className="size-[15px]" aria-hidden />
                  {o.website}
                </a>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton title={o.name} label="Share profile" />
          <Button type="button" variant="outline">
            <Bookmark aria-hidden />
            Save
          </Button>
          <EnquiryButton viewer={viewer} returnTo={routes.organisations.detail(o.slug)} />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
        {o.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 bg-card px-5 py-4">
            <dt className="text-xs text-subtle-foreground">{stat.label}</dt>
            <dd
              className={
                stat.value === "None yet"
                  ? "text-[22px] font-bold text-subtle-foreground"
                  : "text-[22px] font-bold tracking-tight"
              }
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
