-- Nurse triage: vitals move from Consultation to Visit, plus triage metadata.

-- Vitals are now recorded on the Visit (by the nurse at triage), not the Consultation.
ALTER TABLE "Consultation"
  DROP COLUMN "temperature",
  DROP COLUMN "systolic",
  DROP COLUMN "diastolic",
  DROP COLUMN "pulse",
  DROP COLUMN "weightKg",
  DROP COLUMN "heightCm";

ALTER TABLE "Visit"
  ADD COLUMN "triagePriority" TEXT,
  ADD COLUMN "triageNotes" TEXT,
  ADD COLUMN "temperature" DOUBLE PRECISION,
  ADD COLUMN "systolic" INTEGER,
  ADD COLUMN "diastolic" INTEGER,
  ADD COLUMN "pulse" INTEGER,
  ADD COLUMN "respRate" INTEGER,
  ADD COLUMN "spo2" INTEGER,
  ADD COLUMN "weightKg" DOUBLE PRECISION,
  ADD COLUMN "heightCm" DOUBLE PRECISION,
  ADD COLUMN "lmp" TEXT,
  ADD COLUMN "triagedById" TEXT,
  ADD COLUMN "triagedAt" TIMESTAMP(3);

ALTER TABLE "Visit"
  ADD CONSTRAINT "Visit_triagedById_fkey"
  FOREIGN KEY ("triagedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
