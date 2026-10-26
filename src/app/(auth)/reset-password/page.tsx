import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <ComingSoon
      title="Reset password"
      description="Choose a new password. Built in the Auth module."
      icon={KeyRound}
      backHref="/sign-in"
      backLabel="Back to sign in"
    />
  );
}
