import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  calculateAge,
  formatDate,
  GENDER_LABELS,
  type Gender,
} from "@/lib/constants";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";

export default async function PrescriptionPrintPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  await requireRole(["DOCTOR", "PHARMACIST", "ADMIN"]);
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
  if (!visit?.consultation?.prescription) notFound();

  const { patient, consultation } = visit;
  const rx = consultation.prescription!;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          href={`/consultations/${visitId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to consultation
        </Link>
        <PrintButton label="Print prescription" />
      </div>

      <div className="print-area bg-card rounded-lg border p-8 shadow-sm">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold">HospiCare Medical Centre</div>
              <div className="text-muted-foreground text-xs">
                Yaoundé, Cameroon · Tel: +237 6XX XXX XXX
              </div>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="text-muted-foreground">Date</div>
            <div className="font-medium">{formatDate(rx.createdAt)}</div>
          </div>
        </div>

        <h1 className="mt-6 text-center text-sm font-semibold uppercase tracking-widest">
          Medical Prescription
        </h1>

        {/* Patient block */}
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient</span>
            <span className="font-medium">
              {patient.firstName} {patient.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient No.</span>
            <span className="font-mono">{patient.patientNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Age / Sex</span>
            <span>
              {calculateAge(patient.dateOfBirth)} yrs ·{" "}
              {GENDER_LABELS[patient.gender as Gender] ?? patient.gender}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diagnosis</span>
            <span className="font-medium">{consultation.diagnosis ?? "—"}</span>
          </div>
        </div>

        {patient.allergies && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            <span className="font-semibold">Allergies:</span> {patient.allergies}
          </div>
        )}

        {/* Rx */}
        <div className="mt-6">
          <div className="mb-2 font-serif text-2xl italic">℞</div>
          <ol className="space-y-4">
            {rx.items.map((it, i) => (
              <li key={it.id} className="flex gap-3 text-sm">
                <span className="text-muted-foreground">{i + 1}.</span>
                <div>
                  <div className="font-semibold">
                    {it.drug.name} {it.drug.strength ?? ""}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({it.drug.form.toLowerCase()})
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {it.dosage} — {it.frequency}
                    {it.durationDays ? ` — for ${it.durationDays} days` : ""} ·
                    Qty: {it.quantity}
                  </div>
                  {it.instructions && (
                    <div className="text-muted-foreground italic">
                      {it.instructions}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {rx.notes && (
          <p className="text-muted-foreground mt-6 text-sm">
            <span className="font-medium">Note:</span> {rx.notes}
          </p>
        )}

        {/* Signature */}
        <div className="mt-12 flex items-end justify-end">
          <div className="text-center">
            <div className="border-foreground/40 w-48 border-t pt-1 text-sm font-medium">
              {consultation.doctor.name}
            </div>
            <div className="text-muted-foreground text-xs">
              Attending Physician · Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
