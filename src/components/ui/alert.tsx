import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3.5 text-sm has-[>svg]:grid-cols-[18px_1fr] has-[>svg]:gap-x-3 [&>svg]:size-[18px] [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary-soft text-foreground [&>svg]:text-primary",
        success: "border-success/20 bg-success-soft text-foreground [&>svg]:text-success",
        warning: "border-warning/25 bg-warning-soft text-foreground [&>svg]:text-warning",
        destructive:
          "border-destructive/25 bg-destructive/5 text-foreground [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 font-semibold", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
