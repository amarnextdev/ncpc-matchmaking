import {
  Activity,
  Banknote,
  BatteryCharging,
  Building2,
  Cpu,
  Handshake,
  Landmark,
  LandPlot,
  Sun,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { DetailSection } from "@/components/shared/detail-section";
import { Badge } from "@/components/ui/badge";
import type { OfferIcon, OrganisationDetail } from "../../types";

export function AboutSection({ organisation: o }: { organisation: OrganisationDetail }) {
  return (
    <DetailSection id="overview" title="About" className="pt-8">
      <p className="max-w-[720px] text-base leading-7 text-foreground/80">{o.about}</p>
      {o.facts.length ? (
        <dl className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          {o.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs text-subtle-foreground">{fact.label}</dt>
              <dd className="mt-1 text-[15px] font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </DetailSection>
  );
}

const OFFER_ICONS: Record<OfferIcon, LucideIcon> = {
  capital: Banknote,
  debt: Landmark,
  support: Handshake,
  technology: Cpu,
  site: Building2,
  roof: Sun,
  land: LandPlot,
  offtake: Zap,
  services: Wrench,
  solar: Sun,
  battery: BatteryCharging,
  monitoring: Activity,
};

/** Navy-tinted cards with a solid icon tile and a large faint icon as a watermark. */
export function OffersSection({ organisation: o }: { organisation: OrganisationDetail }) {
  if (!o.offerCards.length) return null;
  return (
    <DetailSection id="offers" title="What we offer">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        {o.offerCards.map((offer) => {
          const Icon = OFFER_ICONS[offer.icon ?? "services"];
          return (
            <div
              key={offer.title}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-lg border border-[#D5E0F2] bg-linear-to-br from-primary-soft via-white to-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-float"
            >
              <Icon
                aria-hidden
                strokeWidth={1.25}
                className="pointer-events-none absolute -right-4 -bottom-5 size-28 text-primary/[0.06] transition-transform duration-300 group-hover:scale-110"
              />
              <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[0_6px_16px_rgb(19_51_107/0.25)]">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="relative text-base font-bold">{offer.title}</h3>
              {offer.text ? (
                <p className="relative text-sm leading-[21px] text-muted-foreground">
                  {offer.text}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </DetailSection>
  );
}

export function WantsSection({ organisation: o }: { organisation: OrganisationDetail }) {
  if (!o.wants.length) return null;
  return (
    <DetailSection
      id="looking-for"
      title="What we're looking for"
      description="Used by NCPC matchmaking to suggest partners"
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
        {o.wants.map((want) => (
          <div
            key={want.title}
            className="flex flex-col gap-1.5 rounded-lg border bg-card p-[18px]"
          >
            <div className="flex items-start justify-between gap-2.5">
              <h3 className="text-base font-bold text-primary">{want.title}</h3>
              <Badge variant="verified">Open</Badge>
            </div>
            <p className="text-sm leading-[21px] text-foreground/80">{want.text}</p>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}

export function ImpactSection({ organisation: o }: { organisation: OrganisationDetail }) {
  if (!o.impact.length) return null;
  return (
    <DetailSection
      id="impact"
      title="Impact"
      description="Expected yearly impact of the projects above, as reported by their owners"
    >
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
        {o.impact.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1.5 rounded-lg border border-[#D4E8C4] bg-success-soft p-[18px]"
          >
            <dt className="text-[13px] font-semibold text-[#1F4F0C]">{item.label}</dt>
            <dd className="text-[26px] font-bold tracking-tight">{item.value}</dd>
          </div>
        ))}
      </dl>
    </DetailSection>
  );
}
