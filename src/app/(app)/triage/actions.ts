"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { TRIAGE_PRIORITIES } from "@/lib/constants";

type TriageInput = {
  visitId: string;
  triagePriority: string;
  triageNotes?: string;
  temperature?: string;
  systolic?: string;
  diastolic?: string;
  pulse?: string;
  respRate?: string;
  spo2?: string;
  weightKg?: string;
  heightCm?: string;
  lmp?: string;
};

const num = (s?: string) => {
  if (!s || !s.trim()) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};
const int = (s?: string) => {
  if (!s || !s.trim()) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
};

export async function saveTriage(
  input: TriageInput,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireRole(["NURSE", "ADMIN"]);
  if (!input.visitId) return { ok: false, error: "Missing visit." };

  const visit = await prisma.visit.findUnique({ where: { id: input.visitId } });
  if (!visit) return { ok: false, error: "Visit not found." };
  if (visit.status === "COMPLETED" || visit.status === "CANCELLED") {
    return { ok: false, error: "This visit is already closed." };
  }

  const priority = (
    TRIAGE_PRIORITIES as readonly string[]
  ).includes(input.triagePriority)
    ? input.triagePriority
    : "NORMAL";

  await prisma.visit.update({
    where: { id: input.visitId },
    data: {
      temperature: num(input.temperature),
      systolic: int(input.systolic),
      diastolic: int(input.diastolic),
      pulse: int(input.pulse),
      respRate: int(input.respRate),
      spo2: int(input.spo2),
      weightKg: num(input.weightKg),
      heightCm: num(input.heightCm),
      lmp: input.lmp?.trim() || null,
      triagePriority: priority,
      triageNotes: input.triageNotes?.trim() || null,
      triagedById: user.id,
      triagedAt: new Date(),
      // Advance the queue only from the initial waiting state.
      status: visit.status === "WAITING" ? "TRIAGED" : visit.status,
    },
  });

  revalidatePath("/queue");
  revalidatePath("/triage");
  redirect("/triage");
}
