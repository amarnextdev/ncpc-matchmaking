import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-surface">
      <div className="h-[340px] bg-primary" />
      <Container className="-mt-11">
        <Skeleton className="h-[90px] rounded-lg bg-card shadow-overlay" />
      </Container>
      <Container className="flex gap-2 pt-7">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-full" />
        ))}
      </Container>
      <Container className="grid gap-6 pt-6 pb-16 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[420px] rounded-lg" />
        ))}
      </Container>
    </div>
  );
}
