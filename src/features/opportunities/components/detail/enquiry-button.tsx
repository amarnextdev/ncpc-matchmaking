import { EnquiryButton as SharedEnquiryButton } from "@/components/shared/enquiry-button";
import { routes } from "@/config/routes";
import type { EnquiryTarget } from "@/features/collaboration/types";
import type { Viewer } from "@/types";

export function EnquiryButton({
  viewer,
  slug,
  target,
  size,
  className,
}: {
  viewer: Viewer;
  slug: string;
  target?: EnquiryTarget;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <SharedEnquiryButton
      viewer={viewer}
      returnTo={routes.opportunities.detail(slug)}
      target={target}
      size={size}
      className={className}
    />
  );
}
