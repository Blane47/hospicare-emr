import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateAge, GENDER_LABELS, type Gender } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { DispenseForm, type DispenseItem } from "./dispense-form";

export default async function DispensePage({
  params,
}: {
  params: Promise<{ prescriptionId: string }>;
}) {
  await requireRole(["PHARMACIST", "ADMIN"]);
  const { prescriptionId } = await params;

  const rx = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      items: { include: { drug: true } },
      consultation: { include: { visit: { include: { patient: true } } } },
    },
  });
  if (!rx) notFound();
  if (rx.status === "DISPENSED" || rx.status === "CANCELLED") {
    redirect("/pharmacy/dispense");
  }

  const patient = rx.consultation.visit.patient;
  const fullName = `${patient.firstName} ${patient.lastName}`;

  const items: DispenseItem[] = rx.items.map((it) => ({
    prescriptionItemId: it.id,
    drugId: it.drugId,
    name: it.drug.name,
    strength: it.drug.strength,
    unitPrice: it.drug.unitPrice,
    stock: it.drug.quantityInStock,
    prescribed: it.quantity,
    alreadyDispensed: it.quantityDispensed,
    remaining: it.quantity - it.quantityDispensed,
    dosage: it.dosage,
    frequency: it.frequency,
    instructions: it.instructions,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/pharmacy/dispense"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dispensing
      </Link>

      <PageHeader title={`Dispense · ${fullName}`} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {patient.patientNumber}
        </Badge>
        <Badge variant="outline">
          {GENDER_LABELS[patient.gender as Gender] ?? patient.gender}
        </Badge>
        <Badge variant="outline">{calculateAge(patient.dateOfBirth)} yrs</Badge>
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

      <DispenseForm prescriptionId={rx.id} items={items} />
    </div>
  );
}
