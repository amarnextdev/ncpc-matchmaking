"use client";

import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; count?: number };

type FilterDropdownProps = {
  label: string;
  options: readonly Option[];
  selected: string[];
  /** true = checkboxes (pick many), false = radio list (pick one). */
  multiple?: boolean;
  /** Label of the "no filter" row in single-choice lists, e.g. "All provinces". */
  anyLabel?: string;
  onToggle: (value: string) => void;
  onClear: () => void;
};

/** Pill button ("Theme · 2 ▾") that opens a small list of options. Changes apply instantly. */
export function FilterDropdown({
  label,
  options,
  selected,
  multiple = true,
  anyLabel = "Any",
  onToggle,
  onClear,
}: FilterDropdownProps) {
  const active = selected.length > 0;
  const triggerText = !active
    ? label
    : multiple
      ? `${label} · ${selected.length}`
      : (options.find((o) => o.value === selected[0])?.label ?? label);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
          "focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-none data-[state=open]:border-primary",
          active
            ? "border-primary/30 bg-primary-soft text-primary"
            : "border-input bg-background text-foreground hover:border-subtle-foreground",
        )}
      >
        {triggerText}
        <ChevronDown className="size-4 opacity-70" aria-hidden />
      </PopoverTrigger>

      <PopoverContent aria-label={`${label} filter`}>
        <div className="flex max-h-80 flex-col overflow-y-auto">
          {!multiple ? (
            <OptionRow type="radio" name={label} checked={!active} label={anyLabel} onChange={onClear} />
          ) : null}
          {options.map((option) => (
            <OptionRow
              key={option.value}
              type={multiple ? "checkbox" : "radio"}
              name={label}
              checked={selected.includes(option.value)}
              label={option.label}
              count={option.count}
              onChange={() => onToggle(option.value)}
            />
          ))}
        </div>
        {multiple && active ? (
          <div className="mt-1 border-t px-2 pt-2">
            <button type="button" onClick={onClear} className="text-[13px] font-semibold text-primary hover:underline">
              Clear {label.toLowerCase()}
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function OptionRow({
  type,
  name,
  checked,
  label,
  count,
  onChange,
}: {
  type: "checkbox" | "radio";
  name: string;
  checked: boolean;
  label: string;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-2 text-sm hover:bg-muted">
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-4 accent-primary" />
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-xs text-subtle-foreground">{count}</span> : null}
    </label>
  );
}
