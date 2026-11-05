import { z } from "zod";
import type { LookingFor } from "@/lib/constants";

/**
 * What a partner fills in when the project owner sends a collaboration request.
 * One list of fields per role; the same definition renders the form, checks it (Zod)
 * and shows the summary the owner reviews.
 */
export type OfferField =
  | { key: string; label: string; kind: "money"; required?: boolean; help?: string }
  | {
      key: string;
      label: string;
      kind: "text" | "textarea" | "month";
      required?: boolean;
      help?: string;
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      kind: "choice";
      options: { value: string; label: string }[];
      required?: boolean;
    }
  | { key: string; label: string; kind: "multi"; options: { value: string; label: string }[] };

const conditions = (extra: { value: string; label: string }[] = []) => ({
  key: "conditions",
  label: "Conditions",
  kind: "multi" as const,
  options: [
    { value: "due_diligence", label: "Due diligence completed" },
    { value: "committee", label: "Investment or credit committee approval" },
    ...extra,
  ],
});

export const OFFER_FIELDS: Record<LookingFor, OfferField[]> = {
  investor: [
    { key: "amount", label: "Amount", kind: "money", required: true },
    {
      key: "instrument",
      label: "Instrument",
      kind: "choice",
      required: true,
      options: [
        { value: "equity", label: "Equity" },
        { value: "debt", label: "Debt" },
        { value: "mezzanine", label: "Mezzanine" },
        { value: "convertible", label: "Convertible" },
      ],
    },
    {
      key: "terms",
      label: "Key terms",
      kind: "textarea",
      required: true,
      placeholder: "Stake, tranches, board seat, return…",
    },
    conditions([{ value: "ppa", label: "Signed power purchase agreements" }]),
    { key: "close", label: "Expected close", kind: "month" },
  ],
  funder: [
    { key: "amount", label: "Amount", kind: "money", required: true },
    {
      key: "instrument",
      label: "Type of funding",
      kind: "choice",
      required: true,
      options: [
        { value: "grant", label: "Grant" },
        { value: "loan", label: "Loan" },
        { value: "guarantee", label: "Guarantee" },
        { value: "blended", label: "Blended" },
      ],
    },
    {
      key: "terms",
      label: "Key terms",
      kind: "textarea",
      required: true,
      placeholder: "Rate, tenor, repayment, reporting…",
    },
    conditions(),
    { key: "close", label: "Expected first payment", kind: "month" },
  ],
  technology: [
    {
      key: "scope",
      label: "What you will supply",
      kind: "textarea",
      required: true,
      placeholder: "Equipment, capacity, installation…",
    },
    {
      key: "price",
      label: "Price",
      kind: "money",
      help: "Optional. Leave empty if you will quote later.",
    },
    { key: "timeline", label: "Timeline", kind: "text", placeholder: "e.g. 12 weeks from order" },
    { key: "warranty", label: "Warranty and support", kind: "text" },
  ],
  contractor: [
    { key: "scope", label: "Work you will do", kind: "textarea", required: true },
    {
      key: "price",
      label: "Price",
      kind: "money",
      help: "Optional. Leave empty if you will quote later.",
    },
    { key: "timeline", label: "Timeline", kind: "text", placeholder: "e.g. 6 months" },
  ],
  site_host: [
    {
      key: "site",
      label: "Site",
      kind: "text",
      required: true,
      placeholder: "Name and address of the site or roof",
    },
    {
      key: "size",
      label: "Space available",
      kind: "text",
      required: true,
      placeholder: "e.g. 12 000 m² of roof",
    },
    {
      key: "terms",
      label: "Lease or hosting terms",
      kind: "textarea",
      placeholder: "Rent, length, who pays for what…",
    },
    { key: "from", label: "Available from", kind: "month" },
  ],
  off_taker: [
    {
      key: "volume",
      label: "What you will buy",
      kind: "text",
      required: true,
      placeholder: "e.g. 1.2 MW of solar power",
    },
    { key: "price", label: "Price", kind: "text", placeholder: "e.g. 15% below the grid tariff" },
    { key: "term", label: "Contract length", kind: "text", placeholder: "e.g. 15 years" },
    { key: "terms", label: "Other terms", kind: "textarea" },
  ],
};

/** Roles whose offer amount counts towards the project's capital raised. */
export const CAPITAL_OFFER_ROLES: LookingFor[] = ["investor", "funder"];

export type OfferValues = Record<string, string | string[]>;

const money = /^\d[\d\s,]*$/;

/** Zod schema for a role's form (built from the field list). */
export function offerSchema(role: LookingFor) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of OFFER_FIELDS[role]) {
    if (f.kind === "multi") {
      shape[f.key] = z
        .array(z.enum(f.options.map((o) => o.value) as [string, ...string[]]))
        .default([]);
      continue;
    }
    let s = z
      .string()
      .trim()
      .max(f.kind === "textarea" ? 2000 : 200);
    if (f.kind === "money")
      s = s.refine((v) => v === "" || money.test(v), `${f.label}: enter a whole number`) as never;
    if (f.kind === "month")
      s = s.refine(
        (v) => v === "" || /^\d{4}-(0[1-9]|1[0-2])$/.test(v),
        `${f.label}: choose a month`,
      ) as never;
    if (f.kind === "choice")
      s = s.refine(
        (v) => v === "" || f.options.some((o) => o.value === v),
        `${f.label}: choose an option`,
      ) as never;
    shape[f.key] =
      "required" in f && f.required
        ? s.refine((v) => v !== "", `${f.label} is required`)
        : s.default("");
  }
  return z.object(shape).strip();
}

export const moneyValue = (v: string | string[] | undefined) =>
  typeof v === "string" && v.trim() ? Number(v.replace(/[\s,]/g, "")) : null;

const monthFmt = new Intl.DateTimeFormat("en-ZA", { month: "long", year: "numeric" });

/** The submitted offer as label/value rows for the owner's review. */
export function offerSummary(role: LookingFor, values: OfferValues) {
  return OFFER_FIELDS[role]
    .map((f) => {
      const v = values[f.key];
      let text = "";
      if (f.kind === "multi")
        text = (Array.isArray(v) ? v : [])
          .map((x) => f.options.find((o) => o.value === x)?.label ?? x)
          .join(" · ");
      else if (typeof v === "string" && v) {
        if (f.kind === "money")
          text = `R${(moneyValue(v) ?? 0).toLocaleString("en-ZA").replace(/ | /g, " ")}`;
        else if (f.kind === "month") text = monthFmt.format(new Date(`${v}-01`));
        else if (f.kind === "choice") text = f.options.find((o) => o.value === v)?.label ?? v;
        else text = v;
      }
      return { label: f.label, value: text, strong: f.kind === "money" };
    })
    .filter((r) => r.value);
}
