// ============================================================================
//  Seed script — populates the database with realistic demo data.
//  Run with:  npm run db:seed
//
//  Demo login (all users share the same password): password123
//    admin@hospital.cm        (Administrator)
//    doctor@hospital.cm       (Doctor)
//    pharmacist@hospital.cm   (Pharmacist)
//    reception@hospital.cm    (Receptionist)
// ============================================================================
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

// Small deterministic helper so re-seeding gives the same "random" spread.
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("🌱 Seeding database...");

  // --- Wipe existing data (dev only), in FK-safe order --------------------
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.drug.deleteMany();
  await prisma.user.deleteMany();

  // --- Users --------------------------------------------------------------
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: { name: "Grace Mbella", email: "admin@hospital.cm", passwordHash, role: "ADMIN" },
  });
  const doctor = await prisma.user.create({
    data: { name: "Dr. Achille Nkemayang", email: "doctor@hospital.cm", passwordHash, role: "DOCTOR" },
  });
  const doctor2 = await prisma.user.create({
    data: { name: "Dr. Estelle Mbarga", email: "doctor2@hospital.cm", passwordHash, role: "DOCTOR" },
  });
  const pharmacist = await prisma.user.create({
    data: { name: "Blaise Tchoua", email: "pharmacist@hospital.cm", passwordHash, role: "PHARMACIST" },
  });
  const receptionist = await prisma.user.create({
    data: { name: "Yvette Ngo Bell", email: "reception@hospital.cm", passwordHash, role: "RECEPTIONIST" },
  });
  const labtech = await prisma.user.create({
    data: { name: "Céline Fomba", email: "lab@hospital.cm", passwordHash, role: "LAB_TECH" },
  });
  console.log("✔ Users created");

  // --- Drugs (+ initial stock via PURCHASE ledger entries) ----------------
  const drugSpecs = [
    { name: "Coartem", genericName: "Artemether/Lumefantrine", category: "Antimalarial", form: "TABLET", strength: "20/120mg", unitPrice: 1200, stock: 120, reorderLevel: 20, expiryInDays: 240 },
    { name: "Paracetamol", genericName: "Paracetamol", category: "Analgesic", form: "TABLET", strength: "500mg", unitPrice: 25, stock: 800, reorderLevel: 100, expiryInDays: 400 },
    { name: "Amoxicillin", genericName: "Amoxicillin", category: "Antibiotic", form: "CAPSULE", strength: "500mg", unitPrice: 75, stock: 300, reorderLevel: 50, expiryInDays: 300 },
    { name: "Amoxicillin Syrup", genericName: "Amoxicillin", category: "Antibiotic", form: "SYRUP", strength: "125mg/5ml", unitPrice: 900, stock: 40, reorderLevel: 15, expiryInDays: 55 }, // expiring soon
    { name: "Metronidazole", genericName: "Metronidazole", category: "Antibiotic", form: "TABLET", strength: "250mg", unitPrice: 30, stock: 500, reorderLevel: 80, expiryInDays: 360 },
    { name: "Ibuprofen", genericName: "Ibuprofen", category: "Analgesic", form: "TABLET", strength: "400mg", unitPrice: 40, stock: 250, reorderLevel: 60, expiryInDays: 300 },
    { name: "Ciprofloxacin", genericName: "Ciprofloxacin", category: "Antibiotic", form: "TABLET", strength: "500mg", unitPrice: 120, stock: 8, reorderLevel: 20, expiryInDays: 200 }, // low stock
    { name: "ORS", genericName: "Oral Rehydration Salts", category: "Rehydration", form: "OTHER", strength: "sachet", unitPrice: 200, stock: 150, reorderLevel: 30, expiryInDays: 500 },
    { name: "Artesunate Injection", genericName: "Artesunate", category: "Antimalarial", form: "INJECTION", strength: "60mg", unitPrice: 2500, stock: 25, reorderLevel: 10, expiryInDays: 180 },
    { name: "Ceftriaxone Injection", genericName: "Ceftriaxone", category: "Antibiotic", form: "INJECTION", strength: "1g", unitPrice: 1800, stock: 12, reorderLevel: 15, expiryInDays: 150 }, // low stock
    { name: "Diclofenac", genericName: "Diclofenac", category: "Analgesic", form: "TABLET", strength: "50mg", unitPrice: 35, stock: 400, reorderLevel: 80, expiryInDays: 330 },
    { name: "Omeprazole", genericName: "Omeprazole", category: "Antacid", form: "CAPSULE", strength: "20mg", unitPrice: 90, stock: 180, reorderLevel: 40, expiryInDays: 280 },
    { name: "Ferrous Sulphate", genericName: "Ferrous Sulphate", category: "Supplement", form: "TABLET", strength: "200mg", unitPrice: 20, stock: 600, reorderLevel: 100, expiryInDays: 450 },
    { name: "Albendazole", genericName: "Albendazole", category: "Antihelmintic", form: "TABLET", strength: "400mg", unitPrice: 150, stock: 90, reorderLevel: 20, expiryInDays: 260 },
    { name: "Salbutamol Syrup", genericName: "Salbutamol", category: "Bronchodilator", form: "SYRUP", strength: "2mg/5ml", unitPrice: 1100, stock: 35, reorderLevel: 15, expiryInDays: 90 },
    { name: "Cotrimoxazole", genericName: "Sulfamethoxazole/Trimethoprim", category: "Antibiotic", form: "TABLET", strength: "480mg", unitPrice: 45, stock: 5, reorderLevel: 25, expiryInDays: -12 }, // low stock + expired
    { name: "Vitamin C", genericName: "Ascorbic Acid", category: "Supplement", form: "TABLET", strength: "500mg", unitPrice: 15, stock: 700, reorderLevel: 100, expiryInDays: 500 },
  ];

  const drugs: Awaited<ReturnType<typeof prisma.drug.create>>[] = [];
  for (let i = 0; i < drugSpecs.length; i++) {
    const spec = drugSpecs[i];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + spec.expiryInDays);
    const drug = await prisma.drug.create({
      data: {
        sku: `DRG-${String(i + 1).padStart(4, "0")}`,
        name: spec.name,
        genericName: spec.genericName,
        category: spec.category,
        form: spec.form,
        strength: spec.strength,
        unitPrice: spec.unitPrice,
        quantityInStock: spec.stock,
        reorderLevel: spec.reorderLevel,
        expiryDate,
        batchNumber: `BN${2026}${String(i + 1).padStart(3, "0")}`,
        stockMovements: {
          create: {
            type: "PURCHASE",
            quantity: spec.stock,
            balanceAfter: spec.stock,
            reason: "Initial stock",
            userId: pharmacist.id,
            createdAt: daysAgo(20),
          },
        },
      },
    });
    drugs.push(drug);
  }
  console.log(`✔ ${drugs.length} drugs created`);

  const drugByName = (name: string) => {
    const d = drugs.find((x) => x.name === name);
    if (!d) throw new Error(`Drug not found: ${name}`);
    return d;
  };

  // --- Laboratory test catalogue -----------------------------------------
  const labTestSpecs = [
    { code: "MAL", name: "Malaria RDT", category: "Parasitology", price: 1500, unit: "", referenceRange: "Negative" },
    { code: "FBC", name: "Full Blood Count", category: "Haematology", price: 3000, unit: "", referenceRange: "" },
    { code: "GLU", name: "Fasting Blood Glucose", category: "Biochemistry", price: 1000, unit: "mg/dL", referenceRange: "70–110" },
    { code: "WID", name: "Widal Test", category: "Serology", price: 2000, unit: "", referenceRange: "Negative" },
    { code: "HIV", name: "HIV Screening", category: "Serology", price: 2500, unit: "", referenceRange: "Non-reactive" },
    { code: "URN", name: "Urinalysis", category: "Microscopy", price: 1500, unit: "", referenceRange: "" },
    { code: "CRE", name: "Creatinine", category: "Biochemistry", price: 2500, unit: "mg/dL", referenceRange: "0.6–1.3" },
    { code: "HBS", name: "Hepatitis B (HBsAg)", category: "Serology", price: 3000, unit: "", referenceRange: "Negative" },
    { code: "HB", name: "Haemoglobin", category: "Haematology", price: 1000, unit: "g/dL", referenceRange: "12–16" },
    { code: "STL", name: "Stool Analysis", category: "Microscopy", price: 1500, unit: "", referenceRange: "" },
  ];
  const labTests: Record<string, Awaited<ReturnType<typeof prisma.labTest.create>>> = {};
  for (const t of labTestSpecs) {
    labTests[t.code] = await prisma.labTest.create({ data: t });
  }
  console.log(`✔ ${labTestSpecs.length} lab tests created`);

  // --- Patients -----------------------------------------------------------
  const patientSpecs = [
    { firstName: "Marie", lastName: "Ngono", gender: "FEMALE", dob: "1990-04-12", region: "Centre", city: "Yaoundé", blood: "O+", allergies: "Penicillin" },
    { firstName: "Jean-Pierre", lastName: "Fotso", gender: "MALE", dob: "1985-11-03", region: "West", city: "Bafoussam", blood: "A+" },
    { firstName: "Aissatou", lastName: "Bello", gender: "FEMALE", dob: "1998-07-22", region: "North", city: "Garoua", blood: "B+" },
    { firstName: "Emmanuel", lastName: "Tabi", gender: "MALE", dob: "1979-01-18", region: "Southwest", city: "Buea", blood: "O-" },
    { firstName: "Chantal", lastName: "Mbarga", gender: "FEMALE", dob: "2001-09-30", region: "Centre", city: "Yaoundé", blood: "AB+" },
    { firstName: "Ibrahim", lastName: "Oumarou", gender: "MALE", dob: "1972-05-14", region: "Far North", city: "Maroua", blood: "A-" },
    { firstName: "Solange", lastName: "Ateba", gender: "FEMALE", dob: "1994-12-08", region: "Centre", city: "Mbalmayo", blood: "O+" },
    { firstName: "Roland", lastName: "Nkeng", gender: "MALE", dob: "1988-03-27", region: "Northwest", city: "Bamenda", blood: "B-" },
    { firstName: "Fadimatou", lastName: "Alhadji", gender: "FEMALE", dob: "1996-06-19", region: "Adamawa", city: "Ngaoundéré", blood: "A+" },
    { firstName: "Pascal", lastName: "Etoa", gender: "MALE", dob: "1965-10-02", region: "South", city: "Ebolowa", blood: "O+" },
    { firstName: "Brigitte", lastName: "Kamga", gender: "FEMALE", dob: "2003-02-11", region: "West", city: "Dschang", blood: "AB-" },
    { firstName: "Samuel", lastName: "Eyong", gender: "MALE", dob: "1992-08-05", region: "Southwest", city: "Limbe", blood: "O+" },
  ];

  const patients = [];
  for (let i = 0; i < patientSpecs.length; i++) {
    const s = patientSpecs[i];
    const patient = await prisma.patient.create({
      data: {
        patientNumber: `P-${String(i + 1).padStart(6, "0")}`,
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        dateOfBirth: new Date(s.dob),
        phone: `+2376${String(50000000 + i * 111111).slice(0, 8)}`,
        region: s.region,
        city: s.city,
        bloodGroup: s.blood,
        allergies: s.allergies ?? null,
        emergencyContactName: "Next of Kin",
        emergencyContactPhone: `+2376${String(90000000 - i * 111111).slice(0, 8)}`,
        createdById: receptionist.id,
        createdAt: daysAgo(18 - i),
      },
    });
    patients.push(patient);
  }
  console.log(`✔ ${patients.length} patients created`);

  // --- Helper: record a completed pharmacy sale (decrements stock) --------
  let saleCounter = 0;
  async function recordSale(opts: {
    patientId: string;
    items: { drugName: string; quantity: number }[];
    paymentMethod: string;
    when: Date;
    prescriptionId?: string;
  }) {
    saleCounter++;
    const saleItemsData = opts.items.map((it) => {
      const drug = drugByName(it.drugName);
      return {
        drugId: drug.id,
        quantity: it.quantity,
        unitPrice: drug.unitPrice,
        subtotal: drug.unitPrice * it.quantity,
      };
    });
    const total = saleItemsData.reduce((sum, it) => sum + it.subtotal, 0);

    const sale = await prisma.sale.create({
      data: {
        saleNumber: `RCP-${String(saleCounter).padStart(6, "0")}`,
        patientId: opts.patientId,
        prescriptionId: opts.prescriptionId ?? null,
        pharmacistId: pharmacist.id,
        totalAmount: total,
        amountPaid: total,
        paymentMethod: opts.paymentMethod,
        createdAt: opts.when,
        items: { create: saleItemsData },
      },
    });

    // Decrement stock + write DISPENSE ledger entries.
    for (const it of opts.items) {
      const drug = drugByName(it.drugName);
      const updated = await prisma.drug.update({
        where: { id: drug.id },
        data: { quantityInStock: { decrement: it.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          drugId: drug.id,
          type: "DISPENSE",
          quantity: -it.quantity,
          balanceAfter: updated.quantityInStock,
          reason: `Sale ${sale.saleNumber}`,
          userId: pharmacist.id,
          createdAt: opts.when,
        },
      });
      // keep our in-memory copy roughly in sync
      drug.quantityInStock = updated.quantityInStock;
    }
    return sale;
  }

  // --- Historical completed visits (drives dashboard revenue) -------------
  const paymentMethods = ["CASH", "MTN_MOMO", "ORANGE_MONEY", "CASH", "MTN_MOMO"];
  const commonBaskets = [
    [{ drugName: "Coartem", quantity: 1 }, { drugName: "Paracetamol", quantity: 12 }],
    [{ drugName: "Amoxicillin", quantity: 21 }, { drugName: "Ibuprofen", quantity: 10 }],
    [{ drugName: "Metronidazole", quantity: 15 }, { drugName: "ORS", quantity: 2 }],
    [{ drugName: "Artesunate Injection", quantity: 3 }, { drugName: "Paracetamol", quantity: 10 }],
    [{ drugName: "Omeprazole", quantity: 14 }, { drugName: "Diclofenac", quantity: 10 }],
    [{ drugName: "Albendazole", quantity: 2 }, { drugName: "Vitamin C", quantity: 20 }],
    [{ drugName: "Amoxicillin Syrup", quantity: 1 }, { drugName: "Paracetamol", quantity: 8 }],
    [{ drugName: "Ferrous Sulphate", quantity: 30 }, { drugName: "Vitamin C", quantity: 30 }],
  ];

  const diagnoses = [
    "Uncomplicated malaria",
    "Upper respiratory tract infection",
    "Gastroenteritis",
    "Severe malaria",
    "Peptic ulcer disease",
    "Intestinal worms",
    "Bronchitis (paediatric)",
    "Iron-deficiency anaemia",
  ];

  let historicalVisits = 0;
  for (let day = 14; day >= 1; day--) {
    // 1–3 completed visits per day
    const visitsToday = 1 + (day % 3);
    for (let v = 0; v < visitsToday; v++) {
      const patient = patients[(day + v) % patients.length];
      const basketIdx = (day + v) % commonBaskets.length;
      const attendingDoctor = (day + v) % 2 === 0 ? doctor : doctor2;
      const when = daysAgo(day);
      when.setHours(9 + v * 2, 15, 0, 0);

      const visit = await prisma.visit.create({
        data: {
          visitNumber: `V-${String(historicalVisits + 1).padStart(6, "0")}`,
          patientId: patient.id,
          status: "COMPLETED",
          chiefComplaint: "Fever and general body pains",
          createdById: receptionist.id,
          createdAt: when,
        },
      });

      const consultation = await prisma.consultation.create({
        data: {
          visitId: visit.id,
          doctorId: attendingDoctor.id,
          temperature: 37 + ((day + v) % 4) * 0.5,
          systolic: 110 + ((day + v) % 3) * 10,
          diastolic: 70 + ((day + v) % 2) * 10,
          pulse: 72 + ((day + v) % 5) * 3,
          weightKg: 55 + ((day + v) % 6) * 4,
          heightCm: 160 + ((day + v) % 5) * 3,
          symptoms: "Fever, headache, fatigue",
          diagnosis: diagnoses[basketIdx],
          notes: "Patient advised rest and hydration. Review if symptoms persist.",
          createdAt: when,
        },
      });

      const basket = commonBaskets[basketIdx];
      const prescription = await prisma.prescription.create({
        data: {
          consultationId: consultation.id,
          status: "DISPENSED",
          notes: "Complete full course.",
          createdAt: when,
          items: {
            create: basket.map((b) => {
              const drug = drugByName(b.drugName);
              return {
                drugId: drug.id,
                dosage: drug.strength ?? "as directed",
                frequency: "as directed",
                durationDays: 5,
                quantity: b.quantity,
                quantityDispensed: b.quantity,
                instructions: "After meals",
              };
            }),
          },
        },
      });

      await recordSale({
        patientId: patient.id,
        items: basket,
        paymentMethod: paymentMethods[(day + v) % paymentMethods.length],
        when,
        prescriptionId: prescription.id,
      });

      historicalVisits++;
    }
  }
  console.log(`✔ ${historicalVisits} historical completed visits + sales created`);

  // --- Live queue (today) — shows the workflow in action ------------------
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  // 1) Waiting for doctor
  await prisma.visit.create({
    data: {
      visitNumber: `V-${String(historicalVisits + 1).padStart(6, "0")}`,
      patientId: patients[0].id,
      status: "WAITING",
      chiefComplaint: "Persistent cough for 4 days",
      createdById: receptionist.id,
      createdAt: new Date(today.getTime() + 10 * 60000),
    },
  });

  // 2) With doctor
  await prisma.visit.create({
    data: {
      visitNumber: `V-${String(historicalVisits + 2).padStart(6, "0")}`,
      patientId: patients[3].id,
      status: "WITH_DOCTOR",
      chiefComplaint: "High fever and chills",
      createdById: receptionist.id,
      createdAt: new Date(today.getTime() + 25 * 60000),
    },
  });

  // 3) At pharmacy — doctor done, prescription pending dispensing
  const pharmVisit = await prisma.visit.create({
    data: {
      visitNumber: `V-${String(historicalVisits + 3).padStart(6, "0")}`,
      patientId: patients[6].id,
      status: "PHARMACY",
      chiefComplaint: "Stomach pain and nausea",
      createdById: receptionist.id,
      createdAt: new Date(today.getTime() + 40 * 60000),
    },
  });
  const pharmConsult = await prisma.consultation.create({
    data: {
      visitId: pharmVisit.id,
      doctorId: doctor.id,
      temperature: 38.2,
      systolic: 120,
      diastolic: 80,
      pulse: 88,
      weightKg: 68,
      heightCm: 172,
      symptoms: "Epigastric pain, nausea after meals",
      diagnosis: "Peptic ulcer disease",
      notes: "Start PPI, avoid NSAIDs and spicy food.",
      createdAt: new Date(today.getTime() + 55 * 60000),
    },
  });
  await prisma.prescription.create({
    data: {
      consultationId: pharmConsult.id,
      status: "PENDING",
      notes: "Take Omeprazole before breakfast.",
      createdAt: new Date(today.getTime() + 56 * 60000),
      items: {
        create: [
          { drugId: drugByName("Omeprazole").id, dosage: "20mg", frequency: "1x daily", durationDays: 14, quantity: 14, instructions: "Before breakfast" },
          { drugId: drugByName("Metronidazole").id, dosage: "250mg", frequency: "3x daily", durationDays: 7, quantity: 21, instructions: "After meals" },
        ],
      },
    },
  });

  console.log("✔ Live queue (waiting / with doctor / pharmacy) created");

  // --- Lab orders --------------------------------------------------------
  // A pending order on the patient currently at the pharmacy consultation.
  await prisma.labOrder.create({
    data: {
      consultationId: pharmConsult.id,
      status: "ORDERED",
      orderedById: doctor.id,
      notes: "Rule out infection.",
      items: {
        create: [
          { labTestId: labTests["FBC"].id },
          { labTestId: labTests["MAL"].id },
        ],
      },
    },
  });
  // A completed order (with results) on a past consultation.
  const pastConsult = await prisma.consultation.findFirst({
    where: { visit: { status: "COMPLETED" } },
  });
  if (pastConsult) {
    await prisma.labOrder.create({
      data: {
        consultationId: pastConsult.id,
        status: "COMPLETED",
        orderedById: doctor2.id,
        items: {
          create: [
            { labTestId: labTests["MAL"].id, result: "Positive", flag: "ABNORMAL", resultedAt: daysAgo(9) },
            { labTestId: labTests["GLU"].id, result: "96", flag: "NORMAL", resultedAt: daysAgo(9) },
          ],
        },
      },
    });
  }
  console.log("✔ Lab orders created");

  // --- Appointments (upcoming) -------------------------------------------
  const apptTargets = [patients[1], patients[4], patients[8], patients[2], patients[5]];
  for (let i = 0; i < apptTargets.length; i++) {
    const when = new Date();
    when.setDate(when.getDate() + (i === 4 ? 0 : i + 1)); // last one is today
    when.setHours(9 + i, 0, 0, 0);
    await prisma.appointment.create({
      data: {
        patientId: apptTargets[i].id,
        scheduledFor: when,
        reason: i % 2 === 0 ? "Follow-up consultation" : "Routine check-up",
        status: "SCHEDULED",
        doctorId: (i % 2 === 0 ? doctor : doctor2).id,
        createdById: receptionist.id,
      },
    });
  }
  console.log("✔ Appointments created");
  console.log("\n✅ Seed complete!");
  console.log("   Login with any of:");
  console.log("     admin@ / doctor@ / pharmacist@ / reception@ / lab@hospital.cm");
  console.log(`   Password: ${DEMO_PASSWORD}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
