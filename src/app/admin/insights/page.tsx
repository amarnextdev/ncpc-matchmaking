import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Insights" };

export default function Page() {
  return (
    <ComingSoon
      title="Insights"
      description="Matchmaking funnel and investment totals will appear here."
      icon={BarChart3}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
