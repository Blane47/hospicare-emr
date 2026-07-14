"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { visitSchema } from "@/lib/schemas";
import { nextVisitNumber } from "@/lib/ids";

export type VisitFormState = { ok: boolean; message?: string } | undefined;

/** Reception starts a new visit for a patient — enters the doctor queue. */
export async function createVisit(
  _prev: VisitFormState,
  formData: FormData,
): Promise<VisitFormState> {
  const user = await requireRole(["RECEPTIONIST", "ADMIN"]);

  const parsed = visitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please enter the reason for the visit." };
  }

  await prisma.visit.create({
    data: {
      visitNumber: await nextVisitNumber(),
      patientId: parsed.data.patientId,
      chiefComplaint: parsed.data.chiefComplaint,
      status: "WAITING",
      createdById: user.id,
    },
  });

  revalidatePath("/queue");
  revalidatePath(`/patients/${parsed.data.patientId}`);
  redirect("/queue");
}

/** Cancel a visit that hasn't been completed. */
export async function cancelVisit(visitId: string) {
  await requireRole(["RECEPTIONIST", "ADMIN"]);
  await prisma.visit.update({
    where: { id: visitId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/queue");
}
