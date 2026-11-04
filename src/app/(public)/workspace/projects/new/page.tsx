import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { ProjectForm } from "@/features/projects/components/project-form";
import { requireListingOrg } from "@/features/projects/guard";
import { loadProjectForm } from "@/features/projects/queries";

export const metadata: Metadata = { title: "List a project" };

type PageProps = { searchParams: Promise<{ draft?: string | string[] }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function NewProjectPage({ searchParams }: PageProps) {
  const { draft } = await searchParams;
  const draftId = typeof draft === "string" && UUID.test(draft) ? draft : null;
  const { org } = await requireListingOrg(
    draftId ? routes.workspace.projectDraft(draftId) : routes.workspace.newProject,
  );
  const initial = await loadProjectForm(org.id, { draftId });
  if (!initial) notFound();

  return (
    <div className="bg-surface pb-16">
      <ProjectForm
        initial={initial}
        org={org}
        hero={{
          title: initial.mode === "draft" ? "Continue your project" : "List a project",
          description:
            "Five short steps. NCPC checks your project before it goes live, usually within 2–3 working days.",
        }}
      />
    </div>
  );
}
