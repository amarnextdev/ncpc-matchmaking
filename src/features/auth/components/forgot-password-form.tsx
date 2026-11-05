"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Loader2 } from "lucide-react";
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
import { requestPasswordResetAction, verifyResetCodeAction } from "../actions";
import { OTP_LENGTH, RESEND_COOLDOWN } from "../constants";
import { OtpInput } from "./otp-input";
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
    return <ResetCodeStep email={sentTo} onChangeEmail={() => setSentTo(null)} />;
  }

  return (
    <section aria-labelledby="forgot-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-muted-foreground">
          Step 1 of 3 · Your email
        </span>
        <h1 id="forgot-title" className="text-[28px] font-bold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-[15px] text-muted-foreground">
          Enter your work email and we will send you a 6-digit code to choose a new password.
        </p>
      </div>
      {expired ? (
        <FormAlert tone="info">
          That reset code has expired or was already used. Ask for a new one.
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
            Send code
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

/** Step 2: the code from the reset email. A right code opens "Choose a new password". */
function ResetCodeStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [verifying, startVerify] = React.useTransition();
  const [cooldown, setCooldown] = React.useState(RESEND_COOLDOWN);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    setSending(true);
    setError(null);
    const result = await requestPasswordResetAction(email);
    setSending(false);
    if (result.ok) {
      setInfo("We sent a new code. It replaces the old one.");
      setCode("");
      setCooldown(RESEND_COOLDOWN);
    } else setError(result.error);
  }

  function verify(value: string) {
    if (value.length !== OTP_LENGTH || verifying) return;
    setError(null);
    setInfo(null);
    startVerify(async () => {
      // On success the action redirects to "Choose a new password".
      const result = await verifyResetCodeAction(email, value);
      if (!result.ok) {
        setError(result.error);
        setCode("");
      }
    });
  }

  return (
    <section aria-labelledby="reset-code-title" className="flex flex-col gap-6">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft">
        <KeyRound className="size-7 text-primary" aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-muted-foreground">
          Step 2 of 3 · Confirm it&rsquo;s you
        </span>
        <h1 id="reset-code-title" className="text-[28px] font-bold tracking-tight">
          Enter the code
        </h1>
        <p id="reset-code-help" className="text-[15px] leading-6 text-muted-foreground">
          If <strong className="text-foreground">{email}</strong> has an account, we sent it a{" "}
          {OTP_LENGTH}-digit code. It expires in 1 hour.
        </p>
      </div>

      {error ? <FormAlert>{error}</FormAlert> : null}
      {info && !error ? <FormAlert tone="success">{info}</FormAlert> : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="flex flex-col gap-4"
      >
        <span id="reset-code-label" className="sr-only">
          Reset code
        </span>
        <OtpInput
          length={OTP_LENGTH}
          value={code}
          onChange={(v) => {
            setCode(v);
            if (error) setError(null);
          }}
          onComplete={verify}
          disabled={verifying}
          invalid={Boolean(error)}
          labelledBy="reset-code-label"
          describedBy="reset-code-help"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={verifying || code.length !== OTP_LENGTH}
        >
          {verifying ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Continue
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>
          Didn&rsquo;t get it? Check your spam folder, or{" "}
          {cooldown > 0 ? (
            <span>send a new code in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={() => void resend()}
              disabled={sending}
              className="font-semibold text-primary hover:underline disabled:opacity-60"
            >
              {sending ? "sending…" : "send a new code"}
            </button>
          )}
          .
        </p>
        <p>
          Wrong email?{" "}
          <button
            type="button"
            onClick={onChangeEmail}
            className="font-semibold text-primary hover:underline"
          >
            Change it
          </button>
        </p>
      </div>
    </section>
  );
}
