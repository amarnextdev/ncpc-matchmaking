"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Section = { id: string; label: string };

/** Sticky in-page tabs under the header. Highlights the section currently on screen. */
export function SectionTabs({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const key = sections.map((s) => s.id).join(",");

  useEffect(() => {
    const elements = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return (
    <nav
      aria-label="Sections"
      className="sticky top-[76px] z-20 -mx-5 flex [scrollbar-width:none] gap-6 overflow-x-auto border-b bg-background px-5 md:mx-0 md:px-0"
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={() => setActive(section.id)}
          aria-current={active === section.id ? "true" : undefined}
          className={cn(
            "-mb-px shrink-0 border-b-2 py-3.5 text-sm whitespace-nowrap transition-colors",
            active === section.id
              ? "border-primary font-semibold text-primary"
              : "border-transparent font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
