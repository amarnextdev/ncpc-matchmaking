import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Download, FileText, Info } from "lucide-react";
import { DetailSection } from "@/components/shared/detail-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { routes } from "@/config/routes";
import { PROJECT_STAGES, labelFor } from "@/lib/constants";
import { formatMonth } from "@/lib/dates";
import { cn, initials } from "@/lib/utils";
import type { Viewer } from "@/types";
import { fundingType } from "../../constants";
import { deadlineInfo } from "../../deadline";
import type { FundingOffer, FundingOfferDetail } from "../../types";
import { WHAT_ICONS } from "./fact-icon";

type Props = { offer: FundingOfferDetail };

export function AboutOffer({ offer: o }: Props) {
  const tint = fundingType(o.type).tint;
  return (
    <DetailSection id="overview" title="About this offer">
      <p className="max-w-[760px] text-[15px] leading-[25px] text-foreground/80">{o.about}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {o.fundsWhat.map((item) => {
          const Icon = WHAT_ICONS[item.icon];
          return (
            <li
              key={item.label}
              className="flex items-start gap-3.5 rounded-md border p-4"
              style={{ backgroundImage: `linear-gradient(135deg, ${tint}12, transparent 70%)` }}
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-sm text-white"
                style={{ backgroundColor: tint }}
              >
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold tracking-[0.06em] text-subtle-foreground uppercase">
                  {item.label}
                </span>
                <span className="text-[15px] leading-[22px] font-semibold">{item.value}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </DetailSection>
  );
}

export function Eligibility({ offer: o, viewer }: Props & { viewer: Viewer }) {
  const total = o.criteria.length;
  return (
    <DetailSection
      id="eligibility"
      title="Who can apply"
      action={
        <span className="text-sm text-subtle-foreground">
          Your project must meet all {total === 6 ? "six" : total}
        </span>
      }
    >
      <ol className="grid gap-x-6 gap-y-3 md:grid-cols-2">
        {o.criteria.map((text, i) => (
          <li key={text} className="flex items-start gap-3 text-[15px] leading-[22px]">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              {i + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>

      {viewer.signedIn && o.memberCheck.length ? (
        <div className="mt-2 overflow-hidden rounded-lg border">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b bg-surface-subtle px-5 py-3">
            <span className="text-sm font-bold">Eligibility check for your projects</span>
            <span className="text-xs text-subtle-foreground">
              Checked against your project data
            </span>
          </div>
          <ul>
            {o.memberCheck.map((p, i) => {
              const ok = p.met === p.total;
              return (
                <li
                  key={p.slug}
                  className={cn("flex flex-wrap items-center gap-4 px-5 py-4", i && "border-t")}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md",
                      ok ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                    )}
                  >
                    {ok ? (
                      <Check className="size-5" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <AlertTriangle className="size-5" aria-hidden />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1.5">
                    <Link
                      href={routes.opportunities.detail(p.slug)}
                      className="text-[15px] font-semibold hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <span aria-hidden className="flex gap-1">
                      {Array.from({ length: p.total }, (_, n) => (
                        <span
                          key={n}
                          className={cn(
                            "h-1.5 w-7 rounded-full",
                            n < p.met ? "bg-success" : "bg-[#C98A16]",
                          )}
                        />
                      ))}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {ok ? `Meets all ${p.total} criteria` : `Missing: ${p.missing}`}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[13px] font-bold",
                      ok ? "bg-success-soft text-[#1F4F0C]" : "bg-warning-soft text-warning",
                    )}
                  >
                    {ok ? "Eligible" : `${p.met} of ${p.total}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </DetailSection>
  );
}

export function Terms({ offer: o }: Props) {
  return (
    <DetailSection id="terms" title="Terms">
      <dl className="overflow-hidden rounded-lg border">
        {o.terms.map((term, i) => (
          <div
            key={term.label}
            className={cn(
              "grid gap-1 px-5 py-3.5 md:grid-cols-[220px_1fr] md:gap-4",
              i && "border-t",
              i % 2 && "bg-surface-subtle",
            )}
          >
            <dt className="text-sm text-subtle-foreground">{term.label}</dt>
            <dd className="text-[15px] font-semibold">{term.value}</dd>
          </div>
        ))}
      </dl>
      <p className="flex items-start gap-2 text-[13px] leading-5 text-subtle-foreground">
        <Info className="mt-0.5 size-[15px] shrink-0" aria-hidden />
        {o.termsNote}
      </p>
    </DetailSection>
  );
}

export function HowToApply({ offer: o }: Props) {
  const last = o.steps.length - 1;
  return (
    <DetailSection
      id="apply"
      title="How to apply"
      description={`From application to decision in ${o.totalTime.toLowerCase().replace("about ", "about ")}`}
    >
      <ol className="flex flex-col rounded-lg border p-5">
        {o.steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-4">
            {i < last ? (
              <span aria-hidden className="absolute top-8 bottom-0 left-[15px] w-0.5 bg-border" />
            ) : null}
            <span
              className={cn(
                "relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                i === 0 && "bg-primary text-primary-foreground",
                i === last && "bg-success text-white",
                i > 0 && i < last && "border-2 border-primary bg-background text-primary",
              )}
            >
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-4 gap-y-1 pt-1">
              <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
                <span className="text-[15px] font-bold">{step.title}</span>
                <span className="text-sm leading-[21px] text-muted-foreground">{step.text}</span>
              </div>
              <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                {step.time}
              </span>
            </div>
          </li>
        ))}
        <li className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
          <span>Total time, application to decision</span>
          <strong className="text-[15px] text-foreground">{o.totalTime}</strong>
        </li>
      </ol>
      <div className="flex flex-col gap-4 rounded-lg border bg-surface-subtle p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[15px] font-bold">Documents you will need</span>
          {/* TODO(Module 7 – Funding admin): checklist PDF uploaded by the funder. */}
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
          >
            <Download className="size-3.5" aria-hidden />
            Download checklist (PDF)
          </a>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {o.documents.map((doc) => (
            <li
              key={doc}
              className="flex items-center gap-2.5 rounded-md border bg-card px-3 py-2.5 text-sm"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-primary-soft">
                <FileText className="size-3.5 text-primary" aria-hidden />
              </span>
              {doc}
            </li>
          ))}
        </ul>
      </div>
    </DetailSection>
  );
}

export function FundedSoFar({ offer: o }: Props) {
  const f = o.funded;
  if (!f.count) return null;
  const verb = o.type === "loan" ? "Lent" : o.type === "equity" ? "Invested" : "Awarded";
  return (
    <DetailSection
      id="funded"
      title="Funded so far"
      description="Deals confirmed by both sides on the platform"
    >
      <dl className="grid grid-cols-3 gap-3">
        <div className="rounded-md bg-success-soft p-4">
          <dt className="text-xs text-success">{verb} so far</dt>
          <dd className="mt-1 text-2xl font-bold text-success">{f.total}</dd>
        </div>
        <div className="rounded-md bg-surface-subtle p-4">
          <dt className="text-xs text-subtle-foreground">Projects funded</dt>
          <dd className="mt-1 text-2xl font-bold">{f.count}</dd>
        </div>
        <div className="rounded-md bg-surface-subtle p-4">
          <dt className="text-xs text-subtle-foreground">Applications</dt>
          <dd className="mt-1 text-2xl font-bold">{f.applications}</dd>
        </div>
      </dl>
      <ul className="overflow-hidden rounded-lg border">
        {f.items.map((item, i) => (
          <li
            key={item.title}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 md:grid-cols-[minmax(0,1fr)_90px_140px]",
              i && "border-t",
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-sm text-[13px] font-bold text-white"
                style={{ backgroundColor: item.tint }}
              >
                {initials(item.title)}
              </span>
              <span className="flex min-w-0 flex-col">
                {item.slug ? (
                  <Link
                    href={routes.opportunities.detail(item.slug)}
                    className="truncate text-[15px] font-semibold hover:text-primary"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span className="truncate text-[15px] font-semibold">{item.title}</span>
                )}
                <span className="truncate text-[13px] text-subtle-foreground">
                  {item.owner} · {formatMonth(item.date)}
                </span>
              </span>
            </span>
            <span className="text-right text-[15px] font-bold md:text-left">{item.amount}</span>
            <span
              className={cn(
                "col-span-2 inline-flex items-center gap-1.5 justify-self-start rounded-full px-2.5 py-1 text-xs font-semibold md:col-span-1",
                item.stage === "operational"
                  ? "bg-success-soft text-success"
                  : "bg-primary-soft text-primary",
              )}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              {labelFor(PROJECT_STAGES, item.stage)}
            </span>
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}

export function OfferFaq({ offer: o }: Props) {
  return (
    <DetailSection id="faq" title="Questions">
      <Accordion type="single" collapsible defaultValue="faq-0" className="rounded-lg border px-5">
        {o.faqs.map((faq, i) => (
          <AccordionItem key={faq.q} value={`faq-${i}`}>
            <AccordionTrigger className="text-[15px]">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-[15px] leading-6 text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </DetailSection>
  );
}

export function SimilarOffers({ items }: { items: FundingOffer[] }) {
  if (!items.length) return null;
  return (
    <DetailSection
      id="similar"
      title="Similar offers"
      action={
        <Link
          href={routes.funding.list}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all funding <ArrowRight className="size-4" aria-hidden />
        </Link>
      }
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {items.map((o) => {
          const type = fundingType(o.type);
          const deadline = deadlineInfo(o);
          return (
            <li key={o.id} className="flex">
              <Link
                href={routes.funding.detail(o.slug)}
                className="group flex w-full flex-col overflow-hidden rounded-lg border bg-card shadow-card transition-shadow hover:shadow-float"
              >
                <span
                  className="flex flex-col gap-1 px-4 py-4 text-white"
                  style={{ backgroundColor: type.tint }}
                >
                  <span className="text-xs font-semibold text-white/80">{type.label}</span>
                  <span className="text-xl font-bold">{o.amountLabel}</span>
                </span>
                <span className="flex flex-col gap-1 p-4">
                  <span className="text-[15px] leading-[21px] font-bold group-hover:text-primary">
                    {o.title}
                  </span>
                  <span className="text-[13px] text-subtle-foreground">
                    {o.funder.name} · {deadline.label}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </DetailSection>
  );
}
