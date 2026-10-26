import type * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 1 … 4 5 6 … 12 — keeps the row short when there are many pages. */
function pageList(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const sorted = [...new Set([1, pageCount, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  /** URL for a page number, keeping the current filters. */
  hrefForPage: (page: number) => string;
  className?: string;
};

/** "Showing 1–12 of 38" + Prev · numbers · Next. Renders nothing when everything fits on one page. */
export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  hrefForPage,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={cn("flex flex-wrap items-center justify-between gap-4 border-t pt-6", className)}
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <strong className="text-foreground">
          {from}–{to}
        </strong>{" "}
        of {total}
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <PageLink href={page > 1 ? hrefForPage(page - 1) : undefined} label="Previous page">
          <ChevronLeft aria-hidden />
          <span className="max-sm:sr-only">Prev</span>
        </PageLink>
        {pageList(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} aria-hidden className="px-1 text-subtle-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              asChild
              size="icon-sm"
              variant={p === page ? "default" : "ghost"}
              className={cn(p !== page && "text-muted-foreground")}
            >
              <Link
                href={hrefForPage(p)}
                scroll={false}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Link>
            </Button>
          ),
        )}
        <PageLink href={page < pageCount ? hrefForPage(page + 1) : undefined} label="Next page">
          <span className="max-sm:sr-only">Next</span>
          <ChevronRight aria-hidden />
        </PageLink>
      </nav>
    </div>
  );
}

function PageLink({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <Button size="sm" variant="outline" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild size="sm" variant="outline">
      <Link href={href} scroll={false} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}
