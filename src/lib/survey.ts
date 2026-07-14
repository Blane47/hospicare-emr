// ============================================================================
//  Survey configuration — the workflow interview questions, per staff role.
//  Mirrors docs/interview-guide.html. Answers are stored as JSON on
//  SurveyResponse.answers.
// ============================================================================

export type SurveyQuestion = { id: string; label: string };

export type SurveyRoleDef = {
  key: string;
  label: string;
  questions: SurveyQuestion[];
  symptomRules?: boolean; // show "symptom → tests" rows
  diagnosisRules?: boolean; // show "diagnosis → drugs" rows
};

export const SURVEY_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough / breathing difficulty",
  "Diarrhoea & vomiting",
  "Abdominal pain",
  "Fatigue / weakness",
];

export const SURVEY_DIAGNOSES = [
  "Uncomplicated malaria",
  "Severe malaria",
  "Typhoid fever",
  "Respiratory infection",
  "Urinary tract infection",
  "Gastroenteritis",
];

export const SURVEY_ROLES: SurveyRoleDef[] = [
  {
    key: "RECEPTION",
    label: "Receptionist / Records Officer",
    questions: [
      { id: "reg_fields", label: "What details do you record for a new patient? (name, DOB, sex, phone, address, next of kin, blood group, allergies?)" },
      { id: "returning", label: "How do you find a returning patient's file? Is there a patient card or number?" },
      { id: "complaint", label: "Do you record the reason for the visit, or does the nurse/doctor?" },
      { id: "payment", label: "Is any payment collected at registration (e.g. consultation fee)? How much?" },
      { id: "next", label: "After registration, where does the patient go next?" },
      { id: "appointments", label: "How are appointments handled today (walk-in, appointment book, phone)?" },
    ],
  },
  {
    key: "NURSE",
    label: "Nurse (triage & vitals)",
    symptomRules: true,
    questions: [
      { id: "before_doctor", label: "Does the patient see you before the doctor?" },
      { id: "vitals", label: "Which vital signs do you measure? (temp, BP, pulse, weight, height, resp rate, SpO2?)" },
      { id: "symptoms", label: "Do you record the patient's symptoms / complaint, and in how much detail?" },
      { id: "triage", label: "Do you decide how urgent a patient is (triage)? What categories?" },
      { id: "order_tests", label: "Can you order any tests yourself, or only the doctor?" },
      { id: "pre_treatment", label: "Do you give any treatment before the doctor (injections, first aid, first dose)?" },
      { id: "danger", label: "Are there danger signs that mean a patient must be seen immediately?" },
    ],
  },
  {
    key: "DOCTOR",
    label: "Doctor",
    diagnosisRules: true,
    questions: [
      { id: "review_first", label: "What do you review first when the patient comes in (vitals, history, previous visits)?" },
      { id: "choose_tests", label: "How do you decide which lab tests to order? Any standard 'symptom → test' rules?" },
      { id: "results_flow", label: "After results come back, does the patient return to you, and how do you receive results?" },
      { id: "diagnose", label: "How do you reach a diagnosis and choose drugs?" },
      { id: "referral", label: "When do you write a referral to another facility?" },
      { id: "trust", label: "Would a system that suggests tests/drugs from symptoms help? What would make you trust it?" },
    ],
  },
  {
    key: "LAB",
    label: "Laboratory Technician",
    questions: [
      { id: "in_house", label: "Which tests do you perform in-house, and which are sent out?" },
      { id: "request", label: "How do you receive a test request (paper form, verbal, slip)? What is written on it?" },
      { id: "results", label: "How are results recorded and returned to the doctor?" },
      { id: "turnaround", label: "Typical turnaround time for common tests?" },
      { id: "abnormal", label: "How do you know a result is abnormal (reference ranges)? Do you flag it?" },
      { id: "prices", label: "What are the prices of the common tests?" },
    ],
  },
  {
    key: "PHARMACIST",
    label: "Pharmacist",
    questions: [
      { id: "receive_rx", label: "How do you receive a prescription (paper, patient brings it, electronic)?" },
      { id: "substitute", label: "Do you dispense exactly as prescribed, or can you substitute a generic/alternative?" },
      { id: "stock", label: "How is drug stock tracked now? When and how do you reorder?" },
      { id: "expiry", label: "How do you handle expiry — how are near-expiry or expired drugs managed?" },
      { id: "payment", label: "Is payment made at the pharmacy or at a separate cashier?" },
      { id: "otc", label: "Do you sell to walk-in customers without a prescription (over-the-counter)?" },
    ],
  },
  {
    key: "CASHIER",
    label: "Cashier / Billing",
    questions: [
      { id: "charges", label: "What is charged, and at which points (registration, consultation, lab, drugs)?" },
      { id: "methods", label: "Which payment methods do you accept (cash, MTN Mobile Money, Orange Money, other)?" },
      { id: "insurance", label: "Is there any insurance, exemption, or credit arrangement?" },
      { id: "receipt", label: "How is a receipt issued and recorded?" },
    ],
  },
  {
    key: "ADMIN",
    label: "Administrator / Management",
    questions: [
      { id: "reports", label: "What reports do you need (daily revenue, patient numbers, stock, staff activity)?" },
      { id: "permissions", label: "Who should be able to see or change what (roles & permissions)?" },
      { id: "painpoints", label: "What are the biggest pain points with the current (paper?) system?" },
      { id: "privacy", label: "How is patient confidentiality handled?" },
    ],
  },
];

export function surveyRoleByKey(key: string): SurveyRoleDef | undefined {
  return SURVEY_ROLES.find((r) => r.key === key);
}
