import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Organisation" };

export default function Page() {
  return (
    <ComingSoon
      title="Organisation"
      description="Edit your organisation profile here."
      icon={Building2}
    />
  );
}
