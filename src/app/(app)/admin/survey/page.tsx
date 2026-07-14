import { ClipboardList, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatDateTime } from "@/lib/constants";
import { surveyRoleByKey } from "@/lib/survey";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Answers = Record<string, unknown>;

function QA({ label, value }: { label: string; value: string }) {
  if (!value?.trim()) return null;
  return (
    <div>
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export default async function SurveyResponsesPage() {
  await requireRole(["ADMIN"]);
  const responses = await prisma.surveyResponse.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Survey responses"
        description="Answers collected from hospital staff via the public workflow survey."
      >
        <Button variant="outline" render={<a href="/survey" target="_blank" rel="noreferrer" />}>
          <ExternalLink className="h-4 w-4" /> Open survey form
        </Button>
      </PageHeader>

      {responses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <ClipboardList className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">No responses yet</p>
            <p className="text-muted-foreground text-sm">
              Share the survey link with staff:{" "}
              <span className="font-mono">/survey</span>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {responses.map((r) => {
            const role = surveyRoleByKey(r.respondentRole);
            let answers: Answers = {};
            try {
              answers = JSON.parse(r.answers) as Answers;
            } catch {
              answers = {};
            }
            const symptomTests = answers._symptomTests as
              | Record<string, string>
              | undefined;
            const diagnosisDrugs = answers._diagnosisDrugs as
              | Record<string, string>
              | undefined;

            return (
              <Card key={r.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">
                      {role?.label ?? r.respondentRole}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {r.respondentName || "Anonymous"}
                      {r.hospital ? ` · ${r.hospital}` : ""} ·{" "}
                      {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                  <Badge variant="secondary">{r.respondentRole}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {role?.questions.map((q) => (
                    <QA
                      key={q.id}
                      label={q.label}
                      value={String(answers[q.id] ?? "")}
                    />
                  ))}

                  {symptomTests && (
                    <div className="sm:col-span-2">
                      <div className="text-muted-foreground mb-1 text-xs font-medium">
                        Symptom → tests
                      </div>
                      <ul className="space-y-0.5 text-sm">
                        {Object.entries(symptomTests)
                          .filter(([, v]) => v?.trim())
                          .map(([k, v]) => (
                            <li key={k}>
                              <span className="font-medium">{k}:</span> {v}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {diagnosisDrugs && (
                    <div className="sm:col-span-2">
                      <div className="text-muted-foreground mb-1 text-xs font-medium">
                        Diagnosis → drugs
                      </div>
                      <ul className="space-y-0.5 text-sm">
                        {Object.entries(diagnosisDrugs)
                          .filter(([, v]) => v?.trim())
                          .map(([k, v]) => (
                            <li key={k}>
                              <span className="font-medium">{k}:</span> {v}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
