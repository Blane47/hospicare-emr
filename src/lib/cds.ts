// ============================================================================
//  Clinical Decision Support (CDS) — a transparent, rule-based knowledge base.
//
//  Grounded in the field research: doctors reason from a constellation of
//  signs & symptoms to a *suspected diagnosis*, which then suggests
//  confirmatory tests and first-line drugs. These are SUGGESTIONS ONLY — the
//  doctor always decides. Drug and test names match the seeded catalogue.
// ============================================================================

export type CdsDrug = {
  name: string; // must match a Drug.name in the catalogue
  dosage: string;
  frequency: string;
  durationDays?: number;
  note?: string;
};

export type CdsRule = {
  key: string;
  label: string; // the suspected condition
  match: string[]; // lower-case keywords found in complaint / symptoms / diagnosis
  tests: string[]; // must match LabTest.name in the catalogue
  drugs: CdsDrug[];
  note?: string;
};

export const CDS_RULES: CdsRule[] = [
  {
    key: "malaria",
    label: "Malaria",
    match: ["malaria", "paludism", "fever", "hot body", "chills"],
    tests: ["Malaria RDT", "Blood Smear (MP)", "Full Blood Count"],
    drugs: [
      { name: "Coartem", dosage: "1 tablet", frequency: "2x daily", durationDays: 3, note: "Artemisinin combination therapy (ACT)" },
      { name: "Paracetamol", dosage: "500mg", frequency: "3x daily", durationDays: 3, note: "For fever" },
    ],
  },
  {
    key: "severe-malaria",
    label: "Severe malaria",
    match: ["severe malaria", "complicated malaria"],
    tests: ["Malaria RDT", "Full Blood Count"],
    drugs: [
      { name: "Artesunate Injection", dosage: "2.4 mg/kg", frequency: "at 0h, 12h, 24h", note: "Then oral ACT relay" },
    ],
  },
  {
    key: "typhoid",
    label: "Typhoid fever",
    match: ["typhoid", "enteric fever"],
    tests: ["Widal Test", "Full Blood Count"],
    drugs: [
      { name: "Ceftriaxone Injection", dosage: "1g", frequency: "1x daily", durationDays: 7 },
      { name: "Ciprofloxacin", dosage: "500mg", frequency: "2x daily", durationDays: 7, note: "Oral alternative" },
    ],
  },
  {
    key: "uti",
    label: "Urinary tract infection",
    match: ["uti", "urinary", "dysuria", "burning urine"],
    tests: ["Urinalysis"],
    drugs: [
      { name: "Ciprofloxacin", dosage: "500mg", frequency: "2x daily", durationDays: 5 },
    ],
    note: "Drug depends on organism/sensitivity where a culture is available.",
  },
  {
    key: "respiratory",
    label: "Respiratory infection",
    match: ["cough", "respiratory", "pneumonia", "bronchitis", "chest infection", "breathing"],
    tests: ["Chest X-ray", "Full Blood Count"],
    drugs: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "3x daily", durationDays: 7 },
    ],
  },
  {
    key: "gastroenteritis",
    label: "Gastroenteritis",
    match: ["diarrhoea", "diarrhea", "vomiting", "gastroenteritis", "loose stool"],
    tests: ["Stool Analysis"],
    drugs: [
      { name: "Metronidazole", dosage: "250mg", frequency: "3x daily", durationDays: 5 },
      { name: "ORS", dosage: "1 sachet", frequency: "after each stool", note: "Rehydration" },
    ],
  },
  {
    key: "anaemia",
    label: "Anaemia",
    match: ["anaemia", "anemia", "pallor", "fatigue", "weakness", "tired"],
    tests: ["Haemoglobin", "Full Blood Count"],
    drugs: [
      { name: "Ferrous Sulphate", dosage: "200mg", frequency: "2x daily", durationDays: 30 },
    ],
  },
  {
    key: "peptic-ulcer",
    label: "Peptic ulcer / gastritis",
    match: ["ulcer", "gastritis", "epigastric", "heartburn"],
    tests: [],
    drugs: [
      { name: "Omeprazole", dosage: "20mg", frequency: "1x daily", durationDays: 14, note: "Before breakfast" },
    ],
  },
  {
    key: "worms",
    label: "Intestinal worms",
    match: ["worm", "helminth", "deworm"],
    tests: ["Stool Analysis"],
    drugs: [
      { name: "Albendazole", dosage: "400mg", frequency: "single dose" },
    ],
  },
  {
    key: "asthma",
    label: "Asthma / wheeze",
    match: ["asthma", "wheeze", "wheezing"],
    tests: [],
    drugs: [
      { name: "Salbutamol Syrup", dosage: "5ml", frequency: "3x daily" },
    ],
  },
];

/** Return the rules whose keywords appear in the given free text. */
export function matchCdsRules(text: string): CdsRule[] {
  const t = ` ${text.toLowerCase()} `;
  return CDS_RULES.filter((r) => r.match.some((m) => t.includes(m)));
}
