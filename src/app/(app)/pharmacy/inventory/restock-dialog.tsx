"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PackagePlus } from "lucide-react";
import { adjustStock } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RestockDialog({
  drugId,
  drugName,
  currentStock,
}: {
  drugId: string;
  drugName: string;
  currentStock: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Stock purchase");
  const [isPending, startTransition] = useTransition();

  function submit() {
    const q = parseInt(quantity);
    if (!q) {
      toast.error("Enter a non-zero quantity (use a negative value to remove).");
      return;
    }
    startTransition(async () => {
      const res = await adjustStock({ drugId, quantity: q, reason });
      if (!res.ok) {
        toast.error(res.error ?? "Could not adjust stock.");
        return;
      }
      toast.success(`Stock updated for ${drugName}.`);
      setOpen(false);
      setQuantity("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PackagePlus className="h-4 w-4" /> Adjust
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock · {drugName}</DialogTitle>
          <DialogDescription>
            Current stock: {currentStock}. Enter a positive number to add stock,
            or a negative number to remove (e.g. expired or damaged).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="qty">Quantity change</Label>
            <Input
              id="qty"
              className="mt-1.5"
              inputMode="numeric"
              placeholder="e.g. 100 or -5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              className="mt-1.5"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
