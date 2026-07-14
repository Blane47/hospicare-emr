import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { calculateAge, formatDate, GENDER_LABELS, type Gender } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { PatientSearch } from "./patient-search";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;
  const canRegister = user.role === "RECEPTIONIST" || user.role === "ADMIN";

  const where = q
    ? {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { patientNumber: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Search and manage the hospital's patient register."
      >
        {canRegister && (
          <Button render={<Link href="/patients/new" />}>
            <UserPlus className="h-4 w-4" /> Register patient
          </Button>
        )}
      </PageHeader>

      <div className="mb-4">
        <PatientSearch placeholder="Search by name, ID or phone…" />
      </div>

      <Card className="overflow-hidden p-0">
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Users className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">No patients found</p>
            <p className="text-muted-foreground text-sm">
              {q
                ? "Try a different search term."
                : "Register your first patient to get started."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient&nbsp;#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id} className="cursor-pointer">
                  <TableCell className="font-mono text-xs">
                    <Link href={`/patients/${p.id}`} className="hover:underline">
                      {p.patientNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/patients/${p.id}`} className="hover:underline">
                      {p.firstName} {p.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{GENDER_LABELS[p.gender as Gender] ?? p.gender}</TableCell>
                  <TableCell>{calculateAge(p.dateOfBirth)} yrs</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.region ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(p.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
