import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Privacy notice" };

export default function Page() {
  return (
    <ComingSoon
      title="Privacy notice"
      description="The privacy notice will be published here."
      icon={ShieldCheck}
    />
  );
}
