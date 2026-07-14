import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  calculateAge,
  formatDateTime,
  formatFCFA,
  GENDER_LABELS,
  type Gender,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import {
  VisitStatusBadge,
  PrescriptionStatusBadge,
} from "@/components/status-badge";
import { ConsultationWorkspace } from "./consultation-workspace";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const str = (v: number | null | undefined) =>
  v === null || v === undefined ? "" : String(v);

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  await requireRole(["DOCTOR", "ADMIN"]);
  const { visitId } = await params;

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      consultation: {
        include: {
          doctor: true,
          prescription: { include: { items: { include: { drug: true } } } },
        },
      },
    },
  });
  if (!visit) notFound();

  const drugs = await prisma.drug.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      strength: true,
      form: true,
      unitPrice: true,
      quantityInStock: true,
    },
  });

  const patient = visit.patient;
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const editable = visit.status === "WAITING" || visit.status === "WITH_DOCTOR";
  const consultation = visit.consultation;

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/queue"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <PageHeader title={`Consultation · ${fullName}`}>
        <VisitStatusBadge status={visit.status} />
      </PageHeader>

      {/* Patient banner */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {patient.patientNumber}
        </Badge>
        <Badge variant="outline">
          {GENDER_LABELS[patient.gender as Gender] ?? patient.gender}
        </Badge>
        <Badge variant="outline">{calculateAge(patient.dateOfBirth)} yrs</Badge>
        {patient.bloodGroup && (
          <Badge variant="outline">Blood: {patient.bloodGroup}</Badge>
        )}
        <span className="text-muted-foreground text-sm">
          Visit {visit.visitNumber} · {formatDateTime(visit.createdAt)}
        </span>
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

      {visit.chiefComplaint && (
        <div className="bg-muted/50 mb-6 rounded-lg border p-3 text-sm">
          <span className="text-muted-foreground">Chief complaint: </span>
          {visit.chiefComplaint}
        </div>
      )}

      {editable ? (
        <ConsultationWorkspace
          visitId={visit.id}
          drugs={drugs}
          initial={
            consultation
              ? {
                  temperature: str(consultation.temperature),
                  systolic: str(consultation.systolic),
                  diastolic: str(consultation.diastolic),
                  pulse: str(consultation.pulse),
                  weightKg: str(consultation.weightKg),
                  heightCm: str(consultation.heightCm),
                  symptoms: consultation.symptoms ?? "",
                  diagnosis: consultation.diagnosis ?? "",
                  notes: consultation.notes ?? "",
                  prescriptionNotes: consultation.prescription?.notes ?? "",
                  items:
                    consultation.prescription?.items.map((it) => ({
                      drugId: it.drugId,
                      dosage: it.dosage,
                      frequency: it.frequency,
                      durationDays: str(it.durationDays),
                      quantity: String(it.quantity),
                      instructions: it.instructions ?? "",
                    })) ?? [],
                }
              : undefined
          }
        />
      ) : (
        <ReadOnlyConsultation consultation={consultation} />
      )}
    </div>
  );
}

function ReadOnlyConsultation({
  consultation,
}: {
  consultation: NonNullable<
    Awaited<ReturnType<typeof getVisitConsultation>>
  > | null;
}) {
  if (!consultation) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          No consultation was recorded for this visit.
        </CardContent>
      </Card>
    );
  }

  const vitalRows: [string, string][] = [
    ["Temperature", consultation.temperature ? `${consultation.temperature} °C` : "—"],
    [
      "Blood pressure",
      consultation.systolic && consultation.diastolic
        ? `${consultation.systolic}/${consultation.diastolic} mmHg`
        : "—",
    ],
    ["Pulse", consultation.pulse ? `${consultation.pulse} bpm` : "—"],
    ["Weight", consultation.weightKg ? `${consultation.weightKg} kg` : "—"],
    ["Height", consultation.heightCm ? `${consultation.heightCm} cm` : "—"],
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consultation summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {vitalRows.map(([label, value]) => (
              <div key={label}>
                <div className="text-muted-foreground text-xs">{label}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-xs">Symptoms</div>
              <div>{consultation.symptoms ?? "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Diagnosis</div>
              <div className="font-medium">{consultation.diagnosis ?? "—"}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-muted-foreground text-xs">Notes</div>
              <div>{consultation.notes ?? "—"}</div>
            </div>
          </div>
          <div className="text-muted-foreground border-t pt-3 text-xs">
            Attended by {consultation.doctor.name}
          </div>
        </CardContent>
      </Card>

      {consultation.prescription && (
        <Card className="p-0">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-base">Prescription</CardTitle>
            <PrescriptionStatusBadge status={consultation.prescription.status} />
          </CardHeader>
          <div className="overflow-x-auto border-t">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground bg-muted/40 text-left text-xs">
                  <th className="p-3 font-medium">Drug</th>
                  <th className="p-3 font-medium">Dosage</th>
                  <th className="p-3 font-medium">Frequency</th>
                  <th className="p-3 font-medium">Qty</th>
                  <th className="p-3 font-medium">Dispensed</th>
                </tr>
              </thead>
              <tbody>
                {consultation.prescription.items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="p-3 font-medium">
                      {it.drug.name} {it.drug.strength ?? ""}
                    </td>
                    <td className="p-3">{it.dosage}</td>
                    <td className="p-3">{it.frequency}</td>
                    <td className="p-3">{it.quantity}</td>
                    <td className="p-3">
                      {it.quantityDispensed}/{it.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper type inference for the read-only view.
async function getVisitConsultation() {
  return prisma.consultation.findFirst({
    include: {
      doctor: true,
      prescription: { include: { items: { include: { drug: true } } } },
    },
  });
}
