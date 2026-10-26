import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <ComingSoon
      title="Contact"
      description="A contact form and NCPC details will appear here."
      icon={Mail}
    />
  );
}
