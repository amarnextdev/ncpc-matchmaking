import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
import { DetailSection } from "@/components/shared/detail-section";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatMonth } from "@/lib/dates";
import { TRACK_PREVIEW_COUNT } from "../../constants";
import { latestTrack, summariseTrack } from "../../queries";
import type { OrganisationDetail } from "../../types";
import { TrackRecordTable } from "../track-record-table";
import { TrackStagePills } from "../track-stage-pills";

/**
 * Profile preview of the track record: stage summary + the latest 5 projects.
 * The full list (search, filters, pages) lives on /organisations/[slug]/projects.
 */
export function TrackRecordSection({ organisation: o }: { organisation: OrganisationDetail }) {
  const { title, intro, items } = o.track;
  const all = routes.organisations.projects(o.slug);
  const hasMore = items.length > TRACK_PREVIEW_COUNT;

  return (
    <DetailSection
      id="track-record"
      title={title}
      description={items.length ? intro : undefined}
      action={
        hasMore ? (
          <Link href={all} className="text-sm font-semibold text-primary hover:underline">
            View all {items.length} →
          </Link>
        ) : undefined
      }
    >
      {items.length ? (
        <>
          <TrackStagePills
            total={items.length}
            stages={summariseTrack(items)}
            hrefFor={(stage) => (stage ? `${all}?stage=${stage}` : all)}
          />
          <TrackRecordTable items={latestTrack(items, TRACK_PREVIEW_COUNT)} />
          {hasMore ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-muted-foreground">
                Showing the latest {TRACK_PREVIEW_COUNT} of {items.length}
              </p>
              <Button asChild variant="outline-primary" size="sm">
                <Link href={all}>
                  View all {items.length} projects
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex flex-wrap items-start gap-4 rounded-lg border border-dashed border-input bg-surface-subtle p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft">
            <UserPlus className="size-[22px] text-primary" aria-hidden />
          </span>
          <div className="flex flex-[1_1_280px] flex-col gap-1.5">
            <p className="text-base font-bold">No partnerships yet</p>
            <p className="text-sm leading-[22px] text-muted-foreground">
              {o.name} joined in {formatMonth(o.memberSince)}. Investments and partnerships appear
              here once both sides confirm an agreement on the platform.
            </p>
          </div>
        </div>
      )}
    </DetailSection>
  );
}
