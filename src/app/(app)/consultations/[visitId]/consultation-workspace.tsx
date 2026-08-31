"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  Send,
  CheckCircle2,
  Check,
  Sparkles,
} from "lucide-react";
import { saveConsultation } from "../actions";
import { formatFCFA } from "@/lib/constants";
import { matchCdsRules, type CdsDrug } from "@/lib/cds";
import { cn } from "@/lib/utils";
import { TriagePriorityBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  form: string;
  unitPrice: number;
  quantityInStock: number;
};

type Item = {
  key: string;
  drugId: string;
  dosage: string;
  frequency: string;
  durationDays: string;
  quantity: string;
  instructions: string;
};

let rowSeq = 0;
const newRow = (): Item => ({
  key: `row-${rowSeq++}`,
  drugId: "",
  dosage: "",
  frequency: "",
  durationDays: "",
  quantity: "1",
  instructions: "",
});

type LabTestOption = {
  id: string;
  name: string;
  category: string | null;
  price: number;
};

export function ConsultationWorkspace({
  visitId,
  drugs,
  labTests,
  chiefComplaint,
  triageVitals,
  triagePriority,
  initial,
}: {
  visitId: string;
  drugs: DrugOption[];
  labTests: LabTestOption[];
  chiefComplaint?: string | null;
  triageVitals: { label: string; value: string }[];
  triagePriority?: string | null;
  initial?: {
    symptoms?: string;
    diagnosis?: string;
    notes?: string;
    prescriptionNotes?: string;
    items?: Omit<Item, "key">[];
    labTestIds?: string[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLabs, setSelectedLabs] = useState<string[]>(
    initial?.labTestIds ?? [],
  );
  const toggleLab = (id: string) =>
    setSelectedLabs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const [symptoms, setSymptoms] = useState(initial?.symptoms ?? "");
  const [diagnosis, setDiagnosis] = useState(initial?.diagnosis ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [prescriptionNotes, setPrescriptionNotes] = useState(
    initial?.prescriptionNotes ?? "",
  );
  const [items, setItems] = useState<Item[]>(
    initial?.items?.length
      ? initial.items.map((it) => ({ ...it, key: `row-${rowSeq++}` }))
      : [],
  );

  const drugById = (id: string) => drugs.find((d) => d.id === id);
  // Value→label map so the Select shows the drug name, not its id.
  const drugItems = drugs.map((d) => ({
    value: d.id,
    label: `${d.name}${d.strength ? " " + d.strength : ""}`,
  }));

  const updateItem = (key: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((it) => it.key !== key));

  const estimatedTotal = items.reduce((sum, it) => {
    const drug = drugById(it.drugId);
    const qty = parseInt(it.quantity) || 0;
    return sum + (drug ? drug.unitPrice * qty : 0);
  }, 0);

  // --- Clinical decision support ------------------------------------------
  const suggestions = useMemo(
    () => matchCdsRules(`${chiefComplaint ?? ""} ${symptoms} ${diagnosis}`),
    [chiefComplaint, symptoms, diagnosis],
  );
  const findLabByName = (name: string) =>
    labTests.find((t) => t.name.toLowerCase() === name.toLowerCase());
  const findDrugByName = (name: string) =>
    drugs.find((d) => d.name.toLowerCase() === name.toLowerCase());

  function addSuggestedTest(name: string) {
    const t = findLabByName(name);
    if (!t) return;
    setSelectedLabs((prev) => (prev.includes(t.id) ? prev : [...prev, t.id]));
    toast.success(`Added test: ${t.name}`);
  }
  function addSuggestedDrug(d: CdsDrug) {
    const drug = findDrugByName(d.name);
    if (!drug) return;
    setItems((prev) => [
      ...prev,
      {
        key: `row-${rowSeq++}`,
        drugId: drug.id,
        dosage: d.dosage,
        frequency: d.frequency,
        durationDays: d.durationDays ? String(d.durationDays) : "",
        quantity: d.durationDays ? String(d.durationDays) : "1",
        instructions: d.note ?? "",
      },
    ]);
    toast.success(`Added drug: ${drug.name}`);
  }

  function handleSave() {
    if (!diagnosis.trim()) {
      toast.error("Please enter a diagnosis before saving.");
      return;
    }
    for (const it of items) {
      if (!it.drugId) {
        toast.error("Select a drug for every prescription line (or remove it).");
        return;
      }
      if (!it.dosage.trim() || !it.frequency.trim()) {
        toast.error("Each drug needs a dosage and frequency.");
        return;
      }
      if (!(parseInt(it.quantity) > 0)) {
        toast.error("Each drug needs a quantity greater than zero.");
        return;
      }
    }

    startTransition(async () => {
      const res = await saveConsultation({
        visitId,
        symptoms,
        diagnosis,
        notes,
        prescriptionNotes,
        items: items.map((it) => ({
          drugId: it.drugId,
          dosage: it.dosage,
          frequency: it.frequency,
          durationDays: it.durationDays || undefined,
          quantity: it.quantity,
          instructions: it.instructions || undefined,
        })),
        labTestIds: selectedLabs,
      });

      if (!res.ok) {
        toast.error(res.error ?? "Could not save consultation.");
        return;
      }
      toast.success(
        items.length > 0
          ? "Consultation saved and sent to pharmacy."
          : "Consultation saved and visit completed.",
      );
      router.push("/queue");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Vitals — read-only, recorded by the nurse at triage */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            Vital signs{" "}
            <span className="text-muted-foreground text-xs font-normal">
              · recorded at triage
            </span>
          </CardTitle>
          {triagePriority && triagePriority !== "NORMAL" && (
            <TriagePriorityBadge priority={triagePriority} />
          )}
        </CardHeader>
        <CardContent>
          {triageVitals.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No vitals were recorded at triage for this visit.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-6">
              {triageVitals.map((v) => (
                <div key={v.label}>
                  <div className="text-muted-foreground text-xs">{v.label}</div>
                  <div className="text-sm font-medium">{v.value}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clinical notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinical assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptoms">Symptoms / history</Label>
            <Textarea
              id="symptoms"
              className="mt-1.5"
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Input
              id="diagnosis"
              className="mt-1.5"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Uncomplicated malaria"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes / advice</Label>
            <Textarea
              id="notes"
              className="mt-1.5"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinical decision support — reacts to complaint / symptoms / diagnosis */}
      {suggestions.length > 0 && (
        <Card className="border-primary/40 bg-primary/[0.03]">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="text-primary h-4 w-4" /> Clinical suggestions
            </CardTitle>
            <span className="text-muted-foreground text-xs">
              Suggestions only — you decide
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((rule) => (
              <div key={rule.key} className="bg-card rounded-lg border p-3">
                <div className="mb-2 text-sm font-semibold">{rule.label}</div>
                {rule.tests.length > 0 && (
                  <div className="mb-2">
                    <div className="text-muted-foreground mb-1 text-xs">
                      Suggested tests
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.tests.map((tn) => {
                        const t = findLabByName(tn);
                        const added = !!t && selectedLabs.includes(t.id);
                        return (
                          <button
                            key={tn}
                            type="button"
                            disabled={!t || added}
                            onClick={() => addSuggestedTest(tn)}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                              !t
                                ? "opacity-40"
                                : added
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                                  : "hover:bg-muted",
                            )}
                          >
                            {added ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            {tn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {rule.drugs.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs">
                      Suggested first-line drugs
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.drugs.map((d, i) => {
                        const drug = findDrugByName(d.name);
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={!drug}
                            onClick={() => addSuggestedDrug(d)}
                            title={drug ? "" : "Not in the pharmacy catalogue"}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                              !drug ? "opacity-40" : "hover:bg-muted",
                            )}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="font-medium">{d.name}</span>
                            <span className="text-muted-foreground">
                              · {d.dosage} {d.frequency}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {rule.note && (
                  <p className="text-muted-foreground mt-2 text-xs italic">
                    {rule.note}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prescription builder */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Prescription</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setItems((prev) => [...prev, newRow()])}
          >
            <Plus className="h-4 w-4" /> Add drug
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No drugs added. The visit will be completed without a prescription.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs">
                    <th className="min-w-[180px] pb-2 pr-2 font-medium">Drug</th>
                    <th className="pb-2 pr-2 font-medium">Dosage</th>
                    <th className="pb-2 pr-2 font-medium">Frequency</th>
                    <th className="pb-2 pr-2 font-medium">Days</th>
                    <th className="pb-2 pr-2 font-medium">Qty</th>
                    <th className="min-w-[140px] pb-2 pr-2 font-medium">
                      Instructions
                    </th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const drug = drugById(it.drugId);
                    const low =
                      drug && parseInt(it.quantity) > drug.quantityInStock;
                    return (
                      <tr key={it.key} className="border-b last:border-0">
                        <td className="py-2 pr-2 align-top">
                          <Select
                            items={drugItems}
                            value={it.drugId || undefined}
                            onValueChange={(v) => {
                              const dg = drugById(v as string);
                              updateItem(it.key, {
                                drugId: v as string,
                                dosage: it.dosage || dg?.strength || "",
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select drug" />
                            </SelectTrigger>
                            <SelectContent>
                              {drugs.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.name} {d.strength ?? ""} · {formatFCFA(d.unitPrice)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {low && (
                            <p className="text-destructive mt-1 text-xs">
                              Only {drug?.quantityInStock} in stock
                            </p>
                          )}
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <Input
                            className="w-24"
                            value={it.dosage}
                            placeholder="500mg"
                            onChange={(e) =>
                              updateItem(it.key, { dosage: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <Input
                            className="w-28"
                            value={it.frequency}
                            placeholder="3x daily"
                            onChange={(e) =>
                              updateItem(it.key, { frequency: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <Input
                            className="w-16"
                            inputMode="numeric"
                            value={it.durationDays}
                            placeholder="5"
                            onChange={(e) =>
                              updateItem(it.key, { durationDays: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <Input
                            className="w-16"
                            inputMode="numeric"
                            value={it.quantity}
                            onChange={(e) =>
                              updateItem(it.key, { quantity: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-2 pr-2 align-top">
                          <Input
                            value={it.instructions}
                            placeholder="After meals"
                            onChange={(e) =>
                              updateItem(it.key, { instructions: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-2 align-top">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem(it.key)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="sm:max-w-sm">
                  <Label htmlFor="prescriptionNotes" className="text-xs">
                    Prescription note
                  </Label>
                  <Input
                    id="prescriptionNotes"
                    className="mt-1.5"
                    value={prescriptionNotes}
                    placeholder="e.g. Complete the full course"
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                  />
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs">
                    Estimated pharmacy cost
                  </div>
                  <div className="text-xl font-semibold">
                    {formatFCFA(estimatedTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Laboratory tests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Laboratory tests</CardTitle>
        </CardHeader>
        <CardContent>
          {labTests.length === 0 ? (
            <p className="text-muted-foreground py-2 text-center text-sm">
              No lab tests configured.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {labTests.map((t) => {
                const checked = selectedLabs.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleLab(t.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      checked
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          checked && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <span>
                        <span className="font-medium">{t.name}</span>
                        {t.category && (
                          <span className="text-muted-foreground block text-xs">
                            {t.category}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatFCFA(t.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {selectedLabs.length > 0 && (
            <p className="text-muted-foreground mt-3 text-sm">
              {selectedLabs.length} test(s) will be sent to the laboratory.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="lg">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : items.length > 0 ? (
            <Send className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {items.length > 0 ? "Save & send to pharmacy" : "Complete visit"}
        </Button>
      </div>
    </div>
  );
}
