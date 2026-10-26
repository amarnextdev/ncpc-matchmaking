import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return (
    <ComingSoon
      title="Overview"
      description="Your actions, pipeline and project progress will appear here."
      icon={LayoutDashboard}
    />
  );
}
