import { z } from "zod";
import {
  GENDERS,
  DRUG_FORMS,
  PAYMENT_METHODS,
  ROLES,
} from "@/lib/constants";

// Empty-string-friendly optional text (HTML forms submit "" not undefined).
const optionalText = z.string().trim().optional().or(z.literal(""));

export const patientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(GENDERS),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: optionalText,
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  address: optionalText,
  city: optionalText,
  region: optionalText,
  bloodGroup: optionalText,
  allergies: optionalText,
  emergencyContactName: optionalText,
  emergencyContactPhone: optionalText,
});
export type PatientInput = z.infer<typeof patientSchema>;

export const visitSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  chiefComplaint: z.string().trim().min(1, "Reason for visit is required"),
});

export const consultationSchema = z.object({
  visitId: z.string().min(1),
  temperature: optionalText,
  systolic: optionalText,
  diastolic: optionalText,
  pulse: optionalText,
  weightKg: optionalText,
  heightCm: optionalText,
  symptoms: optionalText,
  diagnosis: z.string().trim().min(1, "Diagnosis is required"),
  notes: optionalText,
});

export const prescriptionItemSchema = z.object({
  drugId: z.string().min(1),
  dosage: z.string().trim().min(1),
  frequency: z.string().trim().min(1),
  durationDays: z.coerce.number().int().positive().optional(),
  quantity: z.coerce.number().int().positive("Quantity must be > 0"),
  instructions: optionalText,
});

export const drugSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  genericName: optionalText,
  category: optionalText,
  form: z.enum(DRUG_FORMS),
  strength: optionalText,
  unitPrice: z.coerce.number().int().nonnegative("Price must be 0 or more"),
  reorderLevel: z.coerce.number().int().nonnegative().default(10),
});

export const stockAdjustmentSchema = z.object({
  drugId: z.string().min(1),
  quantity: z.coerce.number().int().refine((n) => n !== 0, "Quantity cannot be zero"),
  reason: z.string().trim().min(1, "Reason is required"),
});

export const saleSchema = z.object({
  patientId: optionalText,
  prescriptionId: optionalText,
  paymentMethod: z.enum(PAYMENT_METHODS),
  items: z
    .array(
      z.object({
        drugId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1, "Add at least one item"),
});

export const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(ROLES),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Flattens Zod issues to a { field: [messages] } map for form display.
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
