import { Download, Lock } from "lucide-react";
import type { OpportunityDetail } from "../../types";
import { DetailSection } from "./detail-section";
import { FileBadge } from "./file-badge";

export function hasDocuments(o: OpportunityDetail) {
  return (
    o.documents.public.length > 0 || o.documents.locked.length > 0 || o.documents.note !== null
  );
}

/** Public downloads + documents that unlock after an accepted enquiry. */
export function DocumentsSection({ opportunity: o }: { opportunity: OpportunityDetail }) {
  if (!hasDocuments(o)) return null;
  const { public: files, locked, note } = o.documents;
  return (
    <DetailSection id="documents" title="Documents">
      <ul className="flex flex-col gap-2.5">
        {files.map((file) => (
          <li
            key={file.name}
            className="flex items-center justify-between gap-3 rounded-md border px-3.5 py-3 text-sm"
          >
            <span className="flex items-center gap-2.5">
              <FileBadge type={file.type} />
              {file.name}
            </span>
            <a
              href={file.url}
              download
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <Download className="size-4" aria-hidden />
              Download
            </a>
          </li>
        ))}
        {locked.length ? (
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-input px-3.5 py-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2.5">
              <Lock className="size-[18px] text-subtle-foreground" aria-hidden />
              {locked.join(", ")}
            </span>
            <span className="text-[13px]">Shared after an enquiry is accepted</span>
          </li>
        ) : null}
      </ul>
      {note ? <p className="text-[13px] text-subtle-foreground">{note}</p> : null}
    </DetailSection>
  );
}
