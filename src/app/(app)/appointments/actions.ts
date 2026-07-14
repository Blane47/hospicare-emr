"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { nextVisitNumber } from "@/lib/ids";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  scheduledFor: z.string().min(1, "Date & time is required"),
  reason: z.string().optional(),
  doctorId: z.string().optional(),
});

export async function createAppointment(input: {
  patientId: string;
  scheduledFor: string;
  reason?: string;
  doctorId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireRole(["RECEPTIONIST", "ADMIN"]);
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }
  const when = new Date(parsed.data.scheduledFor);
  if (isNaN(when.getTime())) return { ok: false, error: "Invalid date & time." };

  await prisma.appointment.create({
    data: {
      patientId: parsed.data.patientId,
      scheduledFor: when,
      reason: parsed.data.reason || null,
      doctorId: parsed.data.doctorId || null,
      createdById: user.id,
    },
  });
  revalidatePath("/appointments");
  return { ok: true };
}

/** Check a patient in for their appointment — creates a queue visit. */
export async function checkInAppointment(appointmentId: string) {
  const user = await requireRole(["RECEPTIONIST", "ADMIN"]);
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.status !== "SCHEDULED") return;

  const visit = await prisma.visit.create({
    data: {
      visitNumber: await nextVisitNumber(),
      patientId: appt.patientId,
      chiefComplaint: appt.reason ?? "Scheduled appointment",
      status: "WAITING",
      createdById: user.id,
    },
  });
  await prisma.appointment.update({
    where: { id: appt.id },
    data: { status: "CHECKED_IN", visitId: visit.id },
  });

  revalidatePath("/appointments");
  revalidatePath("/queue");
  redirect("/queue");
}

export async function setAppointmentStatus(appointmentId: string, status: string) {
  await requireRole(["RECEPTIONIST", "ADMIN"]);
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
  revalidatePath("/appointments");
}
