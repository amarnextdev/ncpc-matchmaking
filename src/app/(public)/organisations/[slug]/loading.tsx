import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-background">
      <Container className="pb-20">
        <Skeleton className="my-4 h-4 w-44" />
        <Skeleton className="h-[150px] rounded-xl md:h-[220px]" />
        <div className="flex flex-col gap-3 px-1 md:px-6">
          <Skeleton className="-mt-[38px] size-[76px] rounded-[18px] border-4 border-background md:-mt-[52px] md:size-[104px]" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-9 w-2/3" />
        </div>
        <Skeleton className="mt-6 h-20 rounded-lg" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-28" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-[380px] rounded-lg" />
        </div>
      </Container>
    </div>
  );
}
