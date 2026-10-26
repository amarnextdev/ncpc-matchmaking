"use client";

import { useState } from "react";
import type * as React from "react";
import { Banknote, Layers, Search } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { THEMES } from "@/lib/constants";
import { FUNDING_AMOUNTS } from "../constants";
import { useFundingParams } from "../use-funding-params";

const POPULAR = ["Solar loans", "Energy efficiency grant", "Water reuse", "Green hydrogen", "SME"];

/** Search card overlapping the bottom of the navy hero. */
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
    <Container className="relative -mt-11">
      <form
        role="search"
        aria-label="Search funding"
        onSubmit={submit}
        className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-overlay"
      >
        <div className="flex flex-wrap gap-3">
          <div className="relative flex flex-[3_1_300px] items-center">
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
              className="h-[50px] pl-11"
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
            className="flex-[1_1_190px]"
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
