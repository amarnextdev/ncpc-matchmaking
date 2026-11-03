import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-6">
      <div className="flex h-[calc(100dvh-14rem)] min-h-[560px] overflow-hidden rounded-lg border bg-card">
        <div className="flex w-full flex-col gap-3 border-r p-4 lg:w-[320px]">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-10 w-full rounded-full" />
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[72px] w-full" />
          ))}
        </div>
        <div className="hidden flex-1 flex-col gap-4 p-6 lg:flex">
          <Skeleton className="h-11 w-64" />
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-24 w-2/3" />
        </div>
      </div>
    </Container>
  );
}
