import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { TrackHero } from "@/features/organisations/components/track-hero";
import { TrackProjectCard } from "@/features/organisations/components/track-project-card";
import {
  TrackResultsBar,
  TrackSearch,
  TrackStatusTabs,
} from "@/features/organisations/components/track-toolbar";
import { getOrganisationBySlug, getTrackRecord } from "@/features/organisations/queries";
import { parseTrackFilters, trackQuery } from "@/features/organisations/search-params";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const o = await getOrganisationBySlug(slug);
  return { title: o ? `${o.track.title} · ${o.name}` : "Organisation not found" };
}

/** Every project an organisation has invested in, hosted or supplied — list-page pattern. */
export default async function OrganisationProjectsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = parseTrackFilters(await searchParams);
  const data = await getTrackRecord(slug, filters);
  if (!data) notFound();
  const { organisation: o, summary } = data;
  const base = routes.organisations.projects(o.slug);

  return (
    <div className="bg-surface">
      <TrackHero
        organisation={o}
        title={o.track.title}
        description={`${o.track.intro}. Follow each project from feasibility to operation.`}
        stats={[
          {
            label: "Total projects",
            value: String(data.allCount),
            note: summary.firstYear ? `since ${summary.firstYear}` : "",
            dot: "#FFFFFF",
          },
          {
            label: "Operational",
            value: String(summary.operational),
            note: "running today",
            dot: "#5FA83A",
          },
          {
            label: "In construction",
            value: String(summary.construction),
            note: "being built",
            dot: "#8FB4F0",
          },
          {
            label: "Funding / feasibility",
            value: String(summary.early),
            note: "getting ready",
            dot: "#E3B04B",
          },
        ]}
      />

      <Suspense>
        <TrackSearch filters={filters} roles={data.roles} />
      </Suspense>

      <Container className="pt-7">
        <Suspense>
          <TrackStatusTabs active={filters.stage} allCount={data.allCount} stages={data.stages} />
        </Suspense>
      </Container>

      <Container className="flex flex-col gap-6 pt-6 pb-16">
        <Suspense>
          <TrackResultsBar total={data.total} sort={filters.sort} />
        </Suspense>

        {data.items.length ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <li key={item.id} className="flex">
                <TrackProjectCard item={item} organisationName={o.name} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No projects match"
            description="Try another status or search term."
            className="bg-card"
            action={
              <Button asChild variant="outline-primary" size="sm">
                <Link href={base}>Show all projects</Link>
              </Button>
            }
          />
        )}

        <Pagination
          page={data.page}
          pageCount={data.pageCount}
          total={data.total}
          pageSize={data.pageSize}
          hrefForPage={(page) => {
            const query = trackQuery(filters, page);
            return query ? `${base}?${query}` : base;
          }}
        />

        <p className="text-[13px] text-subtle-foreground">
          Only partnerships confirmed by both organisations are shown. Private projects are not
          listed publicly on the platform.
        </p>
      </Container>
    </div>
  );
}
