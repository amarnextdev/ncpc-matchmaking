import type { Metadata } from "next";
import { Handshake } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Introductions" };

export default function Page() {
  return (
    <ComingSoon
      title="Introductions"
      description="Introduce organisations to each other here."
      icon={Handshake}
      backHref="/admin"
      backLabel="Back to dashboard"
    />
  );
}
