import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { SendEnquiryDialog } from "@/features/collaboration/components/send-enquiry-dialog";
import type { EnquiryTarget } from "@/features/collaboration/types";
import { cn } from "@/lib/utils";
import type { Viewer } from "@/types";

/**
 * Visitors: "Sign in to send enquiry" (returns to `returnTo`).
 * Members: "Send enquiry" dialog, or "Message" when already connected to the target.
 */
export function EnquiryButton({
  viewer,
  returnTo,
  target,
  size = "default",
  variant = "default",
  className,
}: {
  viewer: Viewer;
  returnTo: string;
  target?: EnquiryTarget;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "inverse";
  className?: string;
}) {
  const inverse = variant === "inverse";
  const inverseClass = inverse ? "bg-white font-bold text-primary hover:bg-white/90" : undefined;

  if (viewer.signedIn && viewer.org && target) {
    if (target.org.slug === viewer.org.slug) return null;
    if (target.connectedHref) {
      return (
        <Button asChild size={size} className={cn(inverseClass, className)}>
          <Link href={target.connectedHref}>
            <MessageSquare aria-hidden />
            Message
          </Link>
        </Button>
      );
    }
    return (
      <SendEnquiryDialog
        target={target}
        viewerOrg={viewer.org}
        size={size}
        inverse={inverse}
        className={className}
      />
    );
  }

  if (viewer.signedIn) {
    return (
      <Button type="button" size={size} className={cn(inverseClass, className)}>
        Send enquiry
      </Button>
    );
  }
  return (
    <Button asChild size={size} className={cn(inverseClass, className)}>
      <Link href={`${routes.auth.signIn}?next=${encodeURIComponent(returnTo)}`}>
        Sign in to send enquiry
      </Link>
    </Button>
  );
}
