import type { Metadata } from "next";
import { Info } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "About NCPC" };

export default function Page() {
  return (
    <ComingSoon
      title="About NCPC"
      description="Learn about the National Cleaner Production Centre and this programme."
      icon={Info}
    />
  );
}
