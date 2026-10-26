import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return (
    <ComingSoon
      title="Forgot password"
      description="Password reset. Built in the Auth module."
      icon={KeyRound}
      backHref="/sign-in"
      backLabel="Back to sign in"
    />
  );
}
