import { SectionSkeleton } from "@/features/explore/components/section-skeleton";

export default function Loading() {
  return (
    <div className="bg-surface">
      <div className="h-[318px] bg-primary" />
      <SectionSkeleton />
    </div>
  );
}
