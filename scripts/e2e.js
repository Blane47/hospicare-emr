// End-to-end smoke test of the full clinical + pharmacy workflow.
// Drives a real browser: reception → doctor → pharmacy → receipt.
// Also captures screenshots into docs/screenshots for the report.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const SHOTS = path.join(__dirname, "..", "docs", "screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

const shot = (page, name) =>
  page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true });

async function login(page, email) {
  await page.goto(`${BASE}/login`);
  await page.fill("#email", email);
  await page.fill("#password", "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
}

async function pickSelect(page, placeholder, optionRegex) {
  await page.getByText(placeholder, { exact: false }).first().click();
  await page.getByRole("option", { name: optionRegex }).first().click();
}

(async () => {
  const browser = await chromium.launch();
  const LAST = "Ekwalla" + Date.now().toString().slice(-4);
  try {
    // ---------------- Reception: register patient + start visit ----------
    let ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    let page = await ctx.newPage();
    await login(page, "reception@hospital.cm");
    console.log("✓ reception logged in");

    await page.goto(`${BASE}/patients/new`);
    await page.fill("#firstName", "Thomas");
    await page.fill("#lastName", LAST);
    await pickSelect(page, "Select gender", /^Male$/);
    await page.fill("#dateOfBirth", "1991-06-15");
    await page.fill("#phone", "+237650112233");
    await page.click('button:has-text("Register patient")');
    await page.waitForURL(/\/patients\/[a-z0-9]+$/, { timeout: 15000 });
    console.log("✓ patient registered:", LAST);

    await page.getByRole("button", { name: /Start visit/ }).click();
    await page.fill("#chiefComplaint", "Fever, headache and body pains for 2 days");
    await page.getByRole("button", { name: /Add to queue/ }).click();
    await page.waitForURL(`${BASE}/queue`, { timeout: 15000 });
    await shot(page, "01-reception-queue");
    console.log("✓ visit started, in queue");
    await ctx.close();

    // ---------------- Doctor: attend + prescribe -------------------------
    ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    page = await ctx.newPage();
    await login(page, "doctor@hospital.cm");
    console.log("✓ doctor logged in");
    await page.goto(`${BASE}/queue`);
    const row = page.getByRole("row", { name: new RegExp(LAST) });
    await row.getByRole("button", { name: /Attend/ }).click();
    await page.waitForURL(/\/consultations\/[a-z0-9]+$/, { timeout: 15000 });

    // vitals
    await page.getByLabel("Temp (°C)").fill("38.5");
    await page.getByLabel("Systolic").fill("120");
    await page.getByLabel("Diastolic").fill("80");
    await page.getByLabel("Pulse (bpm)").fill("90");
    await page.fill("#diagnosis", "Uncomplicated malaria");
    // add a prescription line
    await page.getByRole("button", { name: /Add drug/ }).click();
    await pickSelect(page, "Select drug", /Coartem/);
    await page.getByPlaceholder("3x daily").fill("2x daily");
    await shot(page, "02-doctor-consultation");
    await page.getByRole("button", { name: /send to pharmacy/i }).click();
    await page.waitForURL(`${BASE}/queue`, { timeout: 15000 });
    console.log("✓ consultation saved + sent to pharmacy");
    await ctx.close();

    // ---------------- Pharmacist: dispense + receipt ---------------------
    ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    page = await ctx.newPage();
    await login(page, "pharmacist@hospital.cm");
    console.log("✓ pharmacist logged in");
    await page.goto(`${BASE}/pharmacy/dispense`);
    await shot(page, "03-pharmacy-dispense-queue");
    const prow = page.getByRole("row", { name: new RegExp(LAST) });
    await prow.getByRole("link", { name: /Dispense/ }).click();
    await page.waitForURL(/\/pharmacy\/dispense\/[a-z0-9]+$/, { timeout: 15000 });
    await page.getByRole("button", { name: /Confirm/ }).click();
    await page.waitForURL(/\/pharmacy\/sales\/[a-z0-9]+$/, { timeout: 15000 });
    await shot(page, "04-pharmacy-receipt");
    const receiptText = await page.textContent("body");
    console.log("✓ dispensed. Receipt has RCP:", /RCP-\d+/.test(receiptText));
    await ctx.close();

    // ---------------- Admin dashboard screenshot -------------------------
    ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    page = await ctx.newPage();
    await login(page, "admin@hospital.cm");
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1200); // let charts render
    await shot(page, "05-admin-dashboard");
    await shot(await loginShot(browser), "00-login");
    console.log("✓ admin dashboard captured");
    await ctx.close();

    console.log("\n✅ E2E PASSED — full workflow works end to end.");
  } catch (e) {
    console.error("\n❌ E2E FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

async function loginShot(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(300);
  return page;
}
