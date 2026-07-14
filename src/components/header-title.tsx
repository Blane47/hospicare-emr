"use client";

import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "@/lib/nav";
import { useT } from "@/components/locale-provider";

// Derives the current page title from the URL by matching against the nav map.
export function HeaderTitle() {
  const pathname = usePathname();
  const { t } = useT();
  const items = NAV_GROUPS.flatMap((g) => g.items);
  const match = items
    .filter((i) =>
      i.href === "/" ? pathname === "/" : pathname.startsWith(i.href),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <span className="text-sm font-medium">
      {match ? t(`nav.${match.label}`) : "HospiCare"}
    </span>
  );
}
