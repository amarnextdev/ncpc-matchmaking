import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

/** First load of Explore (results area). */
export function SectionSkeleton() {
  return (
    <Container aria-busy="true" className="flex items-start gap-7 pt-9 pb-16">
      <Skeleton className="hidden h-[420px] w-[264px] shrink-0 rounded-lg bg-card lg:block" />
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-11 w-[420px] max-w-full rounded-full" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[340px] rounded-lg bg-card" />
          ))}
        </div>
      </div>
    </Container>
  );
}
