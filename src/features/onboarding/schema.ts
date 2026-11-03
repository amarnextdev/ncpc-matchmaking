import { z } from "zod";
import {
  LOOKING_FOR,
  ORGANISATION_CATEGORIES,
  ORGANISATION_OFFERS,
  PROJECT_STAGES,
  PROVINCES,
  THEMES,
} from "@/lib/constants";
import { FUNDING_TYPES } from "@/features/funding/constants";
import { BBBEE_LEVELS, DESCRIPTION_MAX, SUMMARY_MAX, isCapitalProvider } from "./constants";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

/** CIPC numbers look like 2019/482117/07. */
const REG_NUMBER = /^\d{4}\/\d{6}\/\d{2}$/;

/** Rand amounts typed in millions, e.g. "5" or "12.5". */
const millions = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || (/^\d+(\.\d+)?$/.test(v) && Number(v) > 0),
    "Enter an amount in millions, like 5 or 12.5",
  );

const companyFields = {
  category: z.enum(values(ORGANISATION_CATEGORIES), {
    errorMap: () => ({ message: "Choose what best describes your organisation" }),
  }),
  companyName: z.string().trim().min(2, "Enter the registered company name").max(120),
  regNumber: z.string().trim().regex(REG_NUMBER, "Use the CIPC format, like 2019/482117/07"),
  province: z.enum(values(PROVINCES), { errorMap: () => ({ message: "Choose a province" }) }),
  town: z.string().trim().min(2, "Enter the town or city").max(80),
  website: z
    .string()
    .trim()
    .max(200)
    .refine(
      (v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/.test(v),
      "Enter a full web address, like https://company.co.za",
    ),
  bbbee: z.enum(BBBEE_LEVELS, { errorMap: () => ({ message: "Choose your B-BBEE level" }) }),
  description: z
    .string()
    .trim()
    .min(20, "Write at least one sentence (20 characters)")
    .max(DESCRIPTION_MAX, `Use ${DESCRIPTION_MAX} characters or fewer`),
};

const matchFields = {
  themes: z.array(z.enum(values(THEMES))).min(1, "Choose at least one theme"),
  offers: z.array(z.enum(values(ORGANISATION_OFFERS))),
  instruments: z.array(z.enum(values(FUNDING_TYPES))),
  stages: z.array(z.enum(values(PROJECT_STAGES))),
  lookingFor: z.array(z.enum(values(LOOKING_FOR))),
  amountMin: millions,
  amountMax: millions,
};

/** An uploaded file, already checked and saved by registerUploadAction(). */
export const fileRef = z.object({
  fileId: z.string().uuid(),
  name: z.string().max(255),
  /** Public images only */
  url: z.string().url().optional(),
});
export type FileRef = z.infer<typeof fileRef>;

const requiredDoc = (message: string) =>
  // An explicit boolean (not a type guard) keeps the form value type nullable.
  fileRef.nullable().refine((v): boolean => v !== null, { message });

const profileFields = {
  logo: fileRef.nullable(),
  banner: fileRef.nullable(),
  summary: z
    .string()
    .trim()
    .min(10, "Write a short summary (10 characters or more)")
    .max(SUMMARY_MAX, `Use ${SUMMARY_MAX} characters or fewer`),
};

const documentFields = {
  docs: z.object({
    cipc: requiredDoc("Upload your CIPC registration"),
    bbbee: requiredDoc("Upload your B-BBEE certificate or affidavit"),
    tax: requiredDoc("Upload your tax compliance status"),
  }),
};

const matchObject = z.object({ category: companyFields.category, ...matchFields });
type MatchInput = z.infer<typeof matchObject>;

/** Capital providers must say what they fund; everyone else what they offer and need. */
function checkMatchmaking(v: MatchInput, ctx: z.RefinementCtx) {
  if (isCapitalProvider(v.category)) {
    if (!v.instruments.length)
      ctx.addIssue({
        code: "custom",
        path: ["instruments"],
        message: "Choose at least one type of finance",
      });
    if (!v.stages.length)
      ctx.addIssue({
        code: "custom",
        path: ["stages"],
        message: "Choose at least one project stage",
      });
    if (!v.amountMin)
      ctx.addIssue({ code: "custom", path: ["amountMin"], message: "Enter the smallest amount" });
    if (!v.amountMax)
      ctx.addIssue({ code: "custom", path: ["amountMax"], message: "Enter the largest amount" });
    if (v.amountMin && v.amountMax && Number(v.amountMin) > Number(v.amountMax))
      ctx.addIssue({
        code: "custom",
        path: ["amountMax"],
        message: "The largest amount must be at least the smallest",
      });
  } else {
    if (!v.offers.length)
      ctx.addIssue({
        code: "custom",
        path: ["offers"],
        message: "Choose at least one thing you offer",
      });
    if (!v.lookingFor.length)
      ctx.addIssue({
        code: "custom",
        path: ["lookingFor"],
        message: "Choose at least one partner you are looking for",
      });
  }
}

/** One schema per step, used by Continue. */
export const STEP_SCHEMAS = [
  z.object(companyFields),
  matchObject.superRefine(checkMatchmaking),
  z.object(profileFields),
  z.object(documentFields),
] as const;

/** The whole form, checked again on submit. */
export const onboardingSchema = z
  .object({ ...companyFields, ...matchFields, ...profileFields, ...documentFields })
  .superRefine(checkMatchmaking);

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const ONBOARDING_DEFAULTS: Partial<OnboardingValues> = {
  companyName: "",
  regNumber: "",
  town: "",
  website: "",
  description: "",
  themes: [],
  offers: [],
  instruments: [],
  stages: [],
  lookingFor: [],
  amountMin: "",
  amountMax: "",
  summary: "",
  logo: null,
  banner: null,
  docs: { cipc: null, bbbee: null, tax: null },
};

/**
 * A draft may be half filled: only types and lengths are checked, never "required".
 * Unknown keys are dropped, so nothing else can be stored.
 */
const optionalText = (max: number) => z.string().max(max).optional();
export const draftSchema = z
  .object({
    category: z.enum(values(ORGANISATION_CATEGORIES)).optional(),
    companyName: optionalText(120),
    regNumber: optionalText(40),
    province: z.enum(values(PROVINCES)).optional(),
    town: optionalText(80),
    website: optionalText(200),
    bbbee: z.enum(BBBEE_LEVELS).optional(),
    description: optionalText(DESCRIPTION_MAX),
    themes: z
      .array(z.enum(values(THEMES)))
      .max(10)
      .optional(),
    offers: z
      .array(z.enum(values(ORGANISATION_OFFERS)))
      .max(10)
      .optional(),
    instruments: z
      .array(z.enum(values(FUNDING_TYPES)))
      .max(10)
      .optional(),
    stages: z
      .array(z.enum(values(PROJECT_STAGES)))
      .max(10)
      .optional(),
    lookingFor: z
      .array(z.enum(values(LOOKING_FOR)))
      .max(10)
      .optional(),
    amountMin: optionalText(20),
    amountMax: optionalText(20),
    logo: fileRef.nullable().optional(),
    banner: fileRef.nullable().optional(),
    summary: optionalText(SUMMARY_MAX),
    docs: z
      .object({
        cipc: fileRef.nullable().optional(),
        bbbee: fileRef.nullable().optional(),
        tax: fileRef.nullable().optional(),
      })
      .optional(),
  })
  .strip();
export type DraftValues = z.infer<typeof draftSchema>;
