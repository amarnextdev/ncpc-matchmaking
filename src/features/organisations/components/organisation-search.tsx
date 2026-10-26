"use client";

import { useState } from "react";
import type * as React from "react";
import { Briefcase, MapPin, Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { PROVINCES } from "@/lib/constants";
import { ORGANISATION_TABS } from "../constants";
import { useOrganisationParams } from "../use-organisation-params";

const POPULAR = ["Impact investors", "Solar EPC", "Water treatment", "Industrial parks", "ESCO"];

/** Search card overlapping the bottom of the navy hero. */
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
    <Container className="relative -mt-11">
      <form
        role="search"
        aria-label="Search organisations"
        onSubmit={submit}
        className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-overlay"
      >
        <div className="flex flex-wrap gap-3">
          <div className="relative flex flex-[3_1_300px] items-center">
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
              className="h-[50px] pl-11"
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
            className="flex-[1_1_190px]"
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
            className="flex-[1_1_190px]"
          />
          <Button type="submit" size="lg" className="h-[50px] px-8" disabled={params.isPending}>
            Search
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-muted pt-3.5">
          <span className="mr-1 text-[13px] text-subtle-foreground">Popular searches:</span>
          {POPULAR.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQ(term);
                params.set({ q: term });
              }}
              className="rounded-sm bg-muted px-3 py-1.5 text-[13px] font-medium text-foreground/80 hover:bg-primary-soft hover:text-primary"
            >
              {term}
            </button>
          ))}
        </div>
      </form>
    </Container>
  );
}
