"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { saveTriage } from "../actions";
import {
  TRIAGE_PRIORITIES,
  TRIAGE_PRIORITY_LABELS,
  type TriagePriority,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Fields = {
  temperature: string;
  systolic: string;
  diastolic: string;
  pulse: string;
  respRate: string;
  spo2: string;
  weightKg: string;
  heightCm: string;
  lmp: string;
  triagePriority: string;
  triageNotes: string;
};

const PRIORITY_BTN: Record<TriagePriority, string> = {
  NORMAL: "data-[on=true]:border-emerald-400 data-[on=true]:bg-emerald-50 data-[on=true]:text-emerald-700 dark:data-[on=true]:bg-emerald-500/15 dark:data-[on=true]:text-emerald-300",
  URGENT: "data-[on=true]:border-amber-400 data-[on=true]:bg-amber-50 data-[on=true]:text-amber-700 dark:data-[on=true]:bg-amber-500/15 dark:data-[on=true]:text-amber-300",
  EMERGENCY: "data-[on=true]:border-red-400 data-[on=true]:bg-red-50 data-[on=true]:text-red-700 dark:data-[on=true]:bg-red-500/15 dark:data-[on=true]:text-red-300",
};

const VITALS: { key: keyof Fields; label: string; placeholder?: string }[] = [
  { key: "temperature", label: "Temp (°C)", placeholder: "37.0" },
  { key: "systolic", label: "Systolic", placeholder: "120" },
  { key: "diastolic", label: "Diastolic", placeholder: "80" },
  { key: "pulse", label: "Pulse (bpm)", placeholder: "72" },
  { key: "respRate", label: "Resp. rate", placeholder: "16" },
  { key: "spo2", label: "SpO₂ (%)", placeholder: "98" },
  { key: "weightKg", label: "Weight (kg)" },
  { key: "heightCm", label: "Height (cm)" },
];

export function TriageForm({
  visitId,
  isFemale,
  initial,
}: {
  visitId: string;
  isFemale: boolean;
  initial: Fields;
}) {
  const [isPending, startTransition] = useTransition();
  const [f, setF] = useState<Fields>(initial);
  const set = (k: keyof Fields, v: string) => setF((p) => ({ ...p, [k]: v }));

  function submit() {
    startTransition(async () => {
      const res = await saveTriage({ visitId, ...f });
      if (res?.ok === false) {
        toast.error(res.error ?? "Could not save triage.");
        return;
      }
      toast.success("Triage recorded — patient sent to the doctor.");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vital signs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {VITALS.map((v) => (
              <div key={v.key}>
                <Label htmlFor={v.key}>{v.label}</Label>
                <Input
                  id={v.key}
                  inputMode="decimal"
                  className="mt-1.5"
                  placeholder={v.placeholder}
                  value={f[v.key]}
                  onChange={(e) => set(v.key, e.target.value)}
                />
              </div>
            ))}
            {isFemale && (
              <div className="col-span-2">
                <Label htmlFor="lmp">Last menstrual period (LMP)</Label>
                <Input
                  id="lmp"
                  type="date"
                  className="mt-1.5"
                  value={f.lmp}
                  onChange={(e) => set("lmp", e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority &amp; notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Triage priority</Label>
            <div className="flex gap-2">
              {TRIAGE_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  data-on={f.triagePriority === p}
                  onClick={() => set("triagePriority", p)}
                  className={cn(
                    "flex-1 rounded-md border py-2 text-sm font-medium transition-colors",
                    "text-muted-foreground hover:bg-muted/50",
                    PRIORITY_BTN[p],
                  )}
                >
                  {TRIAGE_PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="triageNotes">Triage notes</Label>
            <Textarea
              id="triageNotes"
              rows={2}
              className="mt-1.5"
              placeholder="e.g. patient appears stable; complains of dizziness"
              value={f.triageNotes}
              onChange={(e) => set("triageNotes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={submit} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save &amp; send to doctor
        </Button>
      </div>
    </div>
  );
}
