import {
  Banknote,
  CalendarClock,
  Clock,
  Layers,
  MapPin,
  Percent,
  PiggyBank,
  PieChart,
  Users,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { OfferFactIcon, OfferWhatIcon } from "../../types";

export const FACT_ICONS: Record<OfferFactIcon, LucideIcon> = {
  money: Banknote,
  rate: Percent,
  term: Clock,
  fund: PiggyBank,
  deadline: CalendarClock,
  share: PieChart,
};

export const WHAT_ICONS: Record<OfferWhatIcon, LucideIcon> = {
  themes: Layers,
  stage: Building2,
  place: MapPin,
  who: Users,
};
