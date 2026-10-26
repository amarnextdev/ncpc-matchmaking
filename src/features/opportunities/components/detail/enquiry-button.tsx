import { EnquiryButton as SharedEnquiryButton } from "@/components/shared/enquiry-button";
import { routes } from "@/config/routes";
import type { Viewer } from "@/types";

export function EnquiryButton({
  viewer,
  slug,
  size,
  className,
}: {
  viewer: Viewer;
  slug: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <SharedEnquiryButton
      viewer={viewer}
      returnTo={routes.opportunities.detail(slug)}
      size={size}
      className={className}
    />
  );
}
