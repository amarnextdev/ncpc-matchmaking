import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "My offers" };

export default function Page() {
  return (
    <ComingSoon
      title="My offers"
      description="Your funding offers, who applied and where each one stands will appear here."
      icon={Wallet}
    />
  );
}
