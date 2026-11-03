import { z } from "zod";
import { NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from "./constants";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email")
  .max(254, "That email is too long")
  .email("Enter a valid email, like name@company.co.za");

/** Matches Supabase → Auth → Email: minimum length + "Letters and digits". */
export const newPassword = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters`)
  .max(PASSWORD_MAX, `Use ${PASSWORD_MAX} characters or fewer`)
  .regex(/[A-Za-z]/, "Add at least one letter")
  .regex(/\d/, "Add at least one number");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(NAME_MAX, `Use ${NAME_MAX} characters or fewer`),
  email,
  password: newPassword,
  terms: z.boolean().refine((v) => v, "Accept the terms of use and privacy policy to continue"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(PASSWORD_MAX),
});
export type SignInValues = z.infer<typeof signInSchema>;
