"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createAppointment } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SelectField } from "@/components/select-field";

export function BookAppointmentForm({
  patients,
  doctors,
}: {
  patients: { id: string; label: string }[];
  doctors: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    patientId: "",
    scheduledFor: "",
    reason: "",
    doctorId: "",
  });
  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  function submit() {
    if (!form.patientId) return toast.error("Please choose a patient.");
    if (!form.scheduledFor) return toast.error("Please choose a date & time.");
    startTransition(async () => {
      const res = await createAppointment(form);
      if (!res.ok) {
        toast.error(res.error ?? "Could not book appointment.");
        return;
      }
      toast.success("Appointment booked.");
      router.push("/appointments");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        <div>
          <Label className="mb-1.5 block">Patient *</Label>
          <SelectField
            name="patientId"
            placeholder="Select patient"
            options={patients.map((p) => ({ value: p.id, label: p.label }))}
            onChange={(v) => set("patientId", v)}
          />
        </div>
        <div>
          <Label htmlFor="scheduledFor">Date &amp; time *</Label>
          <Input
            id="scheduledFor"
            type="datetime-local"
            className="mt-1.5"
            value={form.scheduledFor}
            onChange={(e) => set("scheduledFor", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Doctor (optional)</Label>
          <SelectField
            name="doctorId"
            placeholder="Any available doctor"
            options={doctors.map((d) => ({ value: d.id, label: d.label }))}
            onChange={(v) => set("doctorId", v)}
          />
        </div>
        <div>
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            className="mt-1.5"
            rows={2}
            placeholder="e.g. Follow-up consultation"
            value={form.reason}
            onChange={(e) => set("reason", e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Book appointment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
