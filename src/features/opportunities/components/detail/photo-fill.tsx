import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Photo } from "../../types";

/** Fills its (relative) parent with the photo, or with the placeholder colour while there is no photo. */
export function PhotoFill({
  photo,
  sizes,
  priority,
  className,
}: {
  photo: Photo;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (photo.url) {
    return (
      <Image
        src={photo.url}
        alt={photo.caption}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("absolute inset-0", className)}
      style={{ backgroundColor: photo.tint }}
    />
  );
}
