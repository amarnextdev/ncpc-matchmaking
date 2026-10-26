import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { THEMES, labelFor } from "@/lib/constants";
import { AboutSection } from "@/features/opportunities/components/detail/about-section";
import {
  DocumentsSection,
  hasDocuments,
} from "@/features/opportunities/components/detail/documents-section";
import { EnquiryButton } from "@/features/opportunities/components/detail/enquiry-button";
import { FundingCard } from "@/features/opportunities/components/detail/funding-card";
import { GalleryProvider } from "@/features/opportunities/components/detail/gallery-context";
import { LookingForSection } from "@/features/opportunities/components/detail/looking-for-section";
import { OpportunityGallery } from "@/features/opportunities/components/detail/opportunity-gallery";
import { OpportunityTitle } from "@/features/opportunities/components/detail/opportunity-title";
import { OwnerCard } from "@/features/opportunities/components/detail/owner-card";
import { PartnersSection } from "@/features/opportunities/components/detail/partners-section";
import { ProgressSection } from "@/features/opportunities/components/detail/progress-section";
import { SectionTabs } from "@/features/opportunities/components/detail/section-tabs";
import { SimilarOpportunities } from "@/features/opportunities/components/detail/similar-opportunities";
import { isNewListing } from "@/features/opportunities/detail-meta";
import { getOpportunityBySlug, getSimilarOpportunities } from "@/features/opportunities/queries";
import type { Viewer } from "@/features/opportunities/types";
import { THEME_TINT } from "@/features/opportunities/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity) return { title: "Opportunity not found" };
  return { title: opportunity.title, description: opportunity.summary };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const o = await getOpportunityBySlug(slug);
  if (!o) notFound();

  const similar = await getSimilarOpportunities(o, 3);
  // TODO(Module 3 – Auth): real session. Members see match %, Send enquiry and Save.
  const viewer: Viewer = { signedIn: false };
  const isNew = isNewListing(o);
  const enquiry = <EnquiryButton viewer={viewer} slug={o.slug} />;

  const sections = [
    { id: "overview", label: "Overview" },
    ...(o.needs.length ? [{ id: "looking-for", label: "Looking for" }] : []),
    { id: "progress", label: "Progress" },
    { id: "partners", label: "Partners" },
    ...(hasDocuments(o) ? [{ id: "documents", label: "Documents" }] : []),
  ];

  return (
    <div className="bg-background">
      <GalleryProvider photos={o.gallery} title={o.title}>
        <Container className="pb-20">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 py-4 text-[13px] text-subtle-foreground"
          >
            <Link
              href={routes.opportunities.list}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Opportunities
            </Link>
            <span aria-hidden>/</span>
            <span>{labelFor(THEMES, o.theme)}</span>
          </nav>

          <div className="grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 lg:col-start-1">
              <OpportunityGallery fallbackTint={THEME_TINT[o.theme]} />
              <OpportunityTitle opportunity={o} isNew={isNew} />
            </div>

            <aside className="mb-8 flex flex-col gap-4 lg:sticky lg:top-[100px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mb-0 lg:self-start">
              <FundingCard opportunity={o} viewer={viewer} isNew={isNew} />
              <OwnerCard opportunity={o} />
            </aside>

            <div className="min-w-0 lg:col-start-1">
              <SectionTabs sections={sections} />
              <AboutSection opportunity={o} />
              <LookingForSection opportunity={o} />
              <ProgressSection opportunity={o} cta={enquiry} />
              <PartnersSection opportunity={o} cta={enquiry} />
              <DocumentsSection opportunity={o} />
              <SimilarOpportunities items={similar} theme={o.theme} />
            </div>
          </div>
        </Container>
      </GalleryProvider>
    </div>
  );
}
