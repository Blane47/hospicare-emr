import Link from "next/link";
import { Pill, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatDateTime, formatFCFA } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { PrescriptionStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DispenseQueuePage() {
  await requireRole(["PHARMACIST", "ADMIN"]);

  const prescriptions = await prisma.prescription.findMany({
    where: { status: { in: ["PENDING", "PARTIALLY_DISPENSED"] } },
    orderBy: { createdAt: "asc" },
    include: {
      items: { include: { drug: true } },
      consultation: { include: { visit: { include: { patient: true } } } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Dispensing"
        description="Prescriptions waiting to be filled at the pharmacy."
      />

      <Card className="overflow-hidden p-0">
        {prescriptions.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Pill className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">Nothing to dispense</p>
            <p className="text-muted-foreground text-sm">
              Prescriptions from doctors will appear here.
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prescribed</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Est. value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx) => {
                const patient = rx.consultation.visit.patient;
                const estValue = rx.items.reduce(
                  (s, it) =>
                    s +
                    it.drug.unitPrice * (it.quantity - it.quantityDispensed),
                  0,
                );
                return (
                  <TableRow key={rx.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                      {formatDateTime(rx.createdAt)}
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
                    <TableCell>{rx.items.length} drug(s)</TableCell>
                    <TableCell className="font-medium">
                      {formatFCFA(estValue)}
                    </TableCell>
                    <TableCell>
                      <PrescriptionStatusBadge status={rx.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        render={<Link href={`/pharmacy/dispense/${rx.id}`} />}
                      >
                        Dispense <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
