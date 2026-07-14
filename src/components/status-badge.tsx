import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  VISIT_STATUS_LABELS,
  PRESCRIPTION_STATUS_LABELS,
  APPOINTMENT_STATUS_LABELS,
  LAB_ORDER_STATUS_LABELS,
  type VisitStatus,
  type PrescriptionStatus,
  type AppointmentStatus,
  type LabOrderStatus,
} from "@/lib/constants";

const VISIT_STYLES: Record<VisitStatus, string> = {
  WAITING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20",
  WITH_DOCTOR:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20",
  PHARMACY:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/20",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20",
  CANCELLED:
    "bg-muted text-muted-foreground border-border",
};

export function VisitStatusBadge({ status }: { status: string }) {
  const s = status as VisitStatus;
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", VISIT_STYLES[s] ?? "")}
    >
      {VISIT_STATUS_LABELS[s] ?? status}
    </Badge>
  );
}

const PRESCRIPTION_STYLES: Record<PrescriptionStatus, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20",
  PARTIALLY_DISPENSED:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20",
  DISPENSED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function PrescriptionStatusBadge({ status }: { status: string }) {
  const s = status as PrescriptionStatus;
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", PRESCRIPTION_STYLES[s] ?? "")}
    >
      {PRESCRIPTION_STATUS_LABELS[s] ?? status}
    </Badge>
  );
}

const APPOINTMENT_STYLES: Record<AppointmentStatus, string> = {
  SCHEDULED:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20",
  CHECKED_IN:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/20",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
  NO_SHOW:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/20",
};

export function AppointmentStatusBadge({ status }: { status: string }) {
  const s = status as AppointmentStatus;
  return (
    <Badge variant="outline" className={cn("font-medium", APPOINTMENT_STYLES[s] ?? "")}>
      {APPOINTMENT_STATUS_LABELS[s] ?? status}
    </Badge>
  );
}

const LAB_STYLES: Record<LabOrderStatus, string> = {
  ORDERED:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function LabOrderStatusBadge({ status }: { status: string }) {
  const s = status as LabOrderStatus;
  return (
    <Badge variant="outline" className={cn("font-medium", LAB_STYLES[s] ?? "")}>
      {LAB_ORDER_STATUS_LABELS[s] ?? status}
    </Badge>
  );
}
