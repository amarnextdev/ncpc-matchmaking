"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updatePasswordAction } from "../actions";
import { PASSWORD_MIN } from "../constants";
import { newPassword } from "../schemas";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

const schema = z
  .object({
    password: newPassword,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The passwords don't match",
  });
type Values = z.infer<typeof schema>;

export function ResetPasswordForm({ email }: { email: string }) {
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit({ password }: Values) {
    setError(null);
    // On success the action redirects to the person's workspace or onboarding.
    const result = await updatePasswordAction(password);
    if (!result.ok) {
      if (result.field === "password") form.setError("password", { message: result.error });
      else setError(result.error);
    }
  }

  return (
    <section aria-labelledby="reset-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 id="reset-title" className="text-[28px] font-bold tracking-tight">
          Choose a new password
        </h1>
        <p className="text-[15px] text-muted-foreground">
          For <strong className="text-foreground">{email}</strong>.
        </p>
      </div>
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {/* Helps password managers save the new password against the right account */}
          <input
            type="email"
            name="username"
            autoComplete="username"
            value={email}
            readOnly
            hidden
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormDescription>
                  At least {PASSWORD_MIN} characters, with letters and numbers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type it again</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Save new password
          </Button>
        </form>
      </Form>
    </section>
  );
}
