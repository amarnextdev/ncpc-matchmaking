import { Skeleton } from "@/components/ui/skeleton";

export function OrganisationCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
      <Skeleton className="h-[156px] rounded-none" />
      <div className="flex flex-col gap-3 px-5 pt-9 pb-5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
