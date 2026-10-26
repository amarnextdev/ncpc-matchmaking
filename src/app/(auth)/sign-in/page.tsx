import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <ComingSoon
      title="Sign in"
      description="Sign in to your organisation account. Built in the Auth module."
      icon={LogIn}
      backHref="/opportunities"
      backLabel="Back to Opportunities"
    />
  );
}
