import { prisma } from "@/lib/prisma";

// Human-readable sequential identifiers (P-000001, V-000001, RCP-000001, DRG-0001).
// Count-based numbering is sufficient for this system's scale.

export async function nextPatientNumber(): Promise<string> {
  const count = await prisma.patient.count();
  return `P-${String(count + 1).padStart(6, "0")}`;
}

export async function nextVisitNumber(): Promise<string> {
  const count = await prisma.visit.count();
  return `V-${String(count + 1).padStart(6, "0")}`;
}

export async function nextSaleNumber(): Promise<string> {
  const count = await prisma.sale.count();
  return `RCP-${String(count + 1).padStart(6, "0")}`;
}

export async function nextDrugSku(): Promise<string> {
  const count = await prisma.drug.count();
  return `DRG-${String(count + 1).padStart(4, "0")}`;
}
