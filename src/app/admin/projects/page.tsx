import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <ComingSoon
      title="Projects"
      description="Review and moderate projects here."
      icon={FolderKanban}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
