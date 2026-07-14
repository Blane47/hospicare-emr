import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  calculateAge,
  formatDate,
  formatDateTime,
  GENDER_LABELS,
  type Gender,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { VisitStatusBadge } from "@/components/status-badge";
import { StartVisitDialog } from "../../queue/start-visit-dialog";
import { VitalsTrends, type VitalsPoint } from "./vitals-trends";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { createdAt: "desc" },
        include: { consultation: { include: { doctor: true } } },
      },
    },
  });

  if (!patient) notFound();

  const canStartVisit = user.role === "RECEPTIONIST" || user.role === "ADMIN";
  const canViewConsult = user.role === "DOCTOR" || user.role === "ADMIN";
  const fullName = `${patient.firstName} ${patient.lastName}`;

  // Vitals recorded across visits, oldest → newest, for the trend charts.
  const vitalsData: VitalsPoint[] = patient.visits
    .filter(
      (v) =>
        v.consultation &&
        (v.consultation.systolic ||
          v.consultation.weightKg ||
          v.consultation.temperature),
    )
    .map((v) => ({
      date: formatDate(v.createdAt),
      systolic: v.consultation!.systolic,
      diastolic: v.consultation!.diastolic,
      weight: v.consultation!.weightKg,
      temp: v.consultation!.temperature,
    }))
    .reverse();

  return (
    <div>
      <Link
        href="/patients"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </Link>

      <PageHeader title={fullName}>
        {canStartVisit && (
          <StartVisitDialog patientId={patient.id} patientName={fullName} />
        )}
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {patient.patientNumber}
        </Badge>
        <Badge variant="outline">
          {GENDER_LABELS[patient.gender as Gender] ?? patient.gender}
        </Badge>
        <Badge variant="outline">{calculateAge(patient.dateOfBirth)} years</Badge>
        {patient.bloodGroup && (
          <Badge variant="outline">Blood: {patient.bloodGroup}</Badge>
        )}
      </div>

      {patient.allergies && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mb-6 flex items-start gap-2 rounded-lg border p-3 text-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Allergies: </span>
            {patient.allergies}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demographics</CardTitle>
            </CardHeader>
            <CardContent className="divide-border divide-y py-0">
              <InfoRow label="Date of birth" value={formatDate(patient.dateOfBirth)} />
              <InfoRow
                label="Gender"
                value={GENDER_LABELS[patient.gender as Gender] ?? patient.gender}
              />
              <InfoRow label="Blood group" value={patient.bloodGroup} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="divide-border divide-y py-0">
              <InfoRow label="Phone" value={patient.phone} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="City" value={patient.city} />
              <InfoRow label="Region" value={patient.region} />
              <InfoRow label="Address" value={patient.address} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Emergency contact</CardTitle>
            </CardHeader>
            <CardContent className="divide-border divide-y py-0">
              <InfoRow label="Name" value={patient.emergencyContactName} />
              <InfoRow label="Phone" value={patient.emergencyContactPhone} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="overflow-hidden p-0">
            <CardHeader className="p-4">
              <CardTitle className="text-base">
                Visit history ({patient.visits.length})
              </CardTitle>
            </CardHeader>
            {patient.visits.length === 0 ? (
              <div className="text-muted-foreground border-t py-12 text-center text-sm">
                No visits recorded yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Visit&nbsp;#</TableHead>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.visits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(v.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {canViewConsult ? (
                          <Link
                            href={`/consultations/${v.id}`}
                            className="text-primary hover:underline"
                          >
                            {v.visitNumber}
                          </Link>
                        ) : (
                          v.visitNumber
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {v.chiefComplaint ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {v.consultation?.diagnosis ?? "—"}
                      </TableCell>
                      <TableCell>
                        <VisitStatusBadge status={v.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>

      {vitalsData.length >= 2 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Vitals trends</CardTitle>
          </CardHeader>
          <CardContent>
            <VitalsTrends data={vitalsData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
