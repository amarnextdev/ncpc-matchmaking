"use client";

import { useState } from "react";
import type * as React from "react";
import { Briefcase, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { PROVINCES } from "@/lib/constants";
import { ORGANISATION_TABS } from "../constants";
import { useOrganisationParams } from "../use-organisation-params";

/** Search bar inside the Explore hero: keywords · two quick filters · Search. */
export function OrganisationSearch() {
  const params = useOrganisationParams();
  const [q, setQ] = useState(params.get("q"));
  const [tab, setTab] = useState(params.get("tab"));
  const [province, setProvince] = useState(params.get("province"));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    params.set({ q: q.trim() || null, tab: tab || null, province: province || null });
  }

  return (
    <form
      role="search"
      aria-label="Search organisations"
      onSubmit={submit}
      className="rounded-2xl bg-card p-2 shadow-overlay ring-ring/30 transition-shadow focus-within:ring-[3px]"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
        <div className="relative flex items-center md:flex-[3_1_0%]">
          <Search
            className="pointer-events-none absolute left-4 size-[18px] text-subtle-foreground"
            aria-hidden
          />
          <label htmlFor="organisation-q" className="sr-only">
            Search organisations
          </label>
          <Input
            id="organisation-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Organisation name, technology or service"
            className="h-[52px] rounded-xl border-0 bg-muted/60 pl-11 shadow-none focus-visible:ring-0 md:rounded-none md:bg-transparent"
          />
        </div>
        <Combobox
          aria-label="Category"
          size="lg"
          icon={Briefcase}
          options={ORGANISATION_TABS}
          allLabel="All categories"
          value={tab}
          onValueChange={setTab}
          className="h-[52px] rounded-xl border-0 bg-muted/60 shadow-none md:flex-[1_1_0%] md:rounded-none md:border-l md:bg-transparent"
        />
        <Combobox
          aria-label="Province"
          size="lg"
          icon={MapPin}
          options={PROVINCES}
          allLabel="All provinces"
          searchPlaceholder="Search province…"
          value={province}
          onValueChange={setProvince}
          className="h-[52px] rounded-xl border-0 bg-muted/60 shadow-none md:flex-[1_1_0%] md:rounded-none md:border-l md:bg-transparent"
        />
        <Button
          type="submit"
          size="lg"
          className="h-12 rounded-full px-8 md:ml-2"
          disabled={params.isPending}
        >
          Search
        </Button>
      </div>
    </form>
  );
}
