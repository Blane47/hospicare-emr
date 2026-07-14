import Link from "next/link";
import { FlaskConical, ClipboardEdit } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatDateTime } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { LabOrderStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LaboratoryPage() {
  const user = await requireRole(["LAB_TECH", "DOCTOR", "ADMIN"]);
  const canResult = user.role === "LAB_TECH" || user.role === "ADMIN";

  const withPatient = {
    items: { include: { labTest: true } },
    orderedBy: true,
    consultation: { include: { visit: { include: { patient: true } } } },
  } as const;

  const [pending, completed] = await Promise.all([
    prisma.labOrder.findMany({
      where: { status: "ORDERED" },
      orderBy: { createdAt: "asc" },
      include: withPatient,
    }),
    prisma.labOrder.findMany({
      where: { status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: withPatient,
    }),
  ]);

  type Order = (typeof pending)[number];

  const table = (rows: Order[], pendingSection: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ordered</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Tests</TableHead>
          <TableHead>Ordered by</TableHead>
          <TableHead>Status</TableHead>
          {pendingSection && canResult && (
            <TableHead className="text-right">Action</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((o) => {
          const patient = o.consultation.visit.patient;
          return (
            <TableRow key={o.id}>
              <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                {formatDateTime(o.createdAt)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/patients/${patient.id}`}
                  className="font-medium hover:underline"
                >
                  {patient.firstName} {patient.lastName}
                </Link>
                <div className="text-muted-foreground text-xs">
                  {patient.patientNumber}
                </div>
              </TableCell>
              <TableCell className="max-w-[260px]">
                <span className="text-muted-foreground text-sm">
                  {o.items.map((i) => i.labTest.name).join(", ")}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {o.orderedBy.name}
              </TableCell>
              <TableCell>
                <LabOrderStatusBadge status={o.status} />
              </TableCell>
              {pendingSection && canResult && (
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    render={<Link href={`/laboratory/${o.id}`} />}
                  >
                    <ClipboardEdit className="h-4 w-4" /> Enter results
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div>
      <PageHeader
        title="Laboratory"
        description="Lab tests ordered by doctors, awaiting or with results."
      />

      <Card className="mb-6 overflow-hidden p-0">
        <CardHeader className="p-4">
          <CardTitle className="text-base">
            Awaiting results ({pending.length})
          </CardTitle>
        </CardHeader>
        {pending.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-2 border-t py-12 text-center">
            <FlaskConical className="text-muted-foreground h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              No pending lab orders.
            </p>
          </CardContent>
        ) : (
          <div className="border-t">{table(pending, true)}</div>
        )}
      </Card>

      {completed.length > 0 && (
        <Card className="overflow-hidden p-0">
          <CardHeader className="p-4">
            <CardTitle className="text-base">Recently completed</CardTitle>
          </CardHeader>
          <div className="border-t">{table(completed, false)}</div>
        </Card>
      )}
    </div>
  );
}
