import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ROLE_LABELS, formatDate, type Role } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { AddStaffDialog } from "./add-staff-dialog";
import { setUserActive } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_TINT: Record<Role, string> = {
  ADMIN: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  DOCTOR: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  PHARMACIST:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  RECEPTIONIST:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
};

export default async function StaffPage() {
  const admin = await requireRole(["ADMIN"]);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage the people who can access the system."
      >
        <AddStaffDialog />
      </PageHeader>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const role = u.role as Role;
              const isSelf = u.id === admin.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                    {isSelf && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        (you)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_TINT[role]}>
                      {ROLE_LABELS[role] ?? u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.active ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isSelf && (
                      <form action={setUserActive.bind(null, u.id, !u.active)}>
                        <Button variant="outline" size="sm" type="submit">
                          {u.active ? "Disable" : "Enable"}
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
