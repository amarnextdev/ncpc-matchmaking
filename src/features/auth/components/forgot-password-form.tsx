"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { routes } from "@/config/routes";
import { requestPasswordResetAction } from "../actions";
import { FormAlert } from "./form-alert";

const schema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Enter your email").email("Enter a valid email"),
});
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm({ expired }: { expired: boolean }) {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const submitting = form.formState.isSubmitting;

  async function onSubmit({ email }: Values) {
    setError(null);
    const result = await requestPasswordResetAction(email);
    if (result.ok) setSentTo(email);
    else if (result.field === "email") form.setError("email", { message: result.error });
    else setError(result.error);
  }

  if (sentTo) {
    return (
      <section aria-labelledby="forgot-title" className="flex flex-col gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft">
          <MailCheck className="size-7 text-primary" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h1 id="forgot-title" className="text-[28px] font-bold tracking-tight">
            Check your email
          </h1>
          <p className="text-[15px] leading-6 text-muted-foreground">
            If <strong className="text-foreground">{sentTo}</strong> has an account, we sent it a
            link to choose a new password. The link works once and expires in 1 hour.
          </p>
        </div>
        <Button size="lg" variant="outline" className="w-full" asChild>
          <Link href={routes.auth.signIn}>Back to sign in</Link>
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="forgot-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 id="forgot-title" className="text-[28px] font-bold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Enter your work email and we will send you a link to choose a new one.
        </p>
      </div>
      {expired ? (
        <FormAlert tone="info">
          That reset link has expired or was already used. Ask for a new one.
        </FormAlert>
      ) : null}
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
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
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Send reset link
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href={routes.auth.signIn} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
