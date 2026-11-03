import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  error: {
    icon: AlertCircle,
    className: "border-destructive/25 bg-destructive/5 text-destructive",
  },
  info: { icon: Info, className: "border-primary/15 bg-primary-soft text-primary" },
  success: { icon: CheckCircle2, className: "border-success/25 bg-success-soft text-success" },
} as const;

/** Message above or below an auth form. Errors are announced to screen readers. */
export function FormAlert({
  tone = "error",
  children,
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
}) {
  const { icon: Icon, className } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm leading-5", className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
