"use client";

import * as React from "react";
import { UploadError, uploadFile } from "@/lib/storage/client";
import type { UploadKind } from "@/lib/storage/kinds";
import { registerUploadAction } from "./actions";
import type { FileRef } from "./schema";

/** Upload one file (resize → signed upload → server check) and get back a saved FileRef. */
export function useUpload(kind: UploadKind) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const upload = React.useCallback(
    async (file: File): Promise<FileRef | null> => {
      setBusy(true);
      setError(null);
      try {
        const up = await uploadFile(kind, file);
        const saved = await registerUploadAction({
          kind,
          bucket: up.bucket,
          path: up.path,
          originalName: up.originalName,
          width: up.width,
          height: up.height,
        });
        if (!saved.ok) {
          setError(saved.error);
          return null;
        }
        return saved.file;
      } catch (e) {
        setError(e instanceof UploadError ? e.message : "The upload failed. Please try again.");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [kind],
  );

  return { upload, busy, error, clearError: () => setError(null) };
}
