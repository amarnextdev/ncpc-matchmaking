import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

/** Shown to signed-out visitors on list pages: explains what members get and invites them to register. */
export function VisitorBanner({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-primary/15 bg-primary-soft px-5 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white">
        <Sparkles className="size-5 text-primary" aria-hidden />
      </span>
      <div className="flex min-w-60 flex-1 flex-col gap-0.5">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.auth.signIn}>Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={routes.auth.register}>Register free</Link>
        </Button>
      </div>
    </div>
  );
}
