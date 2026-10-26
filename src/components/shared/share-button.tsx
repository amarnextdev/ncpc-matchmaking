"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Opens the device share sheet, or copies the page link and shows a toast. */
export function ShareButton({
  title,
  label = "Share",
  className,
}: {
  title: string;
  label?: string;
  className?: string;
}) {
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      // The user closed the share sheet, or the clipboard is blocked: nothing to do.
    }
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      onClick={share}
      className={cn(className)}
    >
      <Share2 />
    </Button>
  );
}
