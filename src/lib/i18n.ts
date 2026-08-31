// ============================================================================
//  Lightweight i18n — English + French (Cameroon is officially bilingual).
//  A dictionary per locale; strings are looked up by dotted key via t().
//  Works on both the server (see i18n-server.ts) and client (locale-provider).
// ============================================================================

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

type Dict = Record<string, string>;

// Flat dictionaries keyed by "section.key" for simple lookup.
const en: Dict = {
  "common.appName": "HospiCare",
  "common.hospitalSystem": "Hospital System",
  "common.signIn": "Sign in",
  "common.signOut": "Sign out",
  "common.search": "Search…",

  "nav.Overview": "Overview",
  "nav.Clinical": "Clinical",
  "nav.Pharmacy": "Pharmacy",
  "nav.Administration": "Administration",
  "nav.Dashboard": "Dashboard",
  "nav.Patient Queue": "Patient Queue",
  "nav.Triage": "Triage",
  "nav.Appointments": "Appointments",
  "nav.Patients": "Patients",
  "nav.Consultations": "Consultations",
  "nav.Laboratory": "Laboratory",
  "nav.Dispensing": "Dispensing",
  "nav.Point of Sale": "Point of Sale",
  "nav.Inventory": "Inventory",
  "nav.Sales": "Sales",
  "nav.Staff": "Staff",
  "nav.Survey responses": "Survey responses",

  "role.ADMIN": "Administrator",
  "role.DOCTOR": "Doctor",
  "role.PHARMACIST": "Pharmacist",
  "role.RECEPTIONIST": "Receptionist",
  "role.LAB_TECH": "Lab Technician",
  "role.NURSE": "Nurse",

  "visit.WAITING": "Waiting for triage",
  "visit.TRIAGED": "Waiting for doctor",
  "visit.WITH_DOCTOR": "With doctor",
  "visit.PHARMACY": "At pharmacy",
  "visit.COMPLETED": "Completed",
  "visit.CANCELLED": "Cancelled",

  "appt.SCHEDULED": "Scheduled",
  "appt.CHECKED_IN": "Checked in",
  "appt.COMPLETED": "Completed",
  "appt.CANCELLED": "Cancelled",
  "appt.NO_SHOW": "No-show",

  "rx.PENDING": "Pending",
  "rx.PARTIALLY_DISPENSED": "Partially dispensed",
  "rx.DISPENSED": "Dispensed",
  "rx.CANCELLED": "Cancelled",

  "lab.ORDERED": "Awaiting results",
  "lab.COMPLETED": "Results ready",
  "lab.CANCELLED": "Cancelled",

  "login.welcomeBack": "Welcome back",
  "login.subtitle": "Sign in to access the hospital management system.",
  "login.email": "Email",
  "login.password": "Password",
  "login.signingIn": "Signing in…",
  "login.demoAccounts": "Demo accounts (password: password123)",
  "login.heading": "One system for patient records and pharmacy.",
  "login.tagline":
    "Built for hospitals in Cameroon — register patients, run consultations, prescribe, dispense and track drug stock, all in one place.",
  "login.feature1": "Electronic medical records & consultation history",
  "login.feature2": "Pharmacy dispensing with live stock control",
  "login.feature3": "Role-based access for every member of staff",
  "login.footer": "Internship project",
  "login.invalid": "Invalid email or password. Please try again.",

  "dash.morning": "Good morning",
  "dash.afternoon": "Good afternoon",
  "dash.evening": "Good evening",
  "dash.subtitle": "Here's what's happening at the hospital today.",
  "dash.totalPatients": "Total patients",
  "dash.visitsToday": "Visits today",
  "dash.waiting": "Waiting for doctor",
  "dash.completedToday": "Completed today",
  "dash.withDoctor": "With doctor",
  "dash.revenueToday": "Revenue today",
  "dash.pendingRx": "Pending prescriptions",
  "dash.itemsDispensed": "Items dispensed today",
  "dash.lowStock": "Low-stock drugs",
  "dash.labPending": "Lab orders pending",
  "dash.resultsToday": "Results entered today",
  "dash.revenue14": "Revenue · last 14 days",
  "dash.total": "Total",
  "dash.visits14": "Visits · last 14 days",
  "dash.paymentMethods": "Payment methods",
  "dash.lowStockTitle": "Low stock",
  "dash.view": "View",
  "dash.allAboveReorder": "All drugs are above reorder level.",
  "dash.expiringNote": "drug(s) expired or expiring soon",
  "dash.queueSnapshot": "Queue snapshot",
  "dash.openQueue": "Open queue",
  "dash.atPharmacy": "At pharmacy",
  "dash.labWorklist": "Laboratory worklist",
  "dash.openLab": "Open laboratory",
  "dash.labAwaiting": "lab order(s) awaiting results.",
};

