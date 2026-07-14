import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateAge, GENDER_LABELS, type Gender } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { LabResultsForm } from "./lab-results-form";

export default async function LabResultsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireRole(["LAB_TECH", "ADMIN"]);
  const { orderId } = await params;

  const order = await prisma.labOrder.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { labTest: true } },
      consultation: { include: { visit: { include: { patient: true } } } },
    },
  });
  if (!order) notFound();
  if (order.status === "CANCELLED") redirect("/laboratory");

  const patient = order.consultation.visit.patient;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/laboratory"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to laboratory
      </Link>

      <PageHeader
        title={`Lab results · ${patient.firstName} ${patient.lastName}`}
        description={order.notes ?? undefined}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          {patient.patientNumber}
        </Badge>
        <Badge variant="outline">
          {GENDER_LABELS[patient.gender as Gender] ?? patient.gender}
        </Badge>
        <Badge variant="outline">{calculateAge(patient.dateOfBirth)} yrs</Badge>
      </div>

      <LabResultsForm
        orderId={order.id}
        items={order.items.map((it) => ({
          id: it.id,
          name: it.labTest.name,
          unit: it.labTest.unit,
          referenceRange: it.labTest.referenceRange,
          result: it.result,
          flag: it.flag,
        }))}
      />
    </div>
  );
}
