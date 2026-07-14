import Link from "next/link";
import { Receipt, ShoppingCart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  formatDateTime,
  formatFCFA,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SalesPage() {
  await requireRole(["PHARMACIST", "ADMIN"]);

  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { patient: true, pharmacist: true, _count: { select: { items: true } } },
  });

  return (
    <div>
      <PageHeader title="Sales" description="Pharmacy sales and receipts.">
        <Button render={<Link href="/pharmacy/pos" />}>
          <ShoppingCart className="h-4 w-4" /> New sale
        </Button>
      </PageHeader>

      <Card className="overflow-hidden p-0">
        {sales.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Receipt className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">No sales yet</p>
            <p className="text-muted-foreground text-sm">
              Dispensed prescriptions and walk-in sales will appear here.
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receipt&nbsp;#</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatDateTime(s.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/pharmacy/sales/${s.id}`}
                      className="text-primary hover:underline"
                    >
                      {s.saleNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {s.patient
                      ? `${s.patient.firstName} ${s.patient.lastName}`
                      : "Walk-in"}
                  </TableCell>
                  <TableCell>{s._count.items}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {PAYMENT_METHOD_LABELS[
                        s.paymentMethod as PaymentMethod
                      ] ?? s.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatFCFA(s.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
