import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Funding offers" };

export default function Page() {
  return (
    <ComingSoon
      title="Funding offers"
      description="Approve funding offers here."
      icon={Wallet}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
