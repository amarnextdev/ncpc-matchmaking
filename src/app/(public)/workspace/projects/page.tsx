import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "My projects" };

export default function Page() {
  return (
    <ComingSoon
      title="My projects"
      description="Create and manage your projects here."
      icon={FolderKanban}
    />
  );
}
