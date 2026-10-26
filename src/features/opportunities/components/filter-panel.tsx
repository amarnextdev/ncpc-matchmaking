"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CAPITAL_RANGES, PROVINCES } from "@/lib/constants";
import type { FacetCount } from "../types";
import { useOpportunityParams } from "../use-opportunity-params";

type Facets = {
  themes: FacetCount<string>[];
  lookingFor: FacetCount<string>[];
  stages: FacetCount<string>[];
};

const CHECK_GROUPS = [
  { key: "theme", title: "Theme", facet: "themes" },
  { key: "lookingFor", title: "Looking for", facet: "lookingFor" },
  { key: "stage", title: "Stage", facet: "stages" },
] as const;

const RADIO_GROUPS = [
  { key: "province", title: "Province", anyLabel: "All provinces", options: PROVINCES },
  { key: "capital", title: "Capital needed", anyLabel: "Any amount", options: CAPITAL_RANGES },
] as const;

const ANY = "__any";

/**
 * Filter groups as an accordion: Theme open by default, the rest closed
 * (a group that already has a filter applied also starts open).
 * Used in the desktop sidebar and in the mobile bottom sheet.
 */
export function FilterPanel({ facets }: { facets: Facets }) {
  const params = useOpportunityParams();

  const defaultOpen = [
    "theme",
    ...CHECK_GROUPS.filter((g) => g.key !== "theme" && params.getList(g.key).length).map(
      (g) => g.key,
    ),
    ...RADIO_GROUPS.filter((g) => params.get(g.key)).map((g) => g.key),
  ];

  return (
    <Accordion type="multiple" defaultValue={defaultOpen}>
      {CHECK_GROUPS.map((group) => {
        const selected = params.getList(group.key);
        return (
          <AccordionItem key={group.key} value={group.key} className="border-muted">
            <AccordionTrigger>
              <GroupTitle title={group.title} count={selected.length} />
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-1">
              {facets[group.facet].map((option) => {
                const id = `f-${group.key}-${option.value}`;
                return (
                  <label
                    key={option.value}
                    htmlFor={id}
                    className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-muted"
                  >
                    <Checkbox
                      id={id}
                      checked={selected.includes(option.value)}
                      onCheckedChange={() => params.toggle(group.key, option.value)}
                    />
                    <span className="flex-1 text-foreground">{option.label}</span>
                    <span className="text-xs text-subtle-foreground">{option.count}</span>
                  </label>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        );
      })}

      {RADIO_GROUPS.map((group) => {
        const value = params.get(group.key);
        return (
          <AccordionItem key={group.key} value={group.key} className="border-muted">
            <AccordionTrigger>
              <GroupTitle title={group.title} count={value ? 1 : 0} />
            </AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={value || ANY}
                onValueChange={(v: string) => params.set({ [group.key]: v === ANY ? null : v })}
                className="gap-1"
                aria-label={group.title}
              >
                {[{ value: ANY, label: group.anyLabel }, ...group.options].map((option) => {
                  const id = `f-${group.key}-${option.value}`;
                  return (
                    <label
                      key={option.value}
                      htmlFor={id}
                      className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-muted"
                    >
                      <RadioGroupItem id={id} value={option.value} />
                      <span className="text-foreground">{option.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function GroupTitle({ title, count }: { title: string; count: number }) {
  return (
    <span className="flex items-center gap-2">
      {title}
      {count ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
          {count}
        </span>
      ) : null}
    </span>
  );
}

export type { Facets };
