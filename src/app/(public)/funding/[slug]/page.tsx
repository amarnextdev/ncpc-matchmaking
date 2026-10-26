import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionTabs } from "@/components/shared/section-tabs";
import { routes } from "@/config/routes";
import { fundingType } from "@/features/funding/constants";
import { ApplyCard } from "@/features/funding/components/detail/apply-card";
import { FunderCard, SafetyNote } from "@/features/funding/components/detail/funder-card";
import { OfferHeader } from "@/features/funding/components/detail/offer-header";
import {
  AboutOffer,
  Eligibility,
  FundedSoFar,
  HowToApply,
  OfferFaq,
  SimilarOffers,
  Terms,
} from "@/features/funding/components/detail/offer-sections";
import { getOfferBySlug, getSimilarOffers } from "@/features/funding/queries";
import type { Viewer } from "@/types";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);
  if (!offer) return { title: "Funding offer not found" };
  return { title: `${offer.title} · ${offer.funder.name}`, description: offer.summary };
}

export default async function FundingOfferPage({ params }: PageProps) {
  const { slug } = await params;
  const o = await getOfferBySlug(slug);
  if (!o) notFound();

  const similar = await getSimilarOffers(o, 3);
  // TODO(Module 3 – Auth): real session. Members see the eligibility check and Apply with a project.
  const viewer: Viewer = { signedIn: false };
  const type = fundingType(o.type);

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "eligibility", label: "Eligibility" },
    { id: "terms", label: "Terms" },
    { id: "apply", label: "How to apply" },
    ...(o.funded.count ? [{ id: "funded", label: "Funded projects" }] : []),
    { id: "faq", label: "FAQ" },
  ];

  return (
    <div className="bg-background">
      <Container className="pb-20">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 py-4 text-[13px] text-subtle-foreground"
        >
          <Link
            href={routes.funding.list}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Funding
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`${routes.funding.list}?type=${type.value}`}
            className="hover:text-foreground"
          >
            {type.plural}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-foreground">{o.title}</span>
        </nav>

        <OfferHeader offer={o} />

        <div className="mt-8 grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <aside className="mb-8 flex flex-col gap-4 lg:sticky lg:top-[100px] lg:col-start-2 lg:row-start-1 lg:mb-0 lg:self-start">
            <ApplyCard offer={o} viewer={viewer} />
            <FunderCard offer={o} />
            <SafetyNote />
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <SectionTabs sections={sections} />
            <AboutOffer offer={o} />
            <Eligibility offer={o} viewer={viewer} />
            <Terms offer={o} />
            <HowToApply offer={o} />
            <FundedSoFar offer={o} />
            <OfferFaq offer={o} />
            <SimilarOffers items={similar} />
          </div>
        </div>
      </Container>
    </div>
  );
}
