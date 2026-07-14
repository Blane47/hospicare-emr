"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { dispensePrescription } from "../../actions";
import {
  formatFCFA,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/select-field";

export type DispenseItem = {
  prescriptionItemId: string;
  drugId: string;
  name: string;
  strength: string | null;
  unitPrice: number;
  stock: number;
  prescribed: number;
  alreadyDispensed: number;
  remaining: number;
  dosage: string;
  frequency: string;
  instructions: string | null;
};

export function DispenseForm({
  prescriptionId,
  items,
}: {
  prescriptionId: string;
  items: DispenseItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [qty, setQty] = useState<Record<string, string>>(
    Object.fromEntries(
      items.map((it) => [
        it.prescriptionItemId,
        String(Math.min(it.remaining, it.stock)),
      ]),
    ),
  );

  const total = items.reduce((sum, it) => {
    const q = parseInt(qty[it.prescriptionItemId]) || 0;
    return sum + it.unitPrice * q;
  }, 0);

  function confirm() {
    const lines = items.map((it) => ({
      prescriptionItemId: it.prescriptionItemId,
      drugId: it.drugId,
      quantity: parseInt(qty[it.prescriptionItemId]) || 0,
    }));
    if (lines.every((l) => l.quantity === 0)) {
      toast.error("Enter a quantity for at least one drug.");
      return;
    }
    for (const it of items) {
      const q = parseInt(qty[it.prescriptionItemId]) || 0;
      if (q > it.stock) {
        toast.error(`Only ${it.stock} of ${it.name} in stock.`);
        return;
      }
    }

    startTransition(async () => {
      const res = await dispensePrescription({
        prescriptionId,
        paymentMethod: paymentMethod as PaymentMethod,
        lines,
      });
      if (!res.ok || !res.saleId) {
        toast.error(res.error ?? "Could not dispense prescription.");
        return;
      }
      toast.success("Dispensed. Generating receipt…");
      router.push(`/pharmacy/sales/${res.saleId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Prescribed drugs</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground bg-muted/40 text-left text-xs">
                <th className="p-3 font-medium">Drug</th>
                <th className="p-3 font-medium">Instructions</th>
                <th className="p-3 font-medium">In stock</th>
                <th className="p-3 font-medium">Remaining</th>
                <th className="p-3 font-medium">Unit price</th>
                <th className="p-3 font-medium">Dispense</th>
                <th className="p-3 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const q = parseInt(qty[it.prescriptionItemId]) || 0;
                const outOfStock = it.stock === 0;
                return (
                  <tr key={it.prescriptionItemId} className="border-t">
                    <td className="p-3">
                      <div className="font-medium">
                        {it.name} {it.strength ?? ""}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {it.dosage} · {it.frequency}
                      </div>
                    </td>
                    <td className="text-muted-foreground p-3 text-xs">
                      {it.instructions ?? "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          it.stock < it.remaining
                            ? "text-destructive font-medium"
                            : ""
                        }
                      >
                        {it.stock}
                      </span>
                    </td>
                    <td className="p-3">{it.remaining}</td>
                    <td className="p-3">{formatFCFA(it.unitPrice)}</td>
                    <td className="p-3">
                      <Input
                        className="w-20"
                        inputMode="numeric"
                        disabled={outOfStock}
                        value={qty[it.prescriptionItemId]}
                        onChange={(e) =>
                          setQty((prev) => ({
                            ...prev,
                            [it.prescriptionItemId]: e.target.value,
                          }))
                        }
                      />
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatFCFA(it.unitPrice * q)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Label className="mb-1.5 block">Payment method</Label>
          <SelectField
            name="paymentMethod"
            defaultValue="CASH"
            onChange={setPaymentMethod}
            options={PAYMENT_METHODS.map((m) => ({
              value: m,
              label: PAYMENT_METHOD_LABELS[m],
            }))}
          />
        </div>
        <div className="text-right">
          <div className="text-muted-foreground text-xs">Total to pay</div>
          <div className="text-2xl font-semibold">{formatFCFA(total)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={confirm} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Confirm &amp; dispense
        </Button>
      </div>
    </div>
  );
}
