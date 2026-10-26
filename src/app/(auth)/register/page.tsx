import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Register your organisation" };

export default function Page() {
  return (
    <ComingSoon
      title="Register your organisation"
      description="Registration and company setup. Built in the Auth module."
      icon={UserPlus}
      backHref="/opportunities"
      backLabel="Back to Opportunities"
    />
  );
}
