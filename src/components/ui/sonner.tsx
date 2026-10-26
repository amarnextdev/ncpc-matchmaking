"use client";

import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Toast notifications. Mount once in the root layout; call toast("Saved") from anywhere. */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
