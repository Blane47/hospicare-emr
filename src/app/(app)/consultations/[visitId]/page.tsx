import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert, Printer } from "lucide-react";
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
  LabOrderStatusBadge,
  TriagePriorityBadge,
} from "@/components/status-badge";
import { ConsultationWorkspace } from "./consultation-workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const str = (v: number | null | undefined) =>
  v === null || v === undefined ? "" : String(v);

// Vitals now live on the visit (captured by the nurse at triage). Build a
// compact display list of just the values that were recorded.
function buildTriageVitals(v: {
  temperature: number | null;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  respRate: number | null;
  spo2: number | null;
  weightKg: number | null;
  heightCm: number | null;
  lmp: string | null;
}): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const add = (label: string, value: string | null) => {
    if (value) rows.push({ label, value });
  };
  add("Temp", v.temperature != null ? `${v.temperature} °C` : null);
  add(
    "Blood pressure",
    v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic} mmHg` : null,
  );
  add("Pulse", v.pulse != null ? `${v.pulse} bpm` : null);
  add("Resp. rate", v.respRate != null ? `${v.respRate} /min` : null);
  add("SpO₂", v.spo2 != null ? `${v.spo2} %` : null);
  add("Weight", v.weightKg != null ? `${v.weightKg} kg` : null);
  add("Height", v.heightCm != null ? `${v.heightCm} cm` : null);
  add("LMP", v.lmp || null);
  return rows;
}

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
          labOrders: { include: { items: { include: { labTest: true } } } },
        },
      },
    },
  });
  if (!visit) notFound();

  const [drugs, labTests] = await Promise.all([
    prisma.drug.findMany({
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
    }),
    prisma.labTest.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true, price: true },
    }),
  ]);

  const pendingLabOrder = visit.consultation?.labOrders.find(
    (o) => o.status === "ORDERED",
  );

  const patient = visit.patient;
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const editable = visit.status === "TRIAGED" || visit.status === "WITH_DOCTOR";
  const consultation = visit.consultation;
  const triageVitals = buildTriageVitals(visit);

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
          labTests={labTests}
          chiefComplaint={visit.chiefComplaint}
          triageVitals={triageVitals}
          triagePriority={visit.triagePriority}
          initial={
            consultation
              ? {
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
                  labTestIds: pendingLabOrder?.items.map((i) => i.labTestId) ?? [],
                }
              : undefined
          }
        />
      ) : (
        <ReadOnlyConsultation
          consultation={consultation}
          visitId={visit.id}
          triageVitals={triageVitals}
          triagePriority={visit.triagePriority}
        />
      )}
    </div>
  );
}

function ReadOnlyConsultation({
  consultation,
  visitId,
  triageVitals,
  triagePriority,
}: {
  consultation: NonNullable<
    Awaited<ReturnType<typeof getVisitConsultation>>
  > | null;
  visitId: string;
  triageVitals: { label: string; value: string }[];
  triagePriority: string | null;
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Consultation summary</CardTitle>
          {triagePriority && triagePriority !== "NORMAL" && (
            <TriagePriorityBadge priority={triagePriority} />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {triageVitals.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {triageVitals.map(({ label, value }) => (
                <div key={label}>
                  <div className="text-muted-foreground text-xs">{label}</div>
                  <div className="font-medium">{value}</div>
                </div>
              ))}
            </div>
          )}
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
            <div className="flex items-center gap-2">
              <PrescriptionStatusBadge status={consultation.prescription.status} />
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/consultations/${visitId}/prescription`} />}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
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

      {consultation.labOrders.length > 0 && (
        <Card className="p-0">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-4">
            <CardTitle className="text-base">Laboratory</CardTitle>
            <LabOrderStatusBadge status={consultation.labOrders[0].status} />
          </CardHeader>
          <div className="overflow-x-auto border-t">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground bg-muted/40 text-left text-xs">
                  <th className="p-3 font-medium">Test</th>
                  <th className="p-3 font-medium">Result</th>
                  <th className="p-3 font-medium">Reference</th>
                  <th className="p-3 font-medium">Flag</th>
                </tr>
              </thead>
              <tbody>
                {consultation.labOrders.flatMap((o) =>
                  o.items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="p-3 font-medium">{it.labTest.name}</td>
                      <td className="p-3">
                        {it.result ?? (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                        {it.result && it.labTest.unit ? ` ${it.labTest.unit}` : ""}
                      </td>
                      <td className="text-muted-foreground p-3">
                        {it.labTest.referenceRange || "—"}
                      </td>
                      <td className="p-3">
                        {it.flag === "NORMAL" && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Normal
                          </span>
                        )}
                        {it.flag && it.flag !== "NORMAL" && (
                          <span className="text-red-600 dark:text-red-400">
                            {it.flag.charAt(0) + it.flag.slice(1).toLowerCase()}
                          </span>
                        )}
                        {!it.flag && "—"}
                      </td>
                    </tr>
                  )),
                )}
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
      labOrders: { include: { items: { include: { labTest: true } } } },
    },
  });
}
