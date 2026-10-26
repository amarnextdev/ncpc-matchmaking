import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

/** Right side of the header for visitors. Signed-in actions (bell, workspace, avatar) come in the Auth module. */
export function HeaderActions() {
  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Button variant="ghost" size="icon" aria-label="Search opportunities" asChild>
        <Link href={routes.opportunities.list}>
          <Search className="size-5" />
        </Link>
      </Button>
      <span aria-hidden className="mx-1 h-6 w-px bg-border" />
      <Button variant="ghost" className="text-primary" asChild>
        <Link href={routes.auth.signIn}>Sign in</Link>
      </Button>
      <Button asChild>
        <Link href={routes.auth.register}>Register organisation</Link>
      </Button>
    </div>
  );
}
