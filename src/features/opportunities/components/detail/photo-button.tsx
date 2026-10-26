"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { useGallery } from "./gallery-context";
import { PhotoFill } from "./photo-fill";

/** A photo tile that opens the lightbox at its index. */
export function PhotoButton({
  index,
  label,
  sizes = "160px",
  priority,
  className,
  children,
}: {
  index: number;
  label?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { photos, open } = useGallery();
  const photo = photos[index];
  if (!photo) return null;
  return (
    <button
      type="button"
      onClick={() => open(index)}
      aria-label={label ?? `Open photo: ${photo.caption}`}
      className={cn(
        "relative block cursor-zoom-in overflow-hidden focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none",
        className,
      )}
    >
      <PhotoFill photo={photo} sizes={sizes} priority={priority} />
      {children}
    </button>
  );
}

/** Small thumbnails for an update; the last one shows "+N" when there are more. */
export function UpdatePhotos({ indexes, max = 3 }: { indexes: number[]; max?: number }) {
  const shown = indexes.slice(0, max);
  const extra = indexes.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((photoIndex, i) => {
        const showExtra = extra > 0 && i === shown.length - 1;
        return (
          <PhotoButton
            key={photoIndex}
            index={photoIndex}
            label={showExtra ? `Open ${extra + 1} more photos` : undefined}
            sizes="84px"
            className="h-14 w-[76px] rounded-sm"
          >
            {showExtra ? (
              <span className="absolute inset-0 flex items-center justify-center bg-slate-900/45 text-[13px] font-bold text-white">
                +{extra}
              </span>
            ) : null}
          </PhotoButton>
        );
      })}
    </div>
  );
}
