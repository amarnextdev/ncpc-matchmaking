import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

/** No results for the current search / filters. */
export function OpportunitiesEmpty() {
  return (
    <EmptyState
      icon={SearchX}
      title="No opportunities match your filters"
      description="Try a different search term, or remove a filter to see more projects."
      className="bg-card"
      action={
        <Button asChild variant="outline-primary" size="sm">
          <Link href={routes.opportunities.list}>Clear filters</Link>
        </Button>
      }
    />
  );
}
