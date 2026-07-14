"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { submitSurvey } from "./actions";
import {
  SURVEY_ROLES,
  SURVEY_SYMPTOMS,
  SURVEY_DIAGNOSES,
  surveyRoleByKey,
} from "@/lib/survey";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/select-field";

export function SurveyForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const [respondentName, setRespondentName] = useState("");
  const [hospital, setHospital] = useState("");
  const [roleKey, setRoleKey] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [symptomRules, setSymptomRules] = useState<Record<string, string>>({});
  const [diagnosisRules, setDiagnosisRules] = useState<Record<string, string>>({});

  const role = surveyRoleByKey(roleKey);

  function submit() {
    if (!roleKey) {
      toast.error("Please choose your role first.");
      return;
    }
    const payload = {
      respondentName,
      hospital,
      respondentRole: roleKey,
      answers: {
        ...answers,
        ...(role?.symptomRules ? { _symptomTests: symptomRules } : {}),
        ...(role?.diagnosisRules ? { _diagnosisDrugs: diagnosisRules } : {}),
      },
    };
    startTransition(async () => {
      const res = await submitSurvey(payload);
      if (!res.ok) {
        toast.error(res.error ?? "Could not submit.");
        return;
      }
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-semibold">Thank you!</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Your answers have been recorded. They will help shape the hospital
            system to match how your team really works.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setRoleKey("");
              setAnswers({});
              setSymptomRules({});
              setDiagnosisRules({});
              setRespondentName("");
            }}
          >
            Submit another response
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About you</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Your name (optional)</Label>
            <Input
              id="name"
              className="mt-1.5"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hospital">Hospital / clinic (optional)</Label>
            <Input
              id="hospital"
              className="mt-1.5"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block">Your role *</Label>
            <SelectField
              name="role"
              placeholder="Select your role"
              onChange={(v) => {
                setRoleKey(v);
                setAnswers({});
              }}
              options={SURVEY_ROLES.map((r) => ({ value: r.key, label: r.label }))}
            />
          </div>
        </CardContent>
      </Card>

      {role && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{role.label} — questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {role.questions.map((q) => (
              <div key={q.id}>
                <Label htmlFor={q.id} className="leading-snug">
                  {q.label}
                </Label>
                <Textarea
                  id={q.id}
                  rows={2}
                  className="mt-1.5"
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {role?.symptomRules && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              For each symptom, which tests are usually ordered?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SURVEY_SYMPTOMS.map((s) => (
              <div key={s} className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-center">
                <Label className="text-sm">{s}</Label>
                <Input
                  placeholder="e.g. Malaria RDT, Widal…"
                  value={symptomRules[s] ?? ""}
                  onChange={(e) =>
                    setSymptomRules((p) => ({ ...p, [s]: e.target.value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {role?.diagnosisRules && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              For each diagnosis, what are the first-line drug(s)?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SURVEY_DIAGNOSES.map((d) => (
              <div key={d} className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-center">
                <Label className="text-sm">{d}</Label>
                <Input
                  placeholder="Drug, dose & duration…"
                  value={diagnosisRules[d] ?? ""}
                  onChange={(e) =>
                    setDiagnosisRules((p) => ({ ...p, [d]: e.target.value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {role && (
        <div className="flex justify-end">
          <Button size="lg" onClick={submit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit response
          </Button>
        </div>
      )}
    </div>
  );
}
