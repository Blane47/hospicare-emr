import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { PatientForm } from "../patient-form";

export default async function NewPatientPage() {
  // Only reception + admin may register patients (enforced server-side).
  await requireRole(["RECEPTIONIST", "ADMIN"]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Register patient"
        description="Create a new patient record in the hospital register."
      />
      <PatientForm />
    </div>
  );
}
