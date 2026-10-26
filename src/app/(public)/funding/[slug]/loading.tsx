import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="pb-20">
      <Skeleton className="my-4 h-4 w-60" />
      <Skeleton className="h-[380px] rounded-xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-[420px] rounded-lg" />
      </div>
    </Container>
  );
}
