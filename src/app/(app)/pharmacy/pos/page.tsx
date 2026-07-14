import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PosTerminal } from "./pos-terminal";

export default async function PosPage() {
  await requireRole(["PHARMACIST", "ADMIN"]);

  const drugs = await prisma.drug.findMany({
    where: { active: true, quantityInStock: { gt: 0 } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      strength: true,
      unitPrice: true,
      quantityInStock: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Point of Sale"
        description="Sell drugs directly to walk-in customers."
      />
      <PosTerminal drugs={drugs} />
    </div>
  );
}
