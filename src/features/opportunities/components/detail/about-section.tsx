import type { OpportunityDetail } from "../../types";
import { DetailSection } from "./detail-section";

export function AboutSection({ opportunity: o }: { opportunity: OpportunityDetail }) {
  return (
    <DetailSection id="overview" title="About the project" className="pt-8">
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
