import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return (
    <ComingSoon
      title="Notifications"
      description="All your notifications will appear here."
      icon={Bell}
    />
  );
}
