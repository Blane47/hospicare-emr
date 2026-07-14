import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateAge, formatDateTime } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { VisitStatusBadge } from "@/components/status-badge";
import { openConsultation } from "./actions";
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

export default async function ConsultationsPage() {
  await requireRole(["DOCTOR", "ADMIN"]);

  const toAttend = await prisma.visit.findMany({
    where: { status: { in: ["WAITING", "WITH_DOCTOR"] } },
    orderBy: { createdAt: "asc" },
    include: { patient: true },
  });

  const recent = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { visit: { include: { patient: true } }, doctor: true },
  });

  return (
    <div>
      <PageHeader
        title="Consultations"
        description="Attend to waiting patients and review recent consultations."
      />

      <Card className="mb-6 overflow-hidden p-0">
        <CardHeader className="p-4">
          <CardTitle className="text-base">
            To attend ({toAttend.length})
          </CardTitle>
        </CardHeader>
        {toAttend.length === 0 ? (
          <div className="text-muted-foreground border-t py-10 text-center text-sm">
            No patients waiting. Nice work.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Since</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toAttend.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatDateTime(v.createdAt)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {v.patient.firstName} {v.patient.lastName}
                    </span>
                    <div className="text-muted-foreground text-xs">
                      {v.patient.patientNumber} ·{" "}
                      {calculateAge(v.patient.dateOfBirth)} yrs
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {v.chiefComplaint ?? "—"}
                  </TableCell>
                  <TableCell>
                    <VisitStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {v.status === "WAITING" ? (
                      <form action={openConsultation.bind(null, v.id)}>
                        <Button size="sm" type="submit">
                          <Stethoscope className="h-4 w-4" /> Attend
                        </Button>
                      </form>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        render={<Link href={`/consultations/${v.id}`} />}
                      >
                        Continue
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="overflow-hidden p-0">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Recent consultations</CardTitle>
        </CardHeader>
        {recent.length === 0 ? (
          <div className="text-muted-foreground border-t py-10 text-center text-sm">
            No consultations recorded yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Doctor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatDateTime(c.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/consultations/${c.visitId}`}
                      className="font-medium hover:underline"
                    >
                      {c.visit.patient.firstName} {c.visit.patient.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {c.diagnosis ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.doctor.name}
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
