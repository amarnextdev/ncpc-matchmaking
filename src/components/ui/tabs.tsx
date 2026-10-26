"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

/** variant "pill": grey track with white active pill. variant "line": underline tabs (detail pages). */
function TabsList({
  className,
  variant = "pill",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: "pill" | "line" }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs inline-flex items-center",
        variant === "pill" && "h-11 w-fit gap-1 rounded-full bg-muted p-1",
        variant === "line" && "h-12 w-full gap-6 overflow-x-auto border-b",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        "group-data-[variant=pill]/tabs:h-full group-data-[variant=pill]/tabs:rounded-full group-data-[variant=pill]/tabs:px-4 group-data-[variant=pill]/tabs:data-[state=active]:bg-background group-data-[variant=pill]/tabs:data-[state=active]:text-foreground group-data-[variant=pill]/tabs:data-[state=active]:shadow-card",
        "group-data-[variant=line]/tabs:-mb-px group-data-[variant=line]/tabs:h-full group-data-[variant=line]/tabs:border-b-2 group-data-[variant=line]/tabs:border-transparent group-data-[variant=line]/tabs:data-[state=active]:border-primary group-data-[variant=line]/tabs:data-[state=active]:font-semibold group-data-[variant=line]/tabs:data-[state=active]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
