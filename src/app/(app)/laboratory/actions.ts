"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { LAB_FLAGS } from "@/lib/constants";

const resultsSchema = z.object({
  orderId: z.string().min(1),
  results: z.array(
    z.object({
      itemId: z.string().min(1),
      result: z.string().optional(),
      flag: z.enum(LAB_FLAGS).optional().or(z.literal("")),
    }),
  ),
});

export async function saveLabResults(
  input: z.input<typeof resultsSchema>,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["LAB_TECH", "ADMIN"]);
  const parsed = resultsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid results." };

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    for (const r of parsed.data.results) {
      await tx.labOrderItem.update({
        where: { id: r.itemId },
        data: {
          result: r.result?.trim() || null,
          flag: r.flag || null,
          resultedAt: r.result?.trim() ? now : null,
        },
      });
    }
    await tx.labOrder.update({
      where: { id: parsed.data.orderId },
      data: { status: "COMPLETED" },
    });
  });

  revalidatePath("/laboratory");
  revalidatePath("/consultations");
  return { ok: true };
}

export async function cancelLabOrder(orderId: string) {
  await requireRole(["LAB_TECH", "ADMIN"]);
  await prisma.labOrder.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/laboratory");
}