const fr: Dict = {
  "common.appName": "HospiCare",
  "common.hospitalSystem": "Système Hospitalier",
  "common.signIn": "Se connecter",
  "common.signOut": "Se déconnecter",
  "common.search": "Rechercher…",

  "nav.Overview": "Aperçu",
  "nav.Clinical": "Clinique",
  "nav.Pharmacy": "Pharmacie",
  "nav.Administration": "Administration",
  "nav.Dashboard": "Tableau de bord",
  "nav.Patient Queue": "File d'attente",
  "nav.Triage": "Triage",
  "nav.Appointments": "Rendez-vous",
  "nav.Patients": "Patients",
  "nav.Consultations": "Consultations",
  "nav.Laboratory": "Laboratoire",
  "nav.Dispensing": "Dispensation",
  "nav.Point of Sale": "Point de vente",
  "nav.Inventory": "Inventaire",
  "nav.Sales": "Ventes",
  "nav.Staff": "Personnel",
  "nav.Survey responses": "Réponses au sondage",

  "role.ADMIN": "Administrateur",
  "role.DOCTOR": "Médecin",
  "role.PHARMACIST": "Pharmacien",
  "role.RECEPTIONIST": "Réceptionniste",
  "role.LAB_TECH": "Laborantin",
  "role.NURSE": "Infirmier(ère)",

  "visit.WAITING": "En attente du triage",
  "visit.TRIAGED": "En attente du médecin",
  "visit.WITH_DOCTOR": "Chez le médecin",
  "visit.PHARMACY": "À la pharmacie",
  "visit.COMPLETED": "Terminé",
  "visit.CANCELLED": "Annulé",

  "appt.SCHEDULED": "Planifié",
  "appt.CHECKED_IN": "Enregistré",
  "appt.COMPLETED": "Terminé",
  "appt.CANCELLED": "Annulé",
  "appt.NO_SHOW": "Absent",

  "rx.PENDING": "En attente",
  "rx.PARTIALLY_DISPENSED": "Partiellement dispensé",
  "rx.DISPENSED": "Dispensé",
  "rx.CANCELLED": "Annulé",

  "lab.ORDERED": "Résultats en attente",
  "lab.COMPLETED": "Résultats prêts",
  "lab.CANCELLED": "Annulé",

  "login.welcomeBack": "Bon retour",
  "login.subtitle": "Connectez-vous pour accéder au système de gestion hospitalière.",
  "login.email": "E-mail",
  "login.password": "Mot de passe",
  "login.signingIn": "Connexion…",
  "login.demoAccounts": "Comptes de démonstration (mot de passe : password123)",
  "login.heading": "Un seul système pour les dossiers patients et la pharmacie.",
  "login.tagline":
    "Conçu pour les hôpitaux du Cameroun — enregistrez les patients, menez les consultations, prescrivez, dispensez et suivez le stock de médicaments, le tout au même endroit.",
  "login.feature1": "Dossiers médicaux électroniques et historique des consultations",
  "login.feature2": "Dispensation en pharmacie avec gestion du stock en temps réel",
  "login.feature3": "Accès par rôle pour chaque membre du personnel",
  "login.footer": "Projet de stage",
  "login.invalid": "E-mail ou mot de passe invalide. Veuillez réessayer.",

  "dash.morning": "Bonjour",
  "dash.afternoon": "Bon après-midi",
  "dash.evening": "Bonsoir",
  "dash.subtitle": "Voici ce qui se passe à l'hôpital aujourd'hui.",
  "dash.totalPatients": "Total des patients",
  "dash.visitsToday": "Visites aujourd'hui",
  "dash.waiting": "En attente du médecin",
  "dash.completedToday": "Terminées aujourd'hui",
  "dash.withDoctor": "Chez le médecin",
  "dash.revenueToday": "Recettes du jour",
  "dash.pendingRx": "Ordonnances en attente",
  "dash.itemsDispensed": "Articles dispensés aujourd'hui",
  "dash.lowStock": "Médicaments en rupture",
  "dash.labPending": "Analyses en attente",
  "dash.resultsToday": "Résultats saisis aujourd'hui",
  "dash.revenue14": "Recettes · 14 derniers jours",
  "dash.total": "Total",
  "dash.visits14": "Visites · 14 derniers jours",
  "dash.paymentMethods": "Moyens de paiement",
  "dash.lowStockTitle": "Stock faible",
  "dash.view": "Voir",
  "dash.allAboveReorder": "Tous les médicaments sont au-dessus du seuil.",
  "dash.expiringNote": "médicament(s) expiré(s) ou bientôt expiré(s)",
  "dash.queueSnapshot": "Aperçu de la file",
  "dash.openQueue": "Ouvrir la file",
  "dash.atPharmacy": "À la pharmacie",
  "dash.labWorklist": "Liste de travail du laboratoire",
  "dash.openLab": "Ouvrir le laboratoire",
  "dash.labAwaiting": "analyse(s) en attente de résultats.",
};

export const DICTIONARIES: Record<Locale, Dict> = { en, fr };

export function isLocale(v: string | undefined): v is Locale {
  return v === "en" || v === "fr";
}

/** Build a translator for a locale. Falls back to the key if missing. */
export function makeT(locale: Locale) {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  return (key: string) => dict[key] ?? DICTIONARIES.en[key] ?? key;
}

export type TFunction = ReturnType<typeof makeT>;
