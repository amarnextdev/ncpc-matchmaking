import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <ComingSoon
      title="Terms of use"
      description="The terms of use will be published here."
      icon={FileText}
    />
  );
}
