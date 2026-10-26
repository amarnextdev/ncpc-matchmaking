import Link from "next/link";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

/** Signed-in members: "Your 2 projects qualify for 7 offers" + Show my matches. */
export function MemberMatchBanner({ projects, offers }: { projects: string[]; offers: number }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#D4E8C4] bg-success-soft px-5 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white">
        <Target className="size-5 text-success" aria-hidden />
      </span>
      <div className="flex min-w-60 flex-1 flex-col gap-0.5">
        <p className="text-sm font-bold">
          Your {projects.length === 1 ? "project qualifies" : `${projects.length} projects qualify`}{" "}
          for {offers} {offers === 1 ? "offer" : "offers"}
        </p>
        <p className="text-sm text-foreground/80">{projects.join(" · ")}</p>
      </div>
      <Button asChild size="sm" className="bg-success hover:bg-success/90">
        <Link href={`${routes.funding.list}?eligible=1`}>Show my matches</Link>
      </Button>
    </div>
  );
}
