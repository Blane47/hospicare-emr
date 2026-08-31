import Link from "next/link";
import { ListChecks, Stethoscope, Clock, Pill, X, HeartPulse } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateAge, formatDateTime } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { VisitStatusBadge, TriagePriorityBadge } from "@/components/status-badge";
import { openConsultation } from "../consultations/actions";
import { cancelVisit } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-semibold leading-none">{value}</div>
          <div className="text-muted-foreground mt-1 text-xs">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function QueuePage() {
  const user = await requireRole(["RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN"]);
  const isDoctor = user.role === "DOCTOR" || user.role === "ADMIN";
  const isNurse = user.role === "NURSE" || user.role === "ADMIN";
  const canCancel = user.role === "RECEPTIONIST" || user.role === "ADMIN";

  const visits = await prisma.visit.findMany({
    where: { status: { in: ["WAITING", "TRIAGED", "WITH_DOCTOR", "PHARMACY"] } },
    orderBy: { createdAt: "asc" },
    include: { patient: true },
  });

  const count = (s: string) => visits.filter((v) => v.status === s).length;

  return (
    <div>
      <PageHeader
        title="Patient Queue"
        description="Live view of patients currently being attended to."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HeartPulse}
          label="Waiting for triage"
          value={count("WAITING")}
          tint="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        />
        <StatCard
          icon={Clock}
          label="Waiting for doctor"
          value={count("TRIAGED")}
          tint="bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300"
        />
        <StatCard
          icon={Stethoscope}
          label="With doctor"
          value={count("WITH_DOCTOR")}
          tint="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
        />
        <StatCard
          icon={Pill}
          label="At pharmacy"
          value={count("PHARMACY")}
          tint="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
        />
      </div>

      <Card className="overflow-hidden p-0">
        {visits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <ListChecks className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">The queue is empty</p>
            <p className="text-muted-foreground text-sm">
              New visits started at reception will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Since</TableHead>
                <TableHead>Visit&nbsp;#</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Complaint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatDateTime(v.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {v.visitNumber}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/patients/${v.patientId}`}
                      className="font-medium hover:underline"
                    >
                      {v.patient.firstName} {v.patient.lastName}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {v.patient.patientNumber} ·{" "}
                      {calculateAge(v.patient.dateOfBirth)} yrs
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {v.chiefComplaint ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <VisitStatusBadge status={v.status} />
                      {v.triagePriority && v.triagePriority !== "NORMAL" && (
                        <TriagePriorityBadge priority={v.triagePriority} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isNurse && v.status === "WAITING" && (
                        <Button
                          size="sm"
                          render={<Link href={`/triage/${v.id}`} />}
                        >
                          <HeartPulse className="h-4 w-4" /> Triage
                        </Button>
                      )}
                      {isDoctor && v.status === "TRIAGED" && (
                        <form action={openConsultation.bind(null, v.id)}>
                          <Button size="sm" type="submit">
                            <Stethoscope className="h-4 w-4" /> Attend
                          </Button>
                        </form>
                      )}
                      {isDoctor && v.status === "WITH_DOCTOR" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          render={<Link href={`/consultations/${v.id}`} />}
                        >
                          Continue
                        </Button>
                      )}
                      {canCancel && v.status !== "PHARMACY" && (
                        <form action={cancelVisit.bind(null, v.id)}>
                          <Button
                            size="sm"
                            variant="ghost"
                            type="submit"
                            title="Cancel visit"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </div>
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
