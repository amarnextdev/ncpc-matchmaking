"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Map of filter name → URL key, e.g. { q: "q", theme: "theme", page: "page" }. Must include `page`. */
export type FilterKeyMap = Record<string, string> & { page: string };

/**
 * Read and change list-page filters stored in the URL (?theme=energy,water&page=2).
 * Every change except a page change resets to page 1, keeps the scroll position,
 * and runs in a transition (isPending → show a subtle busy state).
 * Comma-separated values are used for multi-select filters.
 */
export function useFilterParams<M extends FilterKeyMap>(keys: M) {
  type Key = keyof M & string;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const push = useCallback(
    (next: URLSearchParams) => {
      if (next.get(keys.page) === "1") next.delete(keys.page);
      const query = next.toString();
      startTransition(() =>
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }),
      );
    },
    [keys.page, pathname, router],
  );

  const get = useCallback(
    (key: Key) => searchParams.get(keys[key] as string) ?? "",
    [keys, searchParams],
  );

  const getList = useCallback(
    (key: Key) => (searchParams.get(keys[key] as string) ?? "").split(",").filter(Boolean),
    [keys, searchParams],
  );

  const set = useCallback(
    (values: Partial<Record<Key, string | null>>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(values) as [Key, string | null | undefined][]) {
        const urlKey = keys[key] as string;
        if (value) next.set(urlKey, value);
        else next.delete(urlKey);
      }
      if (!("page" in values)) next.delete(keys.page);
      push(next);
    },
    [keys, push, searchParams],
  );

  const toggle = useCallback(
    (key: Key, value: string) => {
      const current = getList(key);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      set({ [key]: updated.join(",") || null } as Partial<Record<Key, string | null>>);
    },
    [getList, set],
  );

  /** Clears every filter but keeps the search text and the sort order. */
  const clearFilters = useCallback(
    (keep: Key[] = ["q", "sort"] as Key[]) => {
      const next = new URLSearchParams();
      for (const key of keep) {
        const urlKey = keys[key] as string | undefined;
        const value = urlKey ? searchParams.get(urlKey) : null;
        if (urlKey && value) next.set(urlKey, value);
      }
      push(next);
    },
    [keys, push, searchParams],
  );

  return { get, getList, set, toggle, clearFilters, isPending };
}

export type FilterParams<M extends FilterKeyMap> = ReturnType<typeof useFilterParams<M>>;
