import {
  Building2,
  Cpu,
  Droplets,
  HardHat,
  Landmark,
  Leaf,
  Recycle,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { PROJECT_STAGES, type LookingFor, type ProjectStage } from "@/lib/constants";
import { daysSince } from "@/lib/dates";
import type { ImpactKind, OpportunityDetail } from "./types";

/** How each "Looking for" role is shown on the detail page. Green only for off-takers (offtake = progress). */
export const NEED_META: Record<
  LookingFor,
  { label: string; phrase: string; icon: LucideIcon; tone: "primary" | "success"; fallback: string }
> = {
  investor: {
    label: "Investor",
    phrase: "an investor",
    icon: TrendingUp,
    tone: "primary",
    fallback: "Equity or loan to fund the project",
  },
  funder: {
    label: "Funder",
    phrase: "a funder",
    icon: Landmark,
    tone: "primary",
    fallback: "Grant or development finance",
  },
  technology: {
    label: "Technology provider",
    phrase: "a technology provider",
    icon: Cpu,
    tone: "primary",
    fallback: "Supply, install and maintain the equipment",
  },
  off_taker: {
    label: "Off-taker",
    phrase: "an off-taker",
    icon: Zap,
    tone: "success",
    fallback: "Buyers for what the project produces",
  },
  site_host: {
    label: "Site host",
    phrase: "a site host",
    icon: Building2,
    tone: "primary",
    fallback: "Land or roof space to host the project",
  },
  contractor: {
    label: "Contractor",
    phrase: "a contractor",
    icon: HardHat,
    tone: "primary",
    fallback: "Build and install the project",
  },
};

export const IMPACT_ICON: Record<ImpactKind, LucideIcon> = {
  co2: Leaf,
  power: Zap,
  jobs: Users,
  water: Droplets,
  waste: Recycle,
};

export function stageIndex(stage: ProjectStage): number {
  return PROJECT_STAGES.findIndex((s) => s.value === stage);
}

/** Listed in the last 14 days with no partners or funding yet → "New listing" view. */
export function isNewListing(o: OpportunityDetail): boolean {
  return daysSince(o.listedAt) < 14 && o.partners.length === 0 && o.capitalRaised === 0;
}

/** ["investor", "technology"] → "an investor and a technology provider" */
export function needsSentence(roles: LookingFor[]): string {
  const parts = roles.map((r) => NEED_META[r].phrase);
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}
