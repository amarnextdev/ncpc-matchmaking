import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function FundingEmpty() {
  return (
    <EmptyState
      icon={SearchX}
      title="No funding offers match your filters"
      description="Try another type or theme, or remove a filter. New offers are added every month."
      className="bg-card"
      action={
        <Button asChild variant="outline-primary" size="sm">
          <Link href={routes.funding.list}>Clear filters</Link>
        </Button>
      }
    />
  );
}
