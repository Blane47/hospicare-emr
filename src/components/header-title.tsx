"use client";

import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/lib/nav";

// Derives the current page title from the URL by matching against the nav map.
export function HeaderTitle() {
  const pathname = usePathname();
  const items = NAV_GROUPS.flatMap((g) => g.items);
  const match = items
    .filter((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return <span className="text-sm font-medium">{match?.label ?? "HospiCare"}</span>;
}
