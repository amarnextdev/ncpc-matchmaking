"use client";

import { useState } from "react";
import type * as React from "react";
import { MapPin, Search, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterParams } from "@/hooks/use-filter-params";
import { PROVINCES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { TRACK_PARAMS } from "../search-params";
import type { TrackFilters, TrackSort } from "../types";

const useTrackParams = () => useFilterParams(TRACK_PARAMS);

/** Search card overlapping the hero: project/owner search, province (+ role when the organisation has several). */
export function TrackSearch({
  filters,
  roles,
}: {
  filters: TrackFilters;
  roles: readonly { value: string; label: string }[];
}) {
  const params = useTrackParams();
  const [q, setQ] = useState(filters.q);
  const [role, setRole] = useState(filters.role ?? "");
  const [province, setProvince] = useState(filters.province ?? "");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    params.set({ q: q.trim() || null, role: role || null, province: province || null });
  }

  return (
    <Container className="relative -mt-11">
      <form
        role="search"
        aria-label="Search projects"
        onSubmit={submit}
        className="flex flex-wrap gap-3 rounded-lg border bg-card p-5 shadow-overlay"
      >
        <div className="relative flex flex-[3_1_300px] items-center">
          <Search
            className="pointer-events-none absolute left-4 size-[18px] text-subtle-foreground"
            aria-hidden
          />
          <label htmlFor="track-q" className="sr-only">
            Search projects
          </label>
          <Input
            id="track-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Project name or project owner"
            className="h-[50px] pl-11"
          />
        </div>
        <Combobox
          aria-label="Province"
          size="lg"
          icon={MapPin}
          options={PROVINCES}
          allLabel="All provinces"
          searchPlaceholder="Search province…"
          value={province}
          onValueChange={setProvince}
          className="flex-[1_1_190px]"
        />
        {roles.length > 1 ? (
          <Combobox
            aria-label="Role"
            size="lg"
            icon={Users}
            options={roles}
            allLabel="All roles"
            value={role}
            onValueChange={setRole}
            className="flex-[1_1_200px]"
          />
        ) : null}
        <Button type="submit" size="lg" className="h-[50px] px-8" disabled={params.isPending}>
          Search
        </Button>
      </form>
    </Container>
  );
}

const DOT: Record<string, string> = {
  operational: "bg-success",
  construction: "bg-primary",
  funding: "bg-[#C98A16]",
  feasibility: "bg-subtle-foreground",
  idea: "bg-input",
};

/** Status pill tabs with counts and colour dots. */
export function TrackStatusTabs({
  active,
  allCount,
  stages,
}: {
  active: string | null;
  allCount: number;
  stages: { value: string; label: string; count: number }[];
}) {
  const params = useTrackParams();
  const tabs = [
    { value: null as string | null, label: "All projects", count: allCount },
    ...[...stages].reverse(),
  ];
  return (
    <div
      role="tablist"
      aria-label="Project status"
      className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
    >
      {tabs.map((tab) => {
        const selected = tab.value === active;
        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => params.set({ stage: tab.value })}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-foreground/80 hover:border-subtle-foreground",
            )}
          >
            {tab.value ? (
              <span
                aria-hidden
                className={cn("size-2 rounded-full", selected ? "bg-white" : DOT[tab.value])}
              />
            ) : null}
            {tab.label} <span className="font-medium opacity-70">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

const SORTS: { value: TrackSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "stage", label: "Most advanced" },
];

/** "14 projects" + sort. */
export function TrackResultsBar({ total, sort }: { total: number; sort: TrackSort }) {
  const params = useTrackParams();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3" aria-busy={params.isPending}>
      <h2 className="text-lg font-bold" aria-live="polite">
        {total} {total === 1 ? "project" : "projects"}
      </h2>
      <Select
        value={sort}
        onValueChange={(v: string) => params.set({ sort: v === "newest" ? null : v })}
      >
        <SelectTrigger
          aria-label="Sort by"
          className="h-10 flex-1 justify-start gap-1.5 rounded-full px-4 font-medium sm:w-[220px] sm:flex-none [&>svg]:ml-auto"
        >
          <span className="text-subtle-foreground">Sort:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
