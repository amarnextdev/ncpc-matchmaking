import type { Metadata } from "next";
import { Users } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return (
    <ComingSoon
      title="Users"
      description="Manage user accounts here."
      icon={Users}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
