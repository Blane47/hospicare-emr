import { requireUser } from "@/lib/session";
import { AppSidebar } from "@/components/app-sidebar";
import { HeaderTitle } from "@/components/header-title";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: user.name ?? "User",
          email: user.email ?? "",
          role: user.role,
        }}
      />
      <SidebarInset>
        <header className="no-print bg-background/80 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <HeaderTitle />
          <div className="ml-auto">
            <Badge variant="secondary" className="font-normal">
              {ROLE_LABELS[user.role as Role]}
            </Badge>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
