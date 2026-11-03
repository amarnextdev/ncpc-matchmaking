"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { signInAction } from "../actions";
import { signInSchema, type SignInValues } from "../schemas";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

type SignInFormProps = {
  /** Show the ready-made demo members (development, or DEMO_MODE=1). */
  demoEnabled: boolean;
  /** Same-site path to return to after signing in (already checked on the server). */
  next: string | null;
  /** Message from the page, e.g. an expired email link */
  notice?: string | null;
};

export function SignInForm({ demoEnabled, next, notice }: SignInFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = React.useState<string | null>(null);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: SignInValues) {
    setError(null);
    setUnconfirmed(null);
    // On success the action redirects (workspace, onboarding or pending page).
    const result = await signInAction(values, next);
    if (!result.ok) {
      if (result.needsVerification) setUnconfirmed(values.email);
      setError(result.error);
      form.setValue("password", "");
      form.setFocus("password");
    }
  }

  const demoNext = encodeURIComponent(next ?? routes.workspace.root);

  return (
    <section aria-labelledby="sign-in-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 id="sign-in-title" className="text-[28px] font-bold tracking-tight">
          Sign in
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Welcome back. Sign in to your organisation&rsquo;s workspace.
        </p>
      </div>

      {notice && !error ? <FormAlert tone="info">{notice}</FormAlert> : null}
      {error ? (
        <FormAlert>
          {error}
          {unconfirmed ? (
            <>
              {" "}
              <Link
                href={`${routes.auth.verifyEmail}?email=${encodeURIComponent(unconfirmed)}&resend=1`}
                className="font-semibold underline"
              >
                Get a new code
              </Link>
            </>
          ) : null}
        </FormAlert>
      ) : null}

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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-3">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href={routes.auth.forgotPassword}
                    className="text-[13px] font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Sign in
          </Button>
        </form>
      </Form>

      {demoEnabled ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <span aria-hidden className="h-px flex-1 bg-border" />
            or try a ready-made demo member
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Plain <a>: the route handler sets a cookie and redirects. */}
            <Button variant="outline" asChild>
              <a href={`/api/demo?as=investor&next=${demoNext}`}>Sunridge · investor</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/api/demo?as=owner&next=${demoNext}`}>GreenFuture · owner</a>
            </Button>
          </div>
        </div>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        New to NCPC Matchmaking?{" "}
        <Link href={routes.auth.register} className="font-semibold text-primary hover:underline">
          Register your organisation
        </Link>
      </p>
    </section>
  );
}
