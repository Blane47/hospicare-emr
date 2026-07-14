import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  formatDateTime,
  formatFCFA,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/constants";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["PHARMACIST", "ADMIN"]);
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: { include: { drug: true } },
      patient: true,
      pharmacist: true,
    },
  });
  if (!sale) notFound();

  return (
    <div className="mx-auto max-w-md">
      <div className="no-print mb-4 flex items-center justify-between">
        <Link
          href="/pharmacy/sales"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Sales
        </Link>
        <div className="flex gap-2">
          <PrintButton label="Print receipt" />
          <Button render={<Link href="/pharmacy/dispense" />}>Done</Button>
        </div>
      </div>

      {/* Printable receipt */}
      <div className="print-area bg-card rounded-lg border p-6 shadow-sm">
        <div className="mb-4 flex flex-col items-center border-b pb-4 text-center">
          <div className="mb-2 flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">HospiCare</span>
          </div>
          <p className="text-muted-foreground text-xs">
            HospiCare Medical Centre · Yaoundé, Cameroon
          </p>
          <p className="text-muted-foreground text-xs">Pharmacy Receipt</p>
        </div>

        <div className="mb-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Receipt No.</span>
            <span className="font-mono font-medium">{sale.saleNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{formatDateTime(sale.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient</span>
            <span>
              {sale.patient
                ? `${sale.patient.firstName} ${sale.patient.lastName}`
                : "Walk-in customer"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Served by</span>
            <span>{sale.pharmacist.name}</span>
          </div>
        </div>

        <table className="mb-4 w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b text-left text-xs">
              <th className="pb-1 font-medium">Item</th>
              <th className="pb-1 text-center font-medium">Qty</th>
              <th className="pb-1 text-right font-medium">Price</th>
              <th className="pb-1 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((it) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="py-1.5">
                  {it.drug.name} {it.drug.strength ?? ""}
                </td>
                <td className="py-1.5 text-center">{it.quantity}</td>
                <td className="py-1.5 text-right">{formatFCFA(it.unitPrice)}</td>
                <td className="py-1.5 text-right">{formatFCFA(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatFCFA(sale.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span>
              {PAYMENT_METHOD_LABELS[sale.paymentMethod as PaymentMethod] ??
                sale.paymentMethod}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground mt-6 text-center text-xs">
          Thank you for choosing HospiCare. Get well soon.
        </p>
      </div>
    </div>
  );
}
