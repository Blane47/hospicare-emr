"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { saveLabResults } from "../actions";
import { LAB_FLAGS, type LabFlag } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/select-field";

const FLAG_LABELS: Record<LabFlag, string> = {
  NORMAL: "Normal",
  HIGH: "High",
  LOW: "Low",
  ABNORMAL: "Abnormal",
};

export type LabItem = {
  id: string;
  name: string;
  unit: string | null;
  referenceRange: string | null;
  result: string | null;
  flag: string | null;
};

export function LabResultsForm({
  orderId,
  items,
}: {
  orderId: string;
  items: LabItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<
    Record<string, { result: string; flag: string }>
  >(
    Object.fromEntries(
      items.map((it) => [
        it.id,
        { result: it.result ?? "", flag: it.flag ?? "" },
      ]),
    ),
  );

  const set = (id: string, patch: Partial<{ result: string; flag: string }>) =>
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  function submit() {
    if (items.every((it) => !values[it.id].result.trim())) {
      toast.error("Enter at least one result.");
      return;
    }
    startTransition(async () => {
      const res = await saveLabResults({
        orderId,
        results: items.map((it) => ({
          itemId: it.id,
          result: values[it.id].result,
          flag: (values[it.id].flag as LabFlag) || "",
        })),
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not save results.");
        return;
      }
      toast.success("Results saved.");
      router.push("/laboratory");
      router.refresh();
    });
  }

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground bg-muted/40 text-left text-xs">
              <th className="p-3 font-medium">Test</th>
              <th className="p-3 font-medium">Reference</th>
              <th className="p-3 font-medium">Result</th>
              <th className="p-3 font-medium">Flag</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3 font-medium">{it.name}</td>
                <td className="text-muted-foreground p-3 text-xs">
                  {it.referenceRange || "—"}
                  {it.unit ? ` ${it.unit}` : ""}
                </td>
                <td className="p-3">
                  <Input
                    className="w-40"
                    value={values[it.id].result}
                    placeholder="Value"
                    onChange={(e) => set(it.id, { result: e.target.value })}
                  />
                </td>
                <td className="p-3">
                  <div className="w-36">
                    <SelectField
                      name={`flag-${it.id}`}
                      defaultValue={it.flag ?? ""}
                      placeholder="—"
                      onChange={(v) => set(it.id, { flag: v })}
                      options={LAB_FLAGS.map((f) => ({
                        value: f,
                        label: FLAG_LABELS[f],
                      }))}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end border-t p-4">
        <Button onClick={submit} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Save results
        </Button>
      </div>
    </Card>
  );
}
