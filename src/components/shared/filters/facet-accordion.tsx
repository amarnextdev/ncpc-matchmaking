"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Option = { value: string; label: string; count?: number };

export type FacetGroup =
  | { kind: "checkbox"; key: string; title: string; options: readonly Option[] }
  | { kind: "radio"; key: string; title: string; anyLabel: string; options: readonly Option[] };

type FacetAccordionProps = {
  groups: FacetGroup[];
  /** Group keys open on first render (groups with an active filter are added automatically). */
  defaultOpen?: string[];
  getList: (key: string) => string[];
  get: (key: string) => string;
  onToggle: (key: string, value: string) => void;
  onSelect: (key: string, value: string | null) => void;
};

const ANY = "__any";

/**
 * Config-driven filter groups in an accordion (checkbox lists with counts, or single-choice radio lists).
 * Used by list pages (Organisations, later Funding). The parent owns the URL state.
 */
export function FacetAccordion({
  groups,
  defaultOpen = [],
  getList,
  get,
  onToggle,
  onSelect,
}: FacetAccordionProps) {
  const active = groups
    .filter((g) => (g.kind === "checkbox" ? getList(g.key).length > 0 : Boolean(get(g.key))))
    .map((g) => g.key);

  return (
    <Accordion type="multiple" defaultValue={[...new Set([...defaultOpen, ...active])]}>
      {groups.map((group) => {
        const count =
          group.kind === "checkbox" ? getList(group.key).length : get(group.key) ? 1 : 0;
        return (
          <AccordionItem key={group.key} value={group.key} className="border-muted">
            <AccordionTrigger>
              <span className="flex items-center gap-2">
                {group.title}
                {count ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {count}
                  </span>
                ) : null}
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-1">
              {group.kind === "checkbox" ? (
                group.options.map((option) => {
                  const id = `facet-${group.key}-${option.value}`;
                  return (
                    <label
                      key={option.value}
                      htmlFor={id}
                      className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-muted"
                    >
                      <Checkbox
                        id={id}
                        checked={getList(group.key).includes(option.value)}
                        onCheckedChange={() => onToggle(group.key, option.value)}
                      />
                      <span className="flex-1 text-foreground">{option.label}</span>
                      {option.count !== undefined ? (
                        <span className="text-xs text-subtle-foreground">{option.count}</span>
                      ) : null}
                    </label>
                  );
                })
              ) : (
                <RadioGroup
                  value={get(group.key) || ANY}
                  onValueChange={(v: string) => onSelect(group.key, v === ANY ? null : v)}
                  className="gap-1"
                  aria-label={group.title}
                >
                  {[{ value: ANY, label: group.anyLabel }, ...group.options].map((option) => {
                    const id = `facet-${group.key}-${option.value}`;
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
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
