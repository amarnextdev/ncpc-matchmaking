"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LOOKING_FOR, ORGANISATION_OFFERS, PROJECT_STAGES, THEMES } from "@/lib/constants";
import { FUNDING_TYPES } from "@/features/funding/constants";
import { CATEGORY_CARDS, isCapitalProvider } from "../constants";
import type { OnboardingValues } from "../schema";
import { ChipGroup } from "./chip-group";

const NON_CAPITAL_OFFERS = ORGANISATION_OFFERS.filter((o) => o.value !== "capital");

export function StepMatchmaking() {
  const { control } = useFormContext<OnboardingValues>();
  const category = useWatch({ control, name: "category" });
  const card = CATEGORY_CARDS.find((c) => c.value === category);
  const capital = isCapitalProvider(category);

  return (
    <>
      {card ? (
        <p className="rounded-xl bg-primary-soft px-3.5 py-3 text-[13px] leading-5 text-primary">
          As <strong>{card.label}</strong> we match you with {card.matchesWith}.
        </p>
      ) : null}

      <ChipGroup name="themes" label="Themes you work in" options={THEMES} />

      {capital ? (
        <>
          <ChipGroup
            name="instruments"
            label="Types of finance you offer"
            options={FUNDING_TYPES}
          />
          <ChipGroup name="stages" label="Project stages you fund" options={PROJECT_STAGES} />
          <div role="group" aria-labelledby="amount-label" className="flex flex-col gap-2.5">
            <p id="amount-label" className="text-sm font-semibold">
              Amount per project{" "}
              <span className="font-normal text-muted-foreground">(R million)</span>
            </p>
            <div className="grid max-w-md grid-cols-2 gap-3">
              {(["amountMin", "amountMax"] as const).map((name) => (
                <FormField
                  key={name}
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-muted-foreground">
                        {name === "amountMin" ? "From" : "To"}
                      </FormLabel>
                      <div className="relative">
                        <span
                          aria-hidden
                          className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground"
                        >
                          R
                        </span>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            placeholder={name === "amountMin" ? "5" : "30"}
                            className="px-8"
                            {...field}
                          />
                        </FormControl>
                        <span
                          aria-hidden
                          className="absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-muted-foreground"
                        >
                          m
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <ChipGroup name="offers" label="What you offer" options={NON_CAPITAL_OFFERS} />
          <ChipGroup name="lookingFor" label="What you are looking for" options={LOOKING_FOR} />
        </>
      )}
    </>
  );
}
