import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { OpportunityCardSkeleton } from "@/features/opportunities/components/opportunity-card-skeleton";

export default function Loading() {
  return (
    <div className="bg-surface">
      <div className="h-[300px] bg-primary" />
      <Container className="-mt-11">
        <Skeleton className="h-[150px] rounded-lg bg-card shadow-overlay" />
      </Container>
      <Container className="flex items-start gap-7 pt-9 pb-16">
        <Skeleton className="hidden h-[420px] w-[264px] shrink-0 rounded-lg lg:block" />
        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <OpportunityCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
