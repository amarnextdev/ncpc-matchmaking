import { z } from "zod";
import { LOOKING_FOR, PROJECT_STAGES, PROVINCES, THEMES } from "@/lib/constants";
import { fileRef } from "@/features/onboarding/schema";
import {
  ABOUT_MAX,
  CAPITAL_ROLES,
  DOCUMENTS_MAX,
  PHOTOS_MAX,
  SUMMARY_MAX,
  TITLE_MAX,
} from "./constants";

export { fileRef, type FileRef } from "@/features/onboarding/schema";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((i) => i.value) as [T[number]["value"], ...T[number]["value"][]];

/** Whole numbers typed with or without separators: "10 000 000", "10,000,000". */
export const toNumber = (v: string) => (v.trim() ? Number(v.replace(/[\s,]/g, "")) : null);
const wholeNumber = (label: string) =>
  z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^\d[\d\s,]*$/.test(v), `Enter ${label} as a whole number`);

export const projectDocument = fileRef.extend({
  visibility: z.enum(["public", "members_after_enquiry"]),
});
export type ProjectDocumentRef = z.infer<typeof projectDocument>;

const basicsFields = {
  title: z.string().trim().min(5, "Give the project a name (5 characters or more)").max(TITLE_MAX),
  theme: z.enum(values(THEMES), { errorMap: () => ({ message: "Choose a theme" }) }),
  province: z.enum(values(PROVINCES), { errorMap: () => ({ message: "Choose a province" }) }),
  city: z.string().trim().min(2, "Enter the town or city").max(80),
  summary: z
    .string()
    .trim()
    .min(20, "Write one short sentence (20 characters or more)")
    .max(SUMMARY_MAX, `Use ${SUMMARY_MAX} characters or fewer`),
};

const needsFields = {
  needs: z.array(z.enum(values(LOOKING_FOR))).min(1, "Choose at least one partner you need"),
  capitalNeeded: wholeNumber("the amount"),
  ownFunds: wholeNumber("the amount"),
  stage: z.enum(values(PROJECT_STAGES), { errorMap: () => ({ message: "Choose a stage" }) }),
};

const detailsFields = {
  description: z
    .string()
    .trim()
    .min(50, "Tell partners a little more (50 characters or more)")
    .max(ABOUT_MAX, `Use ${ABOUT_MAX} characters or fewer`),
  impactCo2: wholeNumber("tonnes"),
  impactMwh: wholeNumber("MWh"),
  impactJobs: wholeNumber("jobs"),
  impactWater: wholeNumber("m³"),
  /** "2027-03" from a month picker */
  expectedStart: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{4}-(0[1-9]|1[0-2])$/.test(v), "Choose a month"),
};

const mediaFields = {
  photos: z
    .array(fileRef)
    .min(1, "Add at least one photo. The first one is the cover.")
    .max(PHOTOS_MAX, `Add ${PHOTOS_MAX} photos or fewer`),
  documents: z.array(projectDocument).max(DOCUMENTS_MAX, `Add ${DOCUMENTS_MAX} documents or fewer`),
};

const needsObject = z.object(needsFields);
function checkCapital(v: z.infer<typeof needsObject>, ctx: z.RefinementCtx) {
  const needed = toNumber(v.capitalNeeded);
  const own = toNumber(v.ownFunds) ?? 0;
  if (v.needs.some((n) => CAPITAL_ROLES.includes(n)) && !needed) {
    ctx.addIssue({
      code: "custom",
      path: ["capitalNeeded"],
      message: "Enter how much capital you need from investors or funders",
    });
  }
  if (needed !== null && own > needed) {
    ctx.addIssue({
      code: "custom",
      path: ["ownFunds"],
      message: "This can't be more than the total capital needed",
    });
  }
}

/** One schema per step (Continue checks only the current one). The last step has none. */
export const PROJECT_STEP_SCHEMAS = [
  z.object(basicsFields),
  needsObject.superRefine(checkCapital),
  z.object(detailsFields),
  z.object(mediaFields),
] as const;

/** Everything, checked again on submit. */
export const projectSchema = z
  .object({
    ...basicsFields,
    ...needsFields,
    ...detailsFields,
    ...mediaFields,
    confirm: z.literal(true, {
      errorMap: () => ({ message: "Confirm the information is correct" }),
    }),
  })
  .superRefine(checkCapital);
export type ProjectValues = z.infer<typeof projectSchema>;

export const PROJECT_DEFAULTS = {
  title: "",
  city: "",
  summary: "",
  needs: [],
  capitalNeeded: "",
  ownFunds: "",
  description: "",
  impactCo2: "",
  impactMwh: "",
  impactJobs: "",
  impactWater: "",
  expectedStart: "",
  photos: [],
  documents: [],
} satisfies Partial<ProjectValues>;

/** A draft may be half filled: only types and lengths are checked. Unknown keys are dropped. */
const text = (max: number) => z.string().max(max).optional();
export const projectDraftSchema = z
  .object({
    title: text(TITLE_MAX),
    theme: z.enum(values(THEMES)).optional(),
    province: z.enum(values(PROVINCES)).optional(),
    city: text(80),
    summary: text(SUMMARY_MAX),
    needs: z
      .array(z.enum(values(LOOKING_FOR)))
      .max(10)
      .optional(),
    capitalNeeded: text(20),
    ownFunds: text(20),
    stage: z.enum(values(PROJECT_STAGES)).optional(),
    description: text(ABOUT_MAX),
    impactCo2: text(20),
    impactMwh: text(20),
    impactJobs: text(20),
    impactWater: text(20),
    expectedStart: text(7),
    photos: z.array(fileRef).max(PHOTOS_MAX).optional(),
    documents: z.array(projectDocument).max(DOCUMENTS_MAX).optional(),
  })
  .strip();
export type ProjectDraftValues = z.infer<typeof projectDraftSchema>;
