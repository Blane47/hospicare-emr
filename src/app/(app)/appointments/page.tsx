import Link from "next/link";
import { CalendarDays, CalendarPlus, LogIn, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { calculateAge, formatDateTime } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { AppointmentStatusBadge } from "@/components/status-badge";
import { checkInAppointment, setAppointmentStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AppointmentsPage() {
  const user = await requireRole(["RECEPTIONIST", "DOCTOR", "ADMIN"]);
  const canManage = user.role === "RECEPTIONIST" || user.role === "ADMIN";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [today, upcoming] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: { gte: startOfToday, lt: endOfToday },
      },
      orderBy: { scheduledFor: "asc" },
      include: { patient: true, doctor: true },
    }),
    prisma.appointment.findMany({
      where: { status: "SCHEDULED", scheduledFor: { gte: endOfToday } },
      orderBy: { scheduledFor: "asc" },
      include: { patient: true, doctor: true },
    }),
  ]);

  type Row = (typeof today)[number];

  const section = (title: string, rows: Row[], isToday: boolean) => (
    <Card className="mb-6 overflow-hidden p-0">
      <CardHeader className="p-4">
        <CardTitle className="text-base">
          {title} ({rows.length})
        </CardTitle>
      </CardHeader>
      {rows.length === 0 ? (
        <div className="text-muted-foreground border-t py-10 text-center text-sm">
          No appointments.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateTime(a.scheduledFor)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/patients/${a.patientId}`}
                    className="font-medium hover:underline"
                  >
                    {a.patient.firstName} {a.patient.lastName}
                  </Link>
                  <div className="text-muted-foreground text-xs">
                    {a.patient.patientNumber} ·{" "}
                    {calculateAge(a.patient.dateOfBirth)} yrs
                  </div>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {a.reason ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {a.doctor?.name ?? "Any"}
                </TableCell>
                <TableCell>
                  <AppointmentStatusBadge status={a.status} />
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isToday && (
                        <form action={checkInAppointment.bind(null, a.id)}>
                          <Button size="sm" type="submit">
                            <LogIn className="h-4 w-4" /> Check in
                          </Button>
                        </form>
                      )}
                      <form
                        action={setAppointmentStatus.bind(null, a.id, "CANCELLED")}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          type="submit"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Scheduled visits. Check patients in to add them to the queue."
      >
        {canManage && (
          <Button render={<Link href="/appointments/new" />}>
            <CalendarPlus className="h-4 w-4" /> Book appointment
          </Button>
        )}
      </PageHeader>

      {today.length === 0 && upcoming.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <CalendarDays className="text-muted-foreground h-8 w-8" />
            <p className="font-medium">No upcoming appointments</p>
            <p className="text-muted-foreground text-sm">
              Book an appointment to schedule a future visit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {section("Today", today, true)}
          {section("Upcoming", upcoming, false)}
        </>
      )}
    </div>
  );
}
