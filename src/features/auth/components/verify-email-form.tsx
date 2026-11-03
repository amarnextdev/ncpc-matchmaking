"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { resendConfirmationAction, verifyEmailCodeAction } from "../actions";
import { OTP_LENGTH, RESEND_COOLDOWN } from "../constants";
import { FormAlert } from "./form-alert";
import { OtpInput } from "./otp-input";

type VerifyEmailFormProps = {
  email: string;
  /** Send a fresh code as soon as the page opens (e.g. coming from sign in) */
  sendOnOpen?: boolean;
};

/** Step between register and onboarding: the 6-digit code from the email. */
export function VerifyEmailForm({ email, sendOnOpen = false }: VerifyEmailFormProps) {
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [verifying, startVerify] = React.useTransition();
  const [cooldown, setCooldown] = React.useState(sendOnOpen ? 0 : RESEND_COOLDOWN);
  const [sending, setSending] = React.useState(false);
  const sentOnOpen = React.useRef(false);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const resend = React.useCallback(async () => {
    setSending(true);
    setError(null);
    const result = await resendConfirmationAction(email);
    setSending(false);
    if (result.ok) {
      setInfo("We sent a new code. It replaces the old one.");
      setCode("");
      setCooldown(RESEND_COOLDOWN);
    } else setError(result.error);
  }, [email]);

  React.useEffect(() => {
    if (sendOnOpen && !sentOnOpen.current) {
      sentOnOpen.current = true;
      void resend();
    }
  }, [sendOnOpen, resend]);

  function verify(value: string) {
    if (value.length !== OTP_LENGTH || verifying) return;
    setError(null);
    setInfo(null);
    startVerify(async () => {
      // On success the action redirects to onboarding.
      const result = await verifyEmailCodeAction(email, value);
      if (!result.ok) {
        setError(result.error);
        setCode("");
      }
    });
  }

  return (
    <section aria-labelledby="verify-title" className="flex flex-col gap-6">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft">
        <MailCheck className="size-7 text-primary" aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-muted-foreground">
          Step 1 of 2 · Confirm your email
        </span>
        <h1 id="verify-title" className="text-[28px] font-bold tracking-tight">
          Enter the code
        </h1>
        <p id="verify-help" className="text-[15px] leading-6 text-muted-foreground">
          We sent a {OTP_LENGTH}-digit code to <strong className="text-foreground">{email}</strong>.
          It expires in 10 minutes.
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
        <span id="code-label" className="sr-only">
          Verification code
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
          labelledBy="code-label"
          describedBy="verify-help"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={verifying || code.length !== OTP_LENGTH}
        >
          {verifying ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Confirm email
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
          <Link href={routes.auth.register} className="font-semibold text-primary hover:underline">
            Register again
          </Link>
        </p>
      </div>
    </section>
  );
}
