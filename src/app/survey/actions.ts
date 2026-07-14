"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { surveyRoleByKey } from "@/lib/survey";

const schema = z.object({
  respondentName: z.string().optional(),
  hospital: z.string().optional(),
  respondentRole: z.string().min(1),
  answers: z.record(z.string(), z.unknown()),
});

// Public action — no auth required (the form is filled in by hospital staff).
export async function submitSurvey(input: {
  respondentName?: string;
  hospital?: string;
  respondentRole: string;
  answers: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid submission." };
  if (!surveyRoleByKey(parsed.data.respondentRole)) {
    return { ok: false, error: "Unknown role." };
  }

  await prisma.surveyResponse.create({
    data: {
      respondentName: parsed.data.respondentName?.trim() || null,
      hospital: parsed.data.hospital?.trim() || null,
      respondentRole: parsed.data.respondentRole,
      answers: JSON.stringify(parsed.data.answers),
    },
  });

  return { ok: true };
}
