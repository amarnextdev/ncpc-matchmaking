import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-background">
      <Container className="pb-20">
        <Skeleton className="my-4 h-4 w-44" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-60 rounded-xl md:h-[348px]" />
            <Skeleton className="mt-2 h-6 w-48" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-6 h-12 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-[420px] rounded-lg" />
            <Skeleton className="h-[260px] rounded-lg" />
          </div>
        </div>
      </Container>
    </div>
  );
}
