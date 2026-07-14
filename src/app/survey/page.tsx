import { Activity } from "lucide-react";
import { SurveyForm } from "./survey-form";

export const metadata = {
  title: "Workflow Survey — HospiCare",
  description: "Help us map how patients are cared for at your hospital.",
};

export default function SurveyPage() {
  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">HospiCare</div>
            <div className="text-sidebar-foreground/60 text-xs">
              Hospital Workflow Survey
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            How are patients cared for at your hospital?
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            This short survey helps us build a hospital system that matches how
            your team actually works. Choose your role and answer what you can —
            there are no wrong answers. It takes about 5–10 minutes.
          </p>
        </div>
        <SurveyForm />
        <p className="text-muted-foreground mt-8 text-center text-xs">
          © {new Date().getFullYear()} HospiCare · Internship project
        </p>
      </main>
    </div>
  );
}
