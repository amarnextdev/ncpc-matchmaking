import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function OrganisationsEmpty() {
  return (
    <EmptyState
      icon={SearchX}
      title="No organisations match your filters"
      description="Try a different search term, another category, or remove a filter."
      className="bg-card"
      action={
        <Button asChild variant="outline-primary" size="sm">
          <Link href={routes.organisations.list}>Clear filters</Link>
        </Button>
      }
    />
  );
}
