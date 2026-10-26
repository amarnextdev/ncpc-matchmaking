import { Skeleton } from "@/components/ui/skeleton";

export function OpportunityCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card" aria-hidden>
      <Skeleton className="h-[156px] rounded-none" />
      <div className="flex flex-col gap-3 p-5 pt-8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
