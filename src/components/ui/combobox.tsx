"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, type LucideIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComboboxOption = { value: string; label: string };

type ComboboxProps = {
  options: readonly ComboboxOption[];
  /** "" = nothing selected. */
  value: string;
  onValueChange: (value: string) => void;
  /** Shown when nothing is selected and no allLabel is given. */
  placeholder?: string;
  /** Adds a first row like "All provinces" that clears the value. */
  allLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Search box inside the list. Defaults to on for lists longer than 6. */
  searchable?: boolean;
  icon?: LucideIcon;
  size?: "default" | "lg";
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * shadcn Combobox (Popover + Command): a select with optional search.
 * Use instead of a native <select> anywhere in the app.
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  allLabel,
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  searchable = options.length > 6,
  icon: Icon,
  size = "default",
  id,
  "aria-label": ariaLabel,
  disabled,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const text = selected?.label ?? allLabel ?? placeholder;

  function choose(next: string) {
    onValueChange(next);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // Radix PopoverTrigger adds aria-controls at runtime.
          // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
          role="combobox"
          id={id}
          aria-label={ariaLabel}
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex w-full min-w-0 items-center gap-2.5 rounded-md border border-input bg-background px-3.5 text-left text-sm text-foreground transition-colors outline-none",
            "hover:border-subtle-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
            "disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/20",
            size === "lg" ? "h-[50px]" : "h-11",
            className,
          )}
        >
          {Icon ? <Icon className="size-4 shrink-0 text-subtle-foreground" aria-hidden /> : null}
          <span
            className={cn("flex-1 truncate", !selected && !allLabel && "text-subtle-foreground")}
          >
            {text}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-[220px] p-0">
        <Command>
          {searchable ? <CommandInput placeholder={searchPlaceholder} /> : null}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {allLabel ? (
                <CommandItem value={allLabel} onSelect={() => choose("")}>
                  <span className="flex-1">{allLabel}</span>
                  <CheckIcon className={cn("text-primary", value ? "opacity-0" : "opacity-100")} />
                </CommandItem>
              ) : null}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  keywords={[option.value]}
                  onSelect={() => choose(option.value === value && allLabel ? "" : option.value)}
                >
                  <span className="flex-1">{option.label}</span>
                  <CheckIcon
                    className={cn(
                      "text-primary",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export type { ComboboxOption, ComboboxProps };
