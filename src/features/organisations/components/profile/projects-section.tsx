import { DetailSection } from "@/components/shared/detail-section";
import { OpportunityCard } from "@/features/opportunities/components/opportunity-card";
import type { Opportunity } from "@/features/opportunities/types";

/** Opportunities this organisation has listed (project developers, parks, tenants…). */
export function ProjectsSection({ projects }: { projects: Opportunity[] }) {
  if (!projects.length) return null;
  return (
    <DetailSection
      id="projects"
      title="Projects"
      description={`${projects.length} published ${projects.length === 1 ? "opportunity" : "opportunities"}`}
    >
      <ul className="grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <li key={project.id} className="flex">
            <OpportunityCard opportunity={project} className="w-full" />
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}
