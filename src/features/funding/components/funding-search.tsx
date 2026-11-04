"use client";

import { useState } from "react";
import type * as React from "react";
import { Banknote, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { THEMES } from "@/lib/constants";
import { FUNDING_AMOUNTS } from "../constants";
import { useFundingParams } from "../use-funding-params";

/** Search bar inside the Explore hero: keywords · two quick filters · Search. */
export function FundingSearch() {
  const params = useFundingParams();
  const [q, setQ] = useState(params.get("q"));
  const [theme, setTheme] = useState(params.getList("theme")[0] ?? "");
  const [amount, setAmount] = useState(params.get("amount"));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    params.set({ q: q.trim() || null, theme: theme || null, amount: amount || null });
  }

  return (
    <form
      role="search"
      aria-label="Search funding"
      onSubmit={submit}
      className="rounded-2xl bg-card p-2 shadow-overlay ring-ring/30 transition-shadow focus-within:ring-[3px]"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0">
        <div className="relative flex items-center md:flex-[3_1_0%]">
          <Search
            className="pointer-events-none absolute left-4 size-[18px] text-subtle-foreground"
            aria-hidden
          />
          <label htmlFor="funding-q" className="sr-only">
            Search funding offers
          </label>
          <Input
            id="funding-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Offer, funder or keyword"
            className="h-[52px] rounded-xl border-0 bg-muted/60 pl-11 shadow-none focus-visible:ring-0 md:rounded-none md:bg-transparent"
          />
        </div>
        <Combobox
          aria-label="Theme"
          size="lg"
          icon={Layers}
          options={THEMES}
          allLabel="All themes"
          searchable={false}
          value={theme}
          onValueChange={setTheme}
          className="h-[52px] rounded-xl border-0 bg-muted/60 shadow-none md:flex-[1_1_0%] md:rounded-none md:border-l md:bg-transparent"
        />
        <Combobox
          aria-label="Amount"
          size="lg"
          icon={Banknote}
          options={FUNDING_AMOUNTS}
          allLabel="Any amount"
          searchable={false}
          value={amount}
          onValueChange={setAmount}
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
