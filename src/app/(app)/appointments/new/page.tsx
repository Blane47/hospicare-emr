import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { BookAppointmentForm } from "../book-appointment-form";

export default async function NewAppointmentPage() {
  await requireRole(["RECEPTIONIST", "ADMIN"]);

  const [patients, doctors] = await Promise.all([
    prisma.patient.findMany({ orderBy: { firstName: "asc" } }),
    prisma.user.findMany({ where: { role: "DOCTOR", active: true } }),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Book appointment"
        description="Schedule a future visit for a patient."
      />
      <BookAppointmentForm
        patients={patients.map((p) => ({
          id: p.id,
          label: `${p.firstName} ${p.lastName} · ${p.patientNumber}`,
        }))}
        doctors={doctors.map((d) => ({ id: d.id, label: d.name }))}
      />
    </div>
  );
}
