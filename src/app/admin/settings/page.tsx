import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <ComingSoon
      title="Settings"
      description="Categories, tags and matching weights will appear here."
      icon={Settings}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
