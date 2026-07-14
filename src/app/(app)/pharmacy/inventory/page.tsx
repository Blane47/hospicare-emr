import Link from "next/link";
import { Package, Plus, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  formatFCFA,
  formatDate,
  drugExpiryStatus,
  DRUG_FORM_LABELS,
  type DrugForm,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { PatientSearch } from "../../patients/patient-search";
import { RestockDialog } from "./restock-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; highlight?: string }>;
}) {
  await requireRole(["PHARMACIST", "ADMIN"]);
  const { q, highlight } = await searchParams;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { genericName: { contains: q, mode: "insensitive" as const } },
          { category: { contains: q, mode: "insensitive" as const } },
          { sku: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const drugs = await prisma.drug.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const lowStock = drugs.filter((d) => d.quantityInStock <= d.reorderLevel);
  const expiredCount = drugs.filter(
    (d) => drugExpiryStatus(d.expiryDate) === "expired",
  ).length;
  const expiringCount = drugs.filter(
    (d) => drugExpiryStatus(d.expiryDate) === "expiring",
  ).length;

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Drug catalogue and stock levels."
      >
        <Button render={<Link href="/pharmacy/inventory/new" />}>
          <Plus className="h-4 w-4" /> Add drug
        </Button>
      </PageHeader>

      {lowStock.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">{lowStock.length}</span> drug(s) at
            or below reorder level — consider restocking.
          </span>
        </div>
      )}

      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span>
            {expiredCount > 0 && (
              <>
                <span className="font-semibold">{expiredCount}</span> drug(s)
                expired
              </>
            )}
            {expiredCount > 0 && expiringCount > 0 && " · "}
            {expiringCount > 0 && (
              <>
                <span className="font-semibold">{expiringCount}</span> expiring
                within {90} days
              </>
            )}
            {" — review stock."}
          </span>
        </div>
      )}

      <div className="mb-4">
        <PatientSearch placeholder="Search drugs by name, generic or category…" />
      </div>

      <Card className="overflow-hidden p-0">
        {drugs.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Package className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">No drugs found</p>
            <p className="text-muted-foreground text-sm">
              {q ? "Try a different search." : "Add your first drug to the catalogue."}
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reorder</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drugs.map((d) => {
                const low = d.quantityInStock <= d.reorderLevel;
                return (
                  <TableRow
                    key={d.id}
                    className={cn(
                      highlight === d.id && "bg-primary/5",
                    )}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {d.name} {d.strength ?? ""}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {d.genericName ?? d.category ?? d.sku}
                      </div>
                    </TableCell>
                    <TableCell>
                      {DRUG_FORM_LABELS[d.form as DrugForm] ?? d.form}
                    </TableCell>
                    <TableCell>{formatFCFA(d.unitPrice)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "font-medium",
                          low && "text-amber-600 dark:text-amber-400",
                          d.quantityInStock === 0 && "text-destructive",
                        )}
                      >
                        {d.quantityInStock}
                      </span>
                      {low && (
                        <Badge
                          variant="outline"
                          className="ml-2 border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
                        >
                          Low
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.reorderLevel}
                    </TableCell>
                    <TableCell className="text-xs">
                      {(() => {
                        const s = drugExpiryStatus(d.expiryDate);
                        return (
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">
                              {d.expiryDate ? formatDate(d.expiryDate) : "—"}
                            </span>
                            {s === "expired" && (
                              <Badge
                                variant="outline"
                                className="border-red-200 bg-red-100 text-red-800 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300"
                              >
                                Expired
                              </Badge>
                            )}
                            {s === "expiring" && (
                              <Badge
                                variant="outline"
                                className="border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300"
                              >
                                Soon
                              </Badge>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <RestockDialog
                        drugId={d.id}
                        drugName={d.name}
                        currentStock={d.quantityInStock}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
