"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Photo } from "../../types";
import { PhotoFill } from "./photo-fill";

type GalleryContextValue = { photos: Photo[]; open: (index: number) => void };

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function useGallery() {
  const value = useContext(GalleryContext);
  if (!value) throw new Error("useGallery must be used inside <GalleryProvider>");
  return value;
}

/**
 * Holds the project photos and renders ONE lightbox for the whole page.
 * Any photo button (gallery, latest update, updates sheet) calls open(index).
 */
export function GalleryProvider({
  photos,
  title,
  children,
}: {
  photos: Photo[];
  title: string;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback((i: number) => setIndex(i), []);
  const value = useMemo(() => ({ photos, open }), [photos, open]);

  const count = photos.length;
  const current = index === null ? undefined : photos[index];
  const go = (step: number) => setIndex((i) => (i === null ? i : (i + step + count) % count));

  return (
    <GalleryContext.Provider value={value}>
      {children}

      <Dialog open={current !== undefined} onOpenChange={(isOpen) => !isOpen && setIndex(null)}>
        <DialogContent
          showCloseButton={false}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(1);
            if (event.key === "ArrowLeft") go(-1);
          }}
          className="inset-0 top-0 left-0 flex h-dvh max-h-none w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-[#080f1e]/95 p-0 text-white shadow-none"
        >
          {current && index !== null ? (
            <>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <DialogTitle className="truncate text-sm font-semibold">
                  {index + 1} / {count} · {current.caption}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Photos of {title}. Use the left and right arrow keys to move between photos.
                </DialogDescription>
                <DialogClose
                  aria-label="Close gallery"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/30 hover:bg-white/10 focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none"
                >
                  <X className="size-5" aria-hidden />
                </DialogClose>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center gap-3 px-3 sm:gap-4 sm:px-4">
                <ArrowButton label="Previous photo" onClick={() => go(-1)}>
                  <ChevronLeft className="size-6" aria-hidden />
                </ArrowButton>
                <div className="relative aspect-[16/10] max-h-full w-full max-w-[960px] overflow-hidden rounded-md">
                  <PhotoFill photo={current} sizes="(min-width: 1024px) 960px, 100vw" priority />
                  {current.url ? null : (
                    <span className="absolute inset-0 flex items-center justify-center text-[13px] text-white/80">
                      [Photo: {current.caption}]
                    </span>
                  )}
                </div>
                <ArrowButton label="Next photo" onClick={() => go(1)}>
                  <ChevronRight className="size-6" aria-hidden />
                </ArrowButton>
              </div>

              <div className="flex gap-2 overflow-x-auto px-4 py-4 sm:justify-center">
                {photos.map((photo, i) => (
                  <button
                    key={`${photo.caption}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show photo ${i + 1}: ${photo.caption}`}
                    aria-current={i === index ? "true" : undefined}
                    className={cn(
                      "relative h-12 w-[72px] shrink-0 overflow-hidden rounded-sm border-2 transition-opacity",
                      i === index
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <PhotoFill photo={photo} sizes="72px" />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </GalleryContext.Provider>
  );
}

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 focus-visible:ring-[3px] focus-visible:ring-white/40 focus-visible:outline-none sm:size-12"
    >
      {children}
    </button>
  );
}
