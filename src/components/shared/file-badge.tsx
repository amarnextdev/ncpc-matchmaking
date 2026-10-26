import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types";

const STYLES: Record<DocumentType, string> = {
  pdf: "bg-[#FDECEC] text-destructive",
  xlsx: "bg-success-soft text-success",
  doc: "bg-primary-soft text-primary",
};

/** Small coloured file-type tile: PDF / XLSX / DOC. */
export function FileBadge({ type, className }: { type: DocumentType; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[6px] text-[10px] font-bold uppercase",
        STYLES[type],
        className,
      )}
    >
      {type}
    </span>
  );
}
