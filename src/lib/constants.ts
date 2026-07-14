// ============================================================================
//  Domain constants + label maps + formatters.
//  These mirror the "enum-like" String fields in the Prisma schema and give us
//  a single source of truth for allowed values, human-readable labels, and
//  validation (via Zod) throughout the app.
// ============================================================================

// ---- Roles -----------------------------------------------------------------
export const ROLES = [
  "ADMIN",
  "DOCTOR",
  "PHARMACIST",
  "RECEPTIONIST",
  "LAB_TECH",
] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  PHARMACIST: "Pharmacist",
  RECEPTIONIST: "Receptionist",
  LAB_TECH: "Lab Technician",
};

// ---- Appointment status ----------------------------------------------------
export const APPOINTMENT_STATUSES = [
  "SCHEDULED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  CHECKED_IN: "Checked in",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

// ---- Lab order status ------------------------------------------------------
export const LAB_ORDER_STATUSES = ["ORDERED", "COMPLETED", "CANCELLED"] as const;
export type LabOrderStatus = (typeof LAB_ORDER_STATUSES)[number];

export const LAB_ORDER_STATUS_LABELS: Record<LabOrderStatus, string> = {
  ORDERED: "Awaiting results",
  COMPLETED: "Results ready",
  CANCELLED: "Cancelled",
};

export const LAB_FLAGS = ["NORMAL", "HIGH", "LOW", "ABNORMAL"] as const;
export type LabFlag = (typeof LAB_FLAGS)[number];

// ---- Visit workflow status -------------------------------------------------
export const VISIT_STATUSES = [
  "WAITING",
  "WITH_DOCTOR",
  "PHARMACY",
  "COMPLETED",
  "CANCELLED",
] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  WAITING: "Waiting for doctor",
  WITH_DOCTOR: "With doctor",
  PHARMACY: "At pharmacy",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// ---- Prescription status ---------------------------------------------------
export const PRESCRIPTION_STATUSES = [
  "PENDING",
  "PARTIALLY_DISPENSED",
  "DISPENSED",
  "CANCELLED",
] as const;
export type PrescriptionStatus = (typeof PRESCRIPTION_STATUSES)[number];

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  PENDING: "Pending",
  PARTIALLY_DISPENSED: "Partially dispensed",
  DISPENSED: "Dispensed",
  CANCELLED: "Cancelled",
};

// ---- Stock movement types --------------------------------------------------
export const STOCK_MOVEMENT_TYPES = [
  "PURCHASE",
  "DISPENSE",
  "ADJUSTMENT",
  "RETURN",
] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

// ---- Payment methods (Cameroon context) ------------------------------------
// Cameroonian clinics take cash and mobile money only — the two mobile-money
// providers are MTN Mobile Money and Orange Money. No cards.
export const PAYMENT_METHODS = ["CASH", "MTN_MOMO", "ORANGE_MONEY"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MTN_MOMO: "MTN Mobile Money",
  ORANGE_MONEY: "Orange Money",
};

// ---- Drug forms ------------------------------------------------------------
export const DRUG_FORMS = [
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "INJECTION",
  "CREAM",
  "DROPS",
  "OTHER",
] as const;
export type DrugForm = (typeof DRUG_FORMS)[number];

export const DRUG_FORM_LABELS: Record<DrugForm, string> = {
  TABLET: "Tablet",
  CAPSULE: "Capsule",
  SYRUP: "Syrup",
  INJECTION: "Injection",
  CREAM: "Cream / Ointment",
  DROPS: "Drops",
  OTHER: "Other",
};

// ---- Demographics ----------------------------------------------------------
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

// Regions of Cameroon — used in the patient address form.
export const CAMEROON_REGIONS = [
  "Adamawa",
  "Centre",
  "East",
  "Far North",
  "Littoral",
  "North",
  "Northwest",
  "South",
  "Southwest",
  "West",
] as const;

// ============================================================================
//  Formatters
// ============================================================================

// The CFA franc (XAF) has no minor unit. We store integers and format with a
// thin space as the thousands separator (e.g. "12 500 FCFA"), which matches
// local convention.
export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount);
  const withSeparators = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withSeparators} FCFA`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Drugs within this many days of expiry are flagged "expiring soon".
export const EXPIRY_SOON_DAYS = 90;

export type ExpiryStatus = "expired" | "expiring" | "ok" | "none";

export function drugExpiryStatus(
  expiryDate: Date | string | null | undefined,
): ExpiryStatus {
  if (!expiryDate) return "none";
  const d = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const diffDays = (d.getTime() - Date.now()) / 86_400_000;
  if (diffDays < 0) return "expired";
  if (diffDays <= EXPIRY_SOON_DAYS) return "expiring";
  return "ok";
}

// Age in whole years from a date of birth.
export function calculateAge(dob: Date | string): number {
  const birth = typeof dob === "string" ? new Date(dob) : dob;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
