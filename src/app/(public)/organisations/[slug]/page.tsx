import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { EnquiryButton } from "@/components/shared/enquiry-button";
import { SectionTabs } from "@/components/shared/section-tabs";
import { routes } from "@/config/routes";
import { getOpportunitiesByOwner } from "@/features/opportunities/queries";
import { tabForCategory } from "@/features/organisations/constants";
import {
  OrganisationDocumentsSection,
  hasOrganisationDocuments,
} from "@/features/organisations/components/profile/documents-section";
import {
  AboutSection,
  ImpactSection,
  OffersSection,
  WantsSection,
} from "@/features/organisations/components/profile/overview-sections";
import { ProfileHeader } from "@/features/organisations/components/profile/profile-header";
import { ProjectsSection } from "@/features/organisations/components/profile/projects-section";
import { RoleSection } from "@/features/organisations/components/profile/role-section";
import {
  ContactCard,
  MatchCard,
  VerificationCard,
} from "@/features/organisations/components/profile/sidebar-cards";
import { SimilarOrganisations } from "@/features/organisations/components/profile/similar-organisations";
import { TrackRecordSection } from "@/features/organisations/components/profile/track-record-section";
import { getOrganisationBySlug, getSimilarOrganisations } from "@/features/organisations/queries";
import type { Viewer } from "@/types";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const organisation = await getOrganisationBySlug(slug);
  if (!organisation) return { title: "Organisation not found" };
  return { title: organisation.name, description: organisation.tagline };
}

export default async function OrganisationProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const o = await getOrganisationBySlug(slug);
  if (!o) notFound();

  const [projects, similar] = await Promise.all([
    getOpportunitiesByOwner(o.slug),
    getSimilarOrganisations(o, 3),
  ]);
  // TODO(Module 3 – Auth): real session. Members see their match % and Send enquiry.
  const viewer: Viewer = { signedIn: false };
  const tab = tabForCategory(o.category);

  const sections = [
    { id: "overview", label: "Overview" },
    ...(o.roleSection ? [{ id: "role", label: o.roleSection.title }] : []),
    ...(projects.length ? [{ id: "projects", label: "Projects" }] : []),
    { id: "track-record", label: o.track.title },
    ...(o.impact.length ? [{ id: "impact", label: "Impact" }] : []),
    ...(hasOrganisationDocuments(o) ? [{ id: "documents", label: "Documents" }] : []),
  ];

  return (
    <div className="bg-background">
      <Container className="pb-20">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 py-4 text-[13px] text-subtle-foreground"
        >
          <Link
            href={routes.organisations.list}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Organisations
          </Link>
          {tab ? (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`${routes.organisations.list}?type=${tab.value}`}
                className="hover:text-foreground"
              >
                {tab.label}
              </Link>
            </>
          ) : null}
        </nav>

        <ProfileHeader organisation={o} viewer={viewer} />

        <div className="mt-8 grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <aside className="mb-8 flex flex-col gap-4 lg:sticky lg:top-[100px] lg:col-start-2 lg:row-start-1 lg:mb-0 lg:self-start">
            <MatchCard organisation={o} viewer={viewer} />
            <ContactCard organisation={o} />
            <VerificationCard organisation={o} />
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <SectionTabs sections={sections} />
            <AboutSection organisation={o} />
            <OffersSection organisation={o} />
            <WantsSection organisation={o} />
            <RoleSection
              section={o.roleSection}
              organisationName={o.name}
              projectsHref={routes.organisations.projects(o.slug)}
              enquiry={
                <EnquiryButton
                  viewer={viewer}
                  returnTo={routes.organisations.detail(o.slug)}
                  size="sm"
                />
              }
            />
            <ProjectsSection projects={projects} />
            <TrackRecordSection organisation={o} />
            <ImpactSection organisation={o} />
            <OrganisationDocumentsSection organisation={o} />
            <SimilarOrganisations items={similar} organisation={o} />
          </div>
        </div>
      </Container>
    </div>
  );
}
