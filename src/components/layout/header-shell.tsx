"use client";
import type * as React from "react";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky wrapper that adds a soft shadow once the page is scrolled. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur transition-shadow supports-[backdrop-filter]:bg-background/85",
        scrolled ? "shadow-[0_4px_20px_rgb(15_23_42/0.06)]" : "shadow-none",
      )}
    >
      {children}
    </header>
  );
}
