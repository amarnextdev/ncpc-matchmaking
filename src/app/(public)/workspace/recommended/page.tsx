import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Recommended" };

export default function Page() {
  return (
    <ComingSoon
      title="Recommended"
      description="Your best-matching partners and projects will appear here."
      icon={Sparkles}
    />
  );
}
