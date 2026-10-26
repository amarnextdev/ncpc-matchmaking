import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import type { Viewer } from "@/types";

/**
 * Members: "Send enquiry". Visitors: "Sign in to send enquiry", returning to `returnTo` after sign-in.
 * TODO(Enquiries module): open the Send enquiry dialog.
 */
export function EnquiryButton({
  viewer,
  returnTo,
  size = "default",
  variant = "default",
  className,
}: {
  viewer: Viewer;
  returnTo: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "inverse";
  className?: string;
}) {
  const inverse =
    variant === "inverse" ? "bg-white font-bold text-primary hover:bg-white/90" : undefined;
  if (viewer.signedIn) {
    return (
      <Button type="button" size={size} className={[inverse, className].filter(Boolean).join(" ")}>
        Send enquiry
      </Button>
    );
  }
  return (
    <Button asChild size={size} className={[inverse, className].filter(Boolean).join(" ")}>
      <Link href={`${routes.auth.signIn}?next=${encodeURIComponent(returnTo)}`}>
        Sign in to send enquiry
      </Link>
    </Button>
  );
}
