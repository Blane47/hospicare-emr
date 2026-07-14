"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut } from "lucide-react";
import { navForRole } from "@/lib/nav";
import { type Role } from "@/lib/constants";
import { useT } from "@/components/locale-provider";
import { signOutAction } from "@/lib/actions/auth-actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
}: {
  user: { name: string; email: string; role: Role };
}) {
  const pathname = usePathname();
  const { t } = useT();
  const groups = navForRole(user.role);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">HospiCare</div>
            <div className="text-sidebar-foreground/60 text-xs">
              Hospital System
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{t(`nav.${group.label}`)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive(item.href)}
                        render={
                          <Link href={item.href}>
                            <Icon />
                            <span>{t(`nav.${item.label}`)}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-sidebar-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
            {initials}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="text-sidebar-foreground/60 truncate text-xs">
              {t(`role.${user.role}`)}
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              title={t("common.signOut")}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md p-1.5 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
