import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Enquiries" };

export default function Page() {
  return (
    <ComingSoon
      title="Enquiries"
      description="Enquiries you send and receive will appear here."
      icon={Inbox}
    />
  );
}
