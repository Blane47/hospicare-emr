"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { drugSchema, stockAdjustmentSchema, fieldErrors } from "@/lib/schemas";
import { nextSaleNumber, nextDrugSku } from "@/lib/ids";
import { PAYMENT_METHODS } from "@/lib/constants";

// ---------------------------------------------------------------------------
//  Shared sale engine — used by both prescription dispensing and walk-in POS.
//  Runs in a transaction so stock, ledger, sale and prescription stay consistent.
// ---------------------------------------------------------------------------
type SaleLine = {
  drugId: string;
  quantity: number;
  prescriptionItemId?: string;
};

async function recordSale(opts: {
  pharmacistId: string;
  patientId?: string | null;
  prescriptionId?: string | null;
  paymentMethod: string;
  lines: SaleLine[];
}): Promise<{ ok: boolean; error?: string; saleId?: string }> {
  const lines = opts.lines.filter((l) => l.quantity > 0);
  if (lines.length === 0) return { ok: false, error: "No items to dispense." };

  const saleNumber = await nextSaleNumber();

  try {
    const saleId = await prisma.$transaction(async (tx) => {
      // Load drugs and check stock up front.
      const drugIds = [...new Set(lines.map((l) => l.drugId))];
      const drugs = await tx.drug.findMany({ where: { id: { in: drugIds } } });
      const drugMap = new Map(drugs.map((d) => [d.id, d]));

      const saleItems = lines.map((l) => {
        const drug = drugMap.get(l.drugId);
        if (!drug) throw new Error("Drug not found.");
        if (l.quantity > drug.quantityInStock) {
          throw new Error(
            `Not enough stock of ${drug.name} (have ${drug.quantityInStock}, need ${l.quantity}).`,
          );
        }
        return {
          drugId: drug.id,
          quantity: l.quantity,
          unitPrice: drug.unitPrice,
          subtotal: drug.unitPrice * l.quantity,
        };
      });

      const total = saleItems.reduce((s, it) => s + it.subtotal, 0);

      const sale = await tx.sale.create({
        data: {
          saleNumber,
          patientId: opts.patientId ?? null,
          prescriptionId: opts.prescriptionId ?? null,
          pharmacistId: opts.pharmacistId,
          totalAmount: total,
          amountPaid: total,
          paymentMethod: opts.paymentMethod,
          items: { create: saleItems },
        },
      });

      // Decrement stock + write ledger entries.
      for (const l of lines) {
        const updated = await tx.drug.update({
          where: { id: l.drugId },
          data: { quantityInStock: { decrement: l.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            drugId: l.drugId,
            type: "DISPENSE",
            quantity: -l.quantity,
            balanceAfter: updated.quantityInStock,
            reason: `Sale ${saleNumber}`,
            userId: opts.pharmacistId,
          },
        });
        // Update prescription item progress if this line came from one.
        if (l.prescriptionItemId) {
          await tx.prescriptionItem.update({
            where: { id: l.prescriptionItemId },
            data: { quantityDispensed: { increment: l.quantity } },
          });
        }
      }

      // Recompute prescription + visit status.
      if (opts.prescriptionId) {
        const rx = await tx.prescription.findUnique({
          where: { id: opts.prescriptionId },
          include: { items: true, consultation: true },
        });
        if (rx) {
          const fully = rx.items.every(
            (it) => it.quantityDispensed >= it.quantity,
          );
          const any = rx.items.some((it) => it.quantityDispensed > 0);
          await tx.prescription.update({
            where: { id: rx.id },
            data: {
              status: fully
                ? "DISPENSED"
                : any
                  ? "PARTIALLY_DISPENSED"
                  : "PENDING",
            },
          });
          if (fully) {
            await tx.visit.update({
              where: { id: rx.consultation.visitId },
              data: { status: "COMPLETED" },
            });
          }
        }
      }

      return sale.id;
    });

    revalidatePath("/pharmacy/dispense");
    revalidatePath("/pharmacy/inventory");
    revalidatePath("/pharmacy/sales");
    revalidatePath("/queue");
    return { ok: true, saleId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not complete the sale.",
    };
  }
}

// ---------------------------------------------------------------------------
//  Dispense a prescription (pharmacist)
// ---------------------------------------------------------------------------
const dispenseSchema = z.object({
  prescriptionId: z.string().min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
  lines: z
    .array(
      z.object({
        prescriptionItemId: z.string().min(1),
        drugId: z.string().min(1),
        quantity: z.coerce.number().int().min(0),
      }),
    )
    .min(1),
});

export async function dispensePrescription(
  input: z.input<typeof dispenseSchema>,
): Promise<{ ok: boolean; error?: string; saleId?: string }> {
  const user = await requireRole(["PHARMACIST", "ADMIN"]);
  const parsed = dispenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid dispensing data." };

  const rx = await prisma.prescription.findUnique({
    where: { id: parsed.data.prescriptionId },
    include: { consultation: { include: { visit: true } } },
  });
  if (!rx) return { ok: false, error: "Prescription not found." };

  return recordSale({
    pharmacistId: user.id,
    patientId: rx.consultation.visit.patientId,
    prescriptionId: rx.id,
    paymentMethod: parsed.data.paymentMethod,
    lines: parsed.data.lines.map((l) => ({
      drugId: l.drugId,
      quantity: l.quantity,
      prescriptionItemId: l.prescriptionItemId,
    })),
  });
}

// ---------------------------------------------------------------------------
//  Walk-in point of sale (pharmacist)
// ---------------------------------------------------------------------------
const posSchema = z.object({
  patientId: z.string().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  lines: z
    .array(
      z.object({
        drugId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, "Add at least one item."),
});

export async function createWalkInSale(
  input: z.input<typeof posSchema>,
): Promise<{ ok: boolean; error?: string; saleId?: string }> {
  const user = await requireRole(["PHARMACIST", "ADMIN"]);
  const parsed = posSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid sale." };
  }
  return recordSale({
    pharmacistId: user.id,
    patientId: parsed.data.patientId || null,
    paymentMethod: parsed.data.paymentMethod,
    lines: parsed.data.lines,
  });
}

// ---------------------------------------------------------------------------
//  Inventory management
// ---------------------------------------------------------------------------
export type DrugFormState =
  | { ok: boolean; message?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function createDrug(
  _prev: DrugFormState,
  formData: FormData,
): Promise<DrugFormState> {
  await requireRole(["PHARMACIST", "ADMIN"]);
  const parsed = drugSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const d = parsed.data;
  const initialStock = Number(formData.get("initialStock") ?? 0) || 0;

  const drug = await prisma.drug.create({
    data: {
      sku: await nextDrugSku(),
      name: d.name,
      genericName: d.genericName || null,
      category: d.category || null,
      form: d.form,
      strength: d.strength || null,
      unitPrice: d.unitPrice,
      reorderLevel: d.reorderLevel,
      quantityInStock: initialStock,
      stockMovements:
        initialStock > 0
          ? {
              create: {
                type: "PURCHASE",
                quantity: initialStock,
                balanceAfter: initialStock,
                reason: "Initial stock",
              },
            }
          : undefined,
    },
  });

  revalidatePath("/pharmacy/inventory");
  redirect(`/pharmacy/inventory?highlight=${drug.id}`);
}

export async function adjustStock(
  input: z.input<typeof stockAdjustmentSchema>,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireRole(["PHARMACIST", "ADMIN"]);
  const parsed = stockAdjustmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { drugId, quantity, reason } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const drug = await tx.drug.findUnique({ where: { id: drugId } });
      if (!drug) throw new Error("Drug not found.");
      const newBalance = drug.quantityInStock + quantity;
      if (newBalance < 0) throw new Error("Adjustment would make stock negative.");
      await tx.drug.update({
        where: { id: drugId },
        data: { quantityInStock: newBalance },
      });
      await tx.stockMovement.create({
        data: {
          drugId,
          type: quantity > 0 ? "PURCHASE" : "ADJUSTMENT",
          quantity,
          balanceAfter: newBalance,
          reason,
          userId: user.id,
        },
      });
    });
    revalidatePath("/pharmacy/inventory");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}
