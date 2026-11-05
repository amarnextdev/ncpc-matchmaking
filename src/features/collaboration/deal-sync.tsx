"use client";

import { createContext, useCallback, useContext, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Tells the other side of the conversation that the deal changed (realtime broadcast). */
const DealSyncContext = createContext<{ notify: () => void }>({ notify: () => {} });

export function DealSyncProvider({
  notify,
  children,
}: {
  notify: () => void;
  children: React.ReactNode;
}) {
  return <DealSyncContext.Provider value={{ notify }}>{children}</DealSyncContext.Provider>;
}

const TIMEOUT_MS = 20_000;

/**
 * Runs a deal action with a clear loading state:
 * - `busy` is the key of the button that is working (only that one shows a spinner, all wait);
 * - the button stops spinning as soon as the server answers (never stuck on a slow refresh);
 * - then the other side is told at once (broadcast) and our data refreshes (`syncing`).
 */
export function useDealRun() {
  const router = useRouter();
  const { notify } = useContext(DealSyncContext);
  const [busy, setBusy] = useState<string | null>(null);
  const [syncing, startSync] = useTransition();
  const running = useRef(false);

  const run = useCallback(
    async <T extends ActionResult>(
      key: string,
      fn: () => Promise<T>,
      opts: { success?: string; onDone?: (r: T & { ok: true }) => void } = {},
    ): Promise<boolean> => {
      if (running.current) return false;
      running.current = true;
      setBusy(key);
      try {
        const r = await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            window.setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS),
          ),
        ]);
        if (!r.ok) {
          toast.error(r.error);
          return false;
        }
        if (opts.success) toast.success(opts.success);
        opts.onDone?.(r as T & { ok: true });
        notify();
        startSync(() => router.refresh());
        return true;
      } catch (error) {
        toast.error(
          error instanceof Error && error.message === "timeout"
            ? "This is taking too long. Check your connection and try again."
            : "Something went wrong. Please try again.",
        );
        return false;
      } finally {
        running.current = false;
        setBusy(null);
      }
    },
    [notify, router],
  );

  return { busy, syncing, run };
}
