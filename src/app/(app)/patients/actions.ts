"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { patientSchema, fieldErrors } from "@/lib/schemas";
import { nextPatientNumber } from "@/lib/ids";

export type PatientFormState =
  | { ok: boolean; message?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function createPatient(
  _prev: PatientFormState,
  formData: FormData,
): Promise<PatientFormState> {
  const user = await requireRole(["RECEPTIONIST", "ADMIN"]);

  const raw = Object.fromEntries(formData);
  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }

  const d = parsed.data;
  const patient = await prisma.patient.create({
    data: {
      patientNumber: await nextPatientNumber(),
      firstName: d.firstName,
      lastName: d.lastName,
      gender: d.gender,
      dateOfBirth: new Date(d.dateOfBirth),
      phone: d.phone || null,
      email: d.email || null,
      address: d.address || null,
      city: d.city || null,
      region: d.region || null,
      bloodGroup: d.bloodGroup || null,
      allergies: d.allergies || null,
      emergencyContactName: d.emergencyContactName || null,
      emergencyContactPhone: d.emergencyContactPhone || null,
      createdById: user.id,
    },
  });

  revalidatePath("/patients");
  redirect(`/patients/${patient.id}`);
}
