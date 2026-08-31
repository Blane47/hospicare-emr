import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  calculateAge,
  formatDateTime,
  GENDER_LABELS,
  type Gender,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { TriageForm } from "./triage-form";

export default async function TriageVisitPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  await requireRole(["NURSE", "ADMIN"]);
  const { visitId } = await params;

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { patient: true },
  });
  if (!visit) notFound();

  const p = visit.patient;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/triage"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to triage
      </Link>

      <PageHeader title={`Triage · ${p.firstName} ${p.lastName}`} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {p.patientNumber}
        </Badge>
        <Badge variant="outline">
          {GENDER_LABELS[p.gender as Gender] ?? p.gender}
        </Badge>
        <Badge variant="outline">{calculateAge(p.dateOfBirth)} yrs</Badge>
        {p.bloodGroup && <Badge variant="outline">Blood: {p.bloodGroup}</Badge>}
        <span className="text-muted-foreground text-sm">
          Visit {visit.visitNumber} · {formatDateTime(visit.createdAt)}
        </span>
      </div>

      {visit.chiefComplaint && (
        <div className="bg-muted/40 mb-4 rounded-lg border p-3 text-sm">
          <span className="text-muted-foreground">Chief complaint: </span>
          {visit.chiefComplaint}
        </div>
      )}

      {p.allergies && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Allergies: </span>
            {p.allergies}
          </div>
        </div>
      )}

      <TriageForm
        visitId={visit.id}
        isFemale={p.gender === "FEMALE"}
        initial={{
          temperature: visit.temperature?.toString() ?? "",
          systolic: visit.systolic?.toString() ?? "",
          diastolic: visit.diastolic?.toString() ?? "",
          pulse: visit.pulse?.toString() ?? "",
          respRate: visit.respRate?.toString() ?? "",
          spo2: visit.spo2?.toString() ?? "",
          weightKg: visit.weightKg?.toString() ?? "",
          heightCm: visit.heightCm?.toString() ?? "",
          lmp: visit.lmp ?? "",
          triagePriority: visit.triagePriority ?? "NORMAL",
          triageNotes: visit.triageNotes ?? "",
        }}
      />
    </div>
  );
}
