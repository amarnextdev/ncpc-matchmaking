import Link from "next/link";
import { Clock3, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

type ComingSoonProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  backHref?: string;
  backLabel?: string;
};

/**
 * Placeholder for any page that is not built yet. A page only needs:
 *   export default function Page() { return <ComingSoon title="Funding" /> }
 */
export function ComingSoon({
  title,
  description = "We're building this section now. It will be available soon.",
  icon: Icon = Clock3,
  backHref = routes.opportunities.list,
  backLabel = "Back to Opportunities",
}: ComingSoonProps) {
  return (
    <section
      aria-labelledby="coming-soon-title"
      className="flex justify-center px-5 py-20 md:py-28"
    >
      <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border bg-card px-6 py-12 text-center shadow-card md:px-10">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft">
          <Icon className="size-8 text-primary" strokeWidth={1.8} aria-hidden />
        </span>
        <Badge variant="verified" className="tracking-[0.08em] uppercase">
          Coming soon
        </Badge>
        <h1 id="coming-soon-title" className="text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="max-w-md text-base leading-7 text-muted-foreground">{description}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2.5">
          <Button asChild>
            <Link href={backHref}>← {backLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
