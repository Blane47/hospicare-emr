"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { createPatient, type PatientFormState } from "./actions";
import {
  GENDERS,
  GENDER_LABELS,
  BLOOD_GROUPS,
  CAMEROON_REGIONS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectField } from "@/components/select-field";
import { FieldError } from "@/components/field-error";

export function PatientForm() {
  const [state, formAction, isPending] = useActionState<
    PatientFormState,
    FormData
  >(createPatient, undefined);
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
          <CardTitle className="text-base">Personal information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name *</Label>
            <Input id="firstName" name="firstName" className="mt-1.5" />
            <FieldError messages={errors?.firstName} />
          </div>
          <div>
            <Label htmlFor="lastName">Last name *</Label>
            <Input id="lastName" name="lastName" className="mt-1.5" />
            <FieldError messages={errors?.lastName} />
          </div>
          <div>
            <Label>Gender *</Label>
            <div className="mt-1.5">
              <SelectField
                name="gender"
                placeholder="Select gender"
                options={GENDERS.map((g) => ({ value: g, label: GENDER_LABELS[g] }))}
              />
            </div>
            <FieldError messages={errors?.gender} />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of birth *</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="mt-1.5"
            />
            <FieldError messages={errors?.dateOfBirth} />
          </div>
          <div>
            <Label>Blood group</Label>
            <div className="mt-1.5">
              <SelectField
                name="bloodGroup"
                placeholder="Unknown"
                options={BLOOD_GROUPS.map((b) => ({ value: b, label: b }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+237 6XX XX XX XX"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" className="mt-1.5" />
            <FieldError messages={errors?.email} />
          </div>
          <div>
            <Label htmlFor="city">City / Town</Label>
            <Input id="city" name="city" className="mt-1.5" />
          </div>
          <div>
            <Label>Region</Label>
            <div className="mt-1.5">
              <SelectField
                name="region"
                placeholder="Select region"
                options={CAMEROON_REGIONS.map((r) => ({ value: r, label: r }))}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medical &amp; emergency</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="allergies">Known allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              placeholder="e.g. Penicillin, sulfa drugs…"
              className="mt-1.5"
              rows={2}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Safety-critical — shown prominently on the patient record.
            </p>
          </div>
          <div>
            <Label htmlFor="emergencyContactName">Emergency contact name</Label>
            <Input
              id="emergencyContactName"
              name="emergencyContactName"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="emergencyContactPhone">Emergency contact phone</Label>
            <Input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" render={<Link href="/patients" />}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Register patient
        </Button>
      </div>
    </form>
  );
}
