import {
  LayoutDashboard,
  Users,
  ListChecks,
  Stethoscope,
  Pill,
  ShoppingCart,
  Package,
  Receipt,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/constants";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

// Single source of truth for the sidebar. Each item declares which roles may
// see it; the same role lists are enforced server-side via requireRole().
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        roles: ["ADMIN", "DOCTOR", "PHARMACIST", "RECEPTIONIST"],
      },
    ],
  },
  {
    label: "Clinical",
    items: [
      {
        label: "Patient Queue",
        href: "/queue",
        icon: ListChecks,
        roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"],
      },
      {
        label: "Patients",
        href: "/patients",
        icon: Users,
        roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"],
      },
      {
        label: "Consultations",
        href: "/consultations",
        icon: Stethoscope,
        roles: ["ADMIN", "DOCTOR"],
      },
    ],
  },
  {
    label: "Pharmacy",
    items: [
      {
        label: "Dispensing",
        href: "/pharmacy/dispense",
        icon: Pill,
        roles: ["ADMIN", "PHARMACIST"],
      },
      {
        label: "Point of Sale",
        href: "/pharmacy/pos",
        icon: ShoppingCart,
        roles: ["ADMIN", "PHARMACIST"],
      },
      {
        label: "Inventory",
        href: "/pharmacy/inventory",
        icon: Package,
        roles: ["ADMIN", "PHARMACIST"],
      },
      {
        label: "Sales",
        href: "/pharmacy/sales",
        icon: Receipt,
        roles: ["ADMIN", "PHARMACIST"],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Staff",
        href: "/admin/users",
        icon: UserCog,
        roles: ["ADMIN"],
      },
    ],
  },
];

/** Returns only the nav groups/items visible to the given role. */
export function navForRole(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
