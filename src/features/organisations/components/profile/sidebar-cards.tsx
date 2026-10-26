import Link from "next/link";
import { ArrowRight, Check, Clock, Lock, MessageSquare, ShieldCheck } from "lucide-react";
import { EnquiryButton } from "@/components/shared/enquiry-button";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatDay, formatListed } from "@/lib/dates";
import type { Viewer } from "@/types";
import { isNewMember } from "../../constants";
import type { OrganisationDetail } from "../../types";

/** Primary (navy) card: match score + reasons for members, sign-in prompt for visitors. */
export function MatchCard({
  organisation: o,
  viewer,
}: {
  organisation: OrganisationDetail;
  viewer: Viewer;
}) {
  const returnTo = routes.organisations.detail(o.slug);
  return (
    <section
      aria-label="Match and actions"
      className="flex flex-col gap-4 rounded-lg bg-primary p-6 text-primary-foreground shadow-[0_16px_40px_rgb(19_51_107/0.28)]"
    >
      {viewer.signedIn && o.match ? (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold tracking-[0.08em] text-[#B9C7DD] uppercase">
              Your match
            </span>
            <span className="text-4xl font-bold tracking-tight">{o.match.score}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Match score"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={o.match.score}
            className="h-2 overflow-hidden rounded-full bg-white/20"
          >
            <div className="h-full rounded-full bg-white" style={{ width: `${o.match.score}%` }} />
          </div>
          <ul className="flex flex-col gap-2">
            {o.match.reasons.map((reason) => (
              <li key={reason} className="flex gap-2 text-[13px] leading-[19px] text-[#D6E0F0]">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-[#9BD27A]"
                  strokeWidth={2.5}
                  aria-hidden
                />
                {reason}
              </li>
            ))}
          </ul>
          {isNewMember(o.memberSince) ? (
            <p className="rounded-md bg-white/10 px-3.5 py-3 text-[13px] leading-[19px]">
              <strong>New on the platform.</strong> Early partners can help shape their first
              project.
            </p>
          ) : null}
          <EnquiryButton viewer={viewer} returnTo={returnTo} size="lg" variant="inverse" />
          <p className="text-center text-xs text-[#B9C7DD]">
            You can attach one of your projects to the enquiry
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-bold">Work with {o.name}</p>
          <p className="text-sm leading-[21px] text-[#D6E0F0]">
            Sign in to see how well they match your organisation, view their documents and send an
            enquiry.
          </p>
          <EnquiryButton viewer={viewer} returnTo={returnTo} size="lg" variant="inverse" />
          {viewer.signedIn ? null : (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={routes.auth.register}>Register your organisation</Link>
            </Button>
          )}
        </>
      )}
    </section>
  );
}

export function ContactCard({ organisation: o }: { organisation: OrganisationDetail }) {
  const { replyTime, replyRate } = o.contact;
  return (
    <section
      aria-labelledby="contact-title"
      className="flex flex-col gap-3.5 rounded-lg border bg-card p-[22px] shadow-float"
    >
      <h2 id="contact-title" className="text-base font-bold">
        Contact
      </h2>
      <div className="flex items-start gap-3 rounded-md bg-surface p-3.5">
        <Lock className="mt-px size-[18px] shrink-0 text-muted-foreground" aria-hidden />
        <p className="text-[13px] leading-[19px] text-foreground/80">
          The contact person, email and phone number are shared once they accept your enquiry.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-[13px] text-muted-foreground">
        {replyTime ? (
          <span className="flex items-center gap-2">
            <Clock className="size-[15px] text-subtle-foreground" aria-hidden />
            Usually replies within {replyTime}
          </span>
        ) : (
          <span>Reply time will show after their first few enquiries.</span>
        )}
        {replyRate ? (
          <span className="flex items-center gap-2">
            <MessageSquare className="size-[15px] text-subtle-foreground" aria-hidden />
            Replies to {replyRate} of enquiries
          </span>
        ) : null}
        <span className="flex items-center gap-2">
          <ArrowRight className="size-[15px] text-subtle-foreground" aria-hidden />
          Active {formatListed(o.lastActiveAt)}
        </span>
      </div>
    </section>
  );
}

export function VerificationCard({ organisation: o }: { organisation: OrganisationDetail }) {
  if (!o.verified) return null;
  return (
    <section
      aria-labelledby="verified-title"
      className="flex flex-col gap-3 rounded-lg border bg-card p-[22px] shadow-float"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-success-soft">
          <ShieldCheck className="size-5 text-success" aria-hidden />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 id="verified-title" className="text-base font-bold">
            Verified by NCPC
          </h2>
          <p className="text-[13px] text-muted-foreground">
            on {formatDay(o.verification.verifiedAt)}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {o.verification.checks.map((check) => (
          <li key={check} className="flex gap-2 text-[13px] text-foreground/80">
            <Check className="mt-px size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
            {check}
          </li>
        ))}
      </ul>
      <Link href={routes.about} className="text-[13px] font-semibold text-primary hover:underline">
        What verification means →
      </Link>
    </section>
  );
}
