import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { ProjectForm } from "@/features/projects/components/project-form";
import { requireListingOrg } from "@/features/projects/guard";
import { loadProjectForm } from "@/features/projects/queries";

export const metadata: Metadata = { title: "Edit project" };

type PageProps = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { org } = await requireListingOrg(routes.workspace.editProject(id));
  const initial = await loadProjectForm(org.id, { projectId: id });
  if (!initial) notFound();

  return (
    <div className="bg-surface pb-16">
      <ProjectForm
        initial={initial}
        org={org}
        hero={{
          title: `Edit “${initial.values.title}”`,
          description:
            initial.status === "changes_requested"
              ? "NCPC asked for a few changes. Update the project and send it again."
              : "Your project is with NCPC. Changes go back into the review queue when you send them.",
        }}
      />
    </div>
  );
}
