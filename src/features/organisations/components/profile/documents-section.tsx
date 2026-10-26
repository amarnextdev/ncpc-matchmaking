import { Download, Lock } from "lucide-react";
import { DetailSection } from "@/components/shared/detail-section";
import { FileBadge } from "@/components/shared/file-badge";
import type { OrganisationDetail } from "../../types";

export function hasOrganisationDocuments(o: OrganisationDetail) {
  return o.documents.public.length > 0 || o.documents.locked.length > 0;
}

export function OrganisationDocumentsSection({
  organisation: o,
}: {
  organisation: OrganisationDetail;
}) {
  if (!hasOrganisationDocuments(o)) return null;
  return (
    <DetailSection id="documents" title="Documents">
      <ul className="flex flex-col gap-2.5">
        {o.documents.public.map((file) => (
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
        {o.documents.locked.length ? (
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-input px-3.5 py-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2.5">
              <Lock className="size-[18px] text-subtle-foreground" aria-hidden />
              {o.documents.locked.join(", ")}
            </span>
            <span className="text-[13px]">Shared after an enquiry is accepted</span>
          </li>
        ) : null}
      </ul>
    </DetailSection>
  );
}
