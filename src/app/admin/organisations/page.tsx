import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Organisations" };

export default function Page() {
  return (
    <ComingSoon
      title="Organisations"
      description="Manage all organisations here."
      icon={Building2}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
