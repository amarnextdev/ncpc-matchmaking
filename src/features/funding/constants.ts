/** Funding offer types, with the colour used for card banners, tabs and the detail header. */
export const FUNDING_TYPES = [
  { value: "grant", label: "Grant", plural: "Grants", tint: "#1F6E6A" },
  { value: "loan", label: "Loan", plural: "Loans", tint: "#2E5A9C" },
  { value: "equity", label: "Equity", plural: "Equity", tint: "#5B4A8F" },
  { value: "blended", label: "Blended", plural: "Blended", tint: "#41587A" },
  { value: "guarantee", label: "Guarantee", plural: "Guarantees", tint: "#8A5A12" },
] as const;

export type FundingType = (typeof FUNDING_TYPES)[number]["value"];

/** Amount filter (largest amount one project can get). */
export const FUNDING_AMOUNTS = [
  { value: "lt-1m", label: "Up to R1m", min: 0, max: 1_000_000 },
  { value: "1m-10m", label: "R1m – R10m", min: 1_000_000, max: 10_000_000 },
  { value: "10m-50m", label: "R10m – R50m", min: 10_000_000, max: 50_000_000 },
  { value: "gt-50m", label: "Over R50m", min: 50_000_000, max: Number.POSITIVE_INFINITY },
] as const;

export const FUNDING_DEADLINES = [
  { value: "soon", label: "Closing in 30 days" },
  { value: "rolling", label: "Rolling (no deadline)" },
] as const;

export const FUNDING_PAGE_SIZE = 12;

export function fundingType(value: FundingType) {
  return FUNDING_TYPES.find((t) => t.value === value) ?? FUNDING_TYPES[0];
}

export const APPROVED_LABEL = "Approved by NCPC: funder verified and offer terms checked";
