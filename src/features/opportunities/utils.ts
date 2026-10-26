import type { Theme } from "@/lib/constants";

/** Banner colour per theme, used until the owner uploads a cover photo. */
export const THEME_TINT: Record<Theme, string> = {
  energy: "#2E5A9C",
  energy_efficiency: "#5B4A8F",
  water: "#1F6E6A",
  waste_circularity: "#8A5A12",
  green_hydrogen: "#334155",
};
