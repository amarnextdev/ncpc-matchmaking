import Image from "next/image";
import { cn } from "@/lib/utils";
import type { NetworkOrg } from "../queries";

/** Logo (or initials) square for network rows. */
export function OrgTile({
  org,
  size = 52,
  muted,
}: {
  org: NetworkOrg;
  size?: number;
  muted?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] font-bold",
        org.logoUrl
          ? "border bg-white"
          : muted
            ? "bg-muted text-foreground/60"
            : "bg-primary text-white",
      )}
      style={{ width: size, height: size, fontSize: size / 3.4 }}
    >
      {org.logoUrl ? (
        <Image src={org.logoUrl} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        org.initials
      )}
    </span>
  );
}
