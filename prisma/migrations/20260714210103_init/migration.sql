-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "patientNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "bloodGroup" TEXT,
    "allergies" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "visitNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "chiefComplaint" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "pulse" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "durationDays" INTEGER,
    "quantity" INTEGER NOT NULL,
    "quantityDispensed" INTEGER NOT NULL DEFAULT 0,
    "instructions" TEXT,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "category" TEXT,
    "form" TEXT NOT NULL,
    "strength" TEXT,
    "unitPrice" INTEGER NOT NULL,
    "quantityInStock" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "expiryDate" TIMESTAMP(3),
    "batchNumber" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "saleNumber" TEXT NOT NULL,
    "patientId" TEXT,
    "prescriptionId" TEXT,
    "pharmacistId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "doctorId" TEXT,
    "notes" TEXT,
    "visitId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "price" INTEGER NOT NULL,
    "unit" TEXT,
    "referenceRange" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "orderedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrderItem" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "labTestId" TEXT NOT NULL,
    "result" TEXT,
    "flag" TEXT,
    "resultedAt" TIMESTAMP(3),

    CONSTRAINT "LabOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "respondentName" TEXT,
    "respondentRole" TEXT NOT NULL,
    "hospital" TEXT,
    "answers" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "Patient"("patientNumber");

-- CreateIndex
CREATE INDEX "Patient_lastName_firstName_idx" ON "Patient"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Visit_visitNumber_key" ON "Visit"("visitNumber");

-- CreateIndex
CREATE INDEX "Visit_status_idx" ON "Visit"("status");

-- CreateIndex
CREATE INDEX "Visit_patientId_idx" ON "Visit"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_visitId_key" ON "Consultation"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_consultationId_key" ON "Prescription"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "Drug_sku_key" ON "Drug"("sku");

-- CreateIndex
CREATE INDEX "Drug_name_idx" ON "Drug"("name");

-- CreateIndex
CREATE INDEX "StockMovement_drugId_idx" ON "StockMovement"("drugId");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleNumber_key" ON "Sale"("saleNumber");

-- CreateIndex
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_visitId_key" ON "Appointment"("visitId");

-- CreateIndex
CREATE INDEX "Appointment_scheduledFor_idx" ON "Appointment"("scheduledFor");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_code_key" ON "LabTest"("code");

-- CreateIndex
CREATE INDEX "LabOrder_status_idx" ON "LabOrder"("status");

-- CreateIndex
CREATE INDEX "SurveyResponse_respondentRole_idx" ON "SurveyResponse"("respondentRole");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrder" ADD CONSTRAINT "LabOrder_orderedById_fkey" FOREIGN KEY ("orderedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabOrderItem" ADD CONSTRAINT "LabOrderItem_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
