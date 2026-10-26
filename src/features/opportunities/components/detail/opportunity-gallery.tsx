"use client";

import { LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGallery } from "./gallery-context";
import { PhotoButton } from "./photo-button";

/**
 * Desktop: 1 large + 4 small photos and "Show all N photos".
 * Mobile: one photo with a "1 / N" counter. No photos yet: a concept cover.
 */
export function OpportunityGallery({ fallbackTint }: { fallbackTint: string }) {
  const { photos, open } = useGallery();
  const cover = photos[0];

  if (!cover) {
    return (
      <section
        aria-label="Project image"
        className="flex h-[180px] items-end justify-between gap-3 rounded-xl p-4 md:h-[300px]"
        style={{ backgroundColor: fallbackTint }}
      >
        <Badge variant="overlay" className="font-medium">
          Concept image
        </Badge>
        <span className="text-xs text-white/80 max-sm:hidden">
          Site photos will be added as the project progresses
        </span>
      </section>
    );
  }

  const side = photos.slice(1, 5);
  const mosaic = side.length === 4;

  return (
    <section aria-label="Project photos" className="relative">
      <div
        className={cn(
          "hidden gap-2 overflow-hidden rounded-xl md:grid",
          mosaic ? "grid-cols-[2fr_1fr_1fr] grid-rows-[170px_170px]" : "grid-rows-[348px]",
        )}
      >
        <PhotoButton
          index={0}
          priority
          sizes="(min-width: 1024px) 560px, 60vw"
          label={`Open photo 1 of ${photos.length}: ${cover.caption}`}
          className={cn("h-full w-full", mosaic && "row-span-2")}
        >
          <Badge variant="overlay" className="absolute bottom-3.5 left-3.5 font-medium">
            Cover · {cover.caption}
          </Badge>
        </PhotoButton>
        {mosaic
          ? side.map((photo, i) => (
              <PhotoButton
                key={`${photo.caption}-${i}`}
                index={i + 1}
                sizes="280px"
                label={`Open photo ${i + 2}: ${photo.caption}`}
                className="h-full w-full"
              />
            ))
          : null}
      </div>
      {photos.length > 1 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => open(0)}
          className="absolute right-4 bottom-4 hidden border-foreground md:inline-flex"
        >
          <LayoutGrid aria-hidden />
          Show all {photos.length} photos
        </Button>
      ) : null}

      <PhotoButton
        index={0}
        priority
        sizes="100vw"
        label="Open photo gallery"
        className="h-60 w-full rounded-lg md:hidden"
      >
        <span className="absolute right-3 bottom-3 rounded-full bg-slate-900/60 px-2.5 py-1 text-xs font-semibold text-white">
          1 / {photos.length}
        </span>
      </PhotoButton>
    </section>
  );
}
