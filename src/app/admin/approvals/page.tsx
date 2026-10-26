import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Approvals" };

export default function Page() {
  return (
    <ComingSoon
      title="Approvals"
      description="Organisations waiting for NCPC approval will appear here."
      icon={ClipboardCheck}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
