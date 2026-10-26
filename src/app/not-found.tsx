import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col items-center gap-4 px-5 py-28 text-center">
        <SearchX className="size-10 text-primary" aria-hidden />
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild>
          <Link href={routes.opportunities.list}>Browse opportunities</Link>
        </Button>
      </main>
      <SiteFooter />
    </>
  );
}
