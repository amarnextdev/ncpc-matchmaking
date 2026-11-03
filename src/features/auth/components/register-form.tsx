"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { routes } from "@/config/routes";
import { registerAction } from "../actions";
import { PASSWORD_MIN } from "../constants";
import { registerSchema, type RegisterValues } from "../schemas";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

/** Step 1 of 2: the person's account. Step 2 (onboarding) adds the organisation. */
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: RegisterValues) {
    setError(null);
    const result = await registerAction(values);
    if (result.ok) {
      // Next: the 6-digit code from the email
      router.push(
        `${routes.auth.verifyEmail}?email=${encodeURIComponent(values.email.trim().toLowerCase())}`,
      );
      return;
    }
    if (result.field) form.setError(result.field, { message: result.error });
    else setError(result.error);
  }

  return (
    <section aria-labelledby="register-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-muted-foreground">
          Step 1 of 2 · Your account
        </span>
        <h1 id="register-title" className="text-[28px] font-bold tracking-tight">
          Register your organisation
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Free for every South African organisation. We email you a code to confirm your address,
          then you add your company details for NCPC to verify.
        </p>
      </div>

      {error ? <FormAlert>{error}</FormAlert> : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder="Lerato Mokoena"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@company.co.za"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Use your company email. Personal addresses slow down verification.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder={`At least ${PASSWORD_MIN} characters, letters and numbers`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <FormLabel className="text-[13px] leading-5 font-normal text-foreground/80">
                    <span>
                      I agree to the{" "}
                      <Link
                        href={routes.terms}
                        className="font-semibold text-primary hover:underline"
                      >
                        Terms of use
                      </Link>{" "}
                      and{" "}
                      <Link
                        href={routes.privacy}
                        className="font-semibold text-primary hover:underline"
                      >
                        Privacy policy
                      </Link>
                      .
                    </span>
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Create account
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href={routes.auth.signIn} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
