import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function Page() {
  return (
    <ComingSoon
      title="Admin dashboard"
      description="Key numbers and recent activity will appear here."
      icon={LayoutDashboard}
      backHref="/opportunities"
      backLabel="Back to website"
    />
  );
}
