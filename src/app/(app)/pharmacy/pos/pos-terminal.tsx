"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, ShoppingCart } from "lucide-react";
import { createWalkInSale } from "../actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DrugOption = {
  id: string;
  name: string;
  strength: string | null;
  unitPrice: number;
  quantityInStock: number;
};

type Line = { key: string; drugId: string; quantity: string };

let seq = 0;
const newLine = (): Line => ({ key: `l-${seq++}`, drugId: "", quantity: "1" });

export function PosTerminal({ drugs }: { drugs: DrugOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [lines, setLines] = useState<Line[]>([newLine()]);

  const drugById = (id: string) => drugs.find((d) => d.id === id);
  const update = (key: string, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const remove = (key: string) =>
    setLines((prev) => prev.filter((l) => l.key !== key));

  const total = lines.reduce((sum, l) => {
    const drug = drugById(l.drugId);
    const q = parseInt(l.quantity) || 0;
    return sum + (drug ? drug.unitPrice * q : 0);
  }, 0);

  function checkout() {
    const valid = lines.filter((l) => l.drugId && (parseInt(l.quantity) || 0) > 0);
    if (valid.length === 0) {
      toast.error("Add at least one drug with a quantity.");
      return;
    }
    for (const l of valid) {
      const drug = drugById(l.drugId)!;
      if ((parseInt(l.quantity) || 0) > drug.quantityInStock) {
        toast.error(`Only ${drug.quantityInStock} of ${drug.name} in stock.`);
        return;
      }
    }

    startTransition(async () => {
      const res = await createWalkInSale({
        paymentMethod: paymentMethod as PaymentMethod,
        lines: valid.map((l) => ({ drugId: l.drugId, quantity: l.quantity })),
      });
      if (!res.ok || !res.saleId) {
        toast.error(res.error ?? "Could not complete sale.");
        return;
      }
      toast.success("Sale completed.");
      router.push(`/pharmacy/sales/${res.saleId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Items</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLines((prev) => [...prev, newLine()])}
          >
            <Plus className="h-4 w-4" /> Add item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lines.map((l) => {
            const drug = drugById(l.drugId);
            const q = parseInt(l.quantity) || 0;
            return (
              <div key={l.key} className="flex items-start gap-3">
                <div className="flex-1">
                  <Select
                    value={l.drugId || undefined}
                    onValueChange={(v) => update(l.key, { drugId: v as string })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select drug" />
                    </SelectTrigger>
                    <SelectContent>
                      {drugs.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} {d.strength ?? ""} · {formatFCFA(d.unitPrice)} ·{" "}
                          {d.quantityInStock} in stock
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  className="w-20"
                  inputMode="numeric"
                  value={l.quantity}
                  onChange={(e) => update(l.key, { quantity: e.target.value })}
                />
                <div className="w-28 pt-2 text-right text-sm font-medium">
                  {formatFCFA(drug ? drug.unitPrice * q : 0)}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(l.key)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
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
          <div className="text-muted-foreground text-xs">Total</div>
          <div className="text-2xl font-semibold">{formatFCFA(total)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={checkout} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          Complete sale
        </Button>
      </div>
    </div>
  );
}
