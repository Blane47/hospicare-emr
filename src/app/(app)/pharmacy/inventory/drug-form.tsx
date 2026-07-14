"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { createDrug, type DrugFormState } from "../actions";
import { DRUG_FORMS, DRUG_FORM_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectField } from "@/components/select-field";
import { FieldError } from "@/components/field-error";

export function DrugForm() {
  const [state, formAction, isPending] = useActionState<DrugFormState, FormData>(
    createDrug,
    undefined,
  );
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Drug details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" className="mt-1.5" placeholder="e.g. Coartem" />
            <FieldError messages={errors?.name} />
          </div>
          <div>
            <Label htmlFor="genericName">Generic name</Label>
            <Input id="genericName" name="genericName" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              className="mt-1.5"
              placeholder="Antimalarial, Analgesic…"
            />
          </div>
          <div>
            <Label>Form *</Label>
            <div className="mt-1.5">
              <SelectField
                name="form"
                placeholder="Select form"
                options={DRUG_FORMS.map((f) => ({
                  value: f,
                  label: DRUG_FORM_LABELS[f],
                }))}
              />
            </div>
            <FieldError messages={errors?.form} />
          </div>
          <div>
            <Label htmlFor="strength">Strength</Label>
            <Input
              id="strength"
              name="strength"
              className="mt-1.5"
              placeholder="500mg, 125mg/5ml…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing &amp; stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="unitPrice">Unit price (FCFA) *</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              className="mt-1.5"
              inputMode="numeric"
              defaultValue="0"
            />
            <FieldError messages={errors?.unitPrice} />
          </div>
          <div>
            <Label htmlFor="initialStock">Initial stock</Label>
            <Input
              id="initialStock"
              name="initialStock"
              className="mt-1.5"
              inputMode="numeric"
              defaultValue="0"
            />
          </div>
          <div>
            <Label htmlFor="reorderLevel">Reorder level</Label>
            <Input
              id="reorderLevel"
              name="reorderLevel"
              className="mt-1.5"
              inputMode="numeric"
              defaultValue="10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" render={<Link href="/pharmacy/inventory" />}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Add drug
        </Button>
      </div>
    </form>
  );
}
