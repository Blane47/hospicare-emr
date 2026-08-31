"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

/** Doctor claims a triaged visit → status becomes WITH_DOCTOR. */
export async function openConsultation(visitId: string) {
  await requireRole(["DOCTOR", "ADMIN"]);
  await prisma.visit.updateMany({
    where: { id: visitId, status: "TRIAGED" },
    data: { status: "WITH_DOCTOR" },
  });
  redirect(`/consultations/${visitId}`);
}

const payloadSchema = z.object({
  visitId: z.string().min(1),
  symptoms: z.string().optional(),
  diagnosis: z.string().trim().min(1, "Diagnosis is required"),
  notes: z.string().optional(),
  prescriptionNotes: z.string().optional(),
  items: z
    .array(
      z.object({
        drugId: z.string().min(1),
        dosage: z.string().trim().min(1),
        frequency: z.string().trim().min(1),
        durationDays: z.coerce.number().int().positive().optional().nullable(),
        quantity: z.coerce.number().int().positive(),
        instructions: z.string().optional(),
      }),
    )
    .default([]),
  labTestIds: z.array(z.string()).default([]),
});

export type ConsultationPayload = z.input<typeof payloadSchema>;
export type SaveResult = { ok: boolean; error?: string };

/**
 * Saves the doctor's consultation for a visit: vitals + diagnosis, and an
 * optional prescription. Sending a prescription routes the visit to the
 * pharmacy; no prescription completes the visit.
 */
export async function saveConsultation(
  input: ConsultationPayload,
): Promise<SaveResult> {
  const user = await requireRole(["DOCTOR", "ADMIN"]);

  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid data";
    return { ok: false, error: first };
  }
  const d = parsed.data;

  const visit = await prisma.visit.findUnique({
    where: { id: d.visitId },
    include: { consultation: true },
  });
  if (!visit) return { ok: false, error: "Visit not found" };
  if (visit.status === "COMPLETED" || visit.status === "CANCELLED") {
    return { ok: false, error: "This visit is already closed." };
  }

  const clinical = {
    symptoms: d.symptoms || null,
    diagnosis: d.diagnosis,
    notes: d.notes || null,
  };

  // Upsert the consultation (1:1 with the visit). Vitals live on the visit
  // (recorded by the nurse at triage), so they are not written here.
  const consultation = visit.consultation
    ? await prisma.consultation.update({
        where: { id: visit.consultation.id },
        data: clinical,
      })
    : await prisma.consultation.create({
        data: { visitId: visit.id, doctorId: user.id, ...clinical },
      });

  // Replace any existing (undispensed) prescription with the new one.
  await prisma.prescription.deleteMany({
    where: { consultationId: consultation.id },
  });

  if (d.items.length > 0) {
    await prisma.prescription.create({
      data: {
        consultationId: consultation.id,
        status: "PENDING",
        notes: d.prescriptionNotes || null,
        items: {
          create: d.items.map((it) => ({
            drugId: it.drugId,
            dosage: it.dosage,
            frequency: it.frequency,
            durationDays: it.durationDays ?? null,
            quantity: it.quantity,
            instructions: it.instructions || null,
          })),
        },
      },
    });
    await prisma.visit.update({
      where: { id: visit.id },
      data: { status: "PHARMACY" },
    });
  } else {
    await prisma.visit.update({
      where: { id: visit.id },
      data: { status: "COMPLETED" },
    });
  }

  // Replace any pending (unresulted) lab order with the newly selected tests.
  await prisma.labOrder.deleteMany({
    where: { consultationId: consultation.id, status: "ORDERED" },
  });
  if (d.labTestIds.length > 0) {
    await prisma.labOrder.create({
      data: {
        consultationId: consultation.id,
        status: "ORDERED",
        orderedById: user.id,
        items: { create: d.labTestIds.map((id) => ({ labTestId: id })) },
      },
    });
  }

  revalidatePath("/queue");
  revalidatePath("/consultations");
  revalidatePath("/pharmacy/dispense");
  revalidatePath("/laboratory");
  return { ok: true };
}
