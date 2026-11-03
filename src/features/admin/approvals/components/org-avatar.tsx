import { tintFor } from "@/features/auth/org-display";
import type { OrganisationCategory } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

/** Logo, or initials on the category colour. */
export function OrgAvatar({
  name,
  category,
  logoUrl,
  size = "md",
}: {
  name: string;
  category: OrganisationCategory;
  logoUrl?: string | null;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "size-16 rounded-2xl text-xl" : "size-10 rounded-xl text-sm";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- uploaded logo from Supabase Storage
      <img src={logoUrl} alt="" className={cn(box, "shrink-0 border bg-background object-cover")} />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(box, "flex shrink-0 items-center justify-center font-bold text-white")}
      style={{ backgroundColor: tintFor(category) }}
    >
      {initials(name.replace(/\(.*?\)/g, ""))}
    </span>
  );
}
