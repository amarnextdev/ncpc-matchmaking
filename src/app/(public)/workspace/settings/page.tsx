import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <ComingSoon
      title="Settings"
      description="Account and notification settings will appear here."
      icon={Settings}
    />
  );
}
