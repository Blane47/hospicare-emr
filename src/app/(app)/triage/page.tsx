import Link from "next/link";
import { HeartPulse, Stethoscope } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateAge, formatDateTime } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
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

export default async function TriagePage() {
  await requireRole(["NURSE", "ADMIN"]);

  const waiting = await prisma.visit.findMany({
    where: { status: "WAITING" },
    orderBy: { createdAt: "asc" },
    include: { patient: true },
  });

  return (
    <div>
      <PageHeader
        title="Triage"
        description="Record vital signs and set priority before the patient sees the doctor."
      />

      <Card className="overflow-hidden p-0">
        {waiting.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HeartPulse className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">No patients waiting for triage</p>
            <p className="text-muted-foreground text-sm">
              New visits started at reception appear here for vitals.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Since</TableHead>
                <TableHead>Visit&nbsp;#</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waiting.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatDateTime(v.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {v.visitNumber}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/patients/${v.patientId}`}
                      className="font-medium hover:underline"
                    >
                      {v.patient.firstName} {v.patient.lastName}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {v.patient.patientNumber} ·{" "}
                      {calculateAge(v.patient.dateOfBirth)} yrs
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {v.chiefComplaint ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" render={<Link href={`/triage/${v.id}`} />}>
                      <Stethoscope className="h-4 w-4" /> Take vitals
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
