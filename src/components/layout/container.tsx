import type * as React from "react";
import { cn } from "@/lib/utils";

/** Centres page content at the 1280px max width with the standard side padding. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 lg:px-6", className)} {...props} />;
}
