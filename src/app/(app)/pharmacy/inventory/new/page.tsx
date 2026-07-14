import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { DrugForm } from "../drug-form";

export default async function NewDrugPage() {
  await requireRole(["PHARMACIST", "ADMIN"]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Add drug"
        description="Add a new drug to the pharmacy catalogue."
      />
      <DrugForm />
    </div>
  );
}
