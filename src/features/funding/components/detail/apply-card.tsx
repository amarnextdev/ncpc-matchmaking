"use client";

import { useState } from "react";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatRand, cn } from "@/lib/utils";
import type { Viewer } from "@/types";
import { fundingType } from "../../constants";
import { deadlineInfo } from "../../deadline";
import type { FundingOfferDetail } from "../../types";

/**
 * Primary (navy) card: amount, money still available, deadline, then
 * members pick one of their projects to apply with; visitors sign in.
 * TODO(Module 7 – Applications): open the Apply dialog / Ask a question (enquiry) dialog.
 */
export function ApplyCard({ offer: o, viewer }: { offer: FundingOfferDetail; viewer: Viewer }) {
  const type = fundingType(o.type);
  const deadline = deadlineInfo(o);
  const closed = o.status === "closed";
  const firstEligible = o.memberCheck.find((p) => p.met === p.total)?.slug ?? "";
  const [picked, setPicked] = useState(firstEligible);
  const used = Math.max(
    0,
    Math.min(100, Math.round(((o.fundSize - o.available) / o.fundSize) * 100)),
  );
  const returnTo = routes.funding.detail(o.slug);
  const decision = o.totalTime.replace(/^About /i, "~");

  return (
    <section
      aria-label="Apply"
      className="flex flex-col gap-4 rounded-lg bg-primary p-6 text-primary-foreground shadow-[0_16px_40px_rgb(19_51_107/0.28)]"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-[0.08em] text-[#B9C7DD] uppercase">
          {type.label} per project
        </span>
        <span className="text-[30px] leading-tight font-bold tracking-tight">{o.amountLabel}</span>
      </div>

      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-label="Share of the fund already committed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={used}
          className="h-2 overflow-hidden rounded-full bg-white/20"
        >
          <div className="h-full rounded-full bg-success-bar" style={{ width: `${100 - used}%` }} />
        </div>
        <span className="text-[13px] text-[#D6E0F0]">
          <strong className="text-white">{formatRand(o.available)}</strong> of{" "}
          {formatRand(o.fundSize)} still available
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2.5">
        <div className="rounded-md bg-white/10 px-3.5 py-3">
          <dt className="text-xs text-[#B9C7DD]">Deadline</dt>
          <dd className={cn("mt-0.5 text-[15px] font-bold", deadline.soon && "text-[#F5B544]")}>
            {deadline.label.replace(/^Closes /, "")}
          </dd>
        </div>
        <div className="rounded-md bg-white/10 px-3.5 py-3">
          <dt className="text-xs text-[#B9C7DD]">Decision in</dt>
          <dd className="mt-0.5 text-[15px] font-bold">{decision}</dd>
        </div>
      </dl>

      {closed ? (
        <p className="rounded-md bg-white/10 px-3.5 py-3 text-sm leading-[21px]">
          <strong>This offer is closed.</strong> See the projects it funded below, or browse open
          offers.
        </p>
      ) : viewer.signedIn ? (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">Apply with</legend>
            <RadioGroup value={picked} onValueChange={setPicked} className="gap-2">
              {o.memberCheck.map((p) => {
                const ok = p.met === p.total;
                const on = ok && picked === p.slug;
                return (
                  <label
                    key={p.slug}
                    htmlFor={`apply-${p.slug}`}
                    className={cn(
                      "flex items-start gap-3 rounded-md border px-3.5 py-3",
                      on ? "border-white bg-white/12" : "border-white/20",
                      ok ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                    )}
                  >
                    <RadioGroupItem
                      id={`apply-${p.slug}`}
                      value={p.slug}
                      disabled={!ok}
                      className="mt-0.5 border-white text-white data-[state=checked]:border-white"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold">{p.title}</span>
                      <span className={cn("text-xs", ok ? "text-[#D6E0F0]" : "text-[#F2C66D]")}>
                        {ok ? `Meets all ${p.total} criteria` : `Needs: ${p.missing}`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </fieldset>
          <Button
            type="button"
            size="lg"
            disabled={!picked}
            className="bg-white font-bold text-primary hover:bg-white/90"
          >
            Apply with this project
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Ask a question first
          </Button>
          <p className="text-center text-xs leading-[18px] text-[#B9C7DD]">
            The funder replies on the platform. Agreements are signed directly with {o.funder.name}.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm leading-[21px] text-[#D6E0F0]">
            Sign in to check if your project qualifies and apply with it.
          </p>
          <Button asChild size="lg" className="bg-white font-bold text-primary hover:bg-white/90">
            <Link href={`${routes.auth.signIn}?next=${encodeURIComponent(returnTo)}`}>
              Sign in to apply
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={routes.auth.register}>Register your organisation</Link>
          </Button>
        </>
      )}
    </section>
  );
}
