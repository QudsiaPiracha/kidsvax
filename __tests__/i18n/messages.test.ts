import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const MESSAGES_DIR = path.join(ROOT, "messages");

function loadMessages(locale: string): Record<string, unknown> {
  return JSON.parse(
    fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), "utf-8")
  );
}

function getKeys(
  obj: Record<string, unknown>,
  prefix = ""
): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null) {
      keys.push(
        ...getKeys(value as Record<string, unknown>, fullKey)
      );
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe("i18n Message Files", () => {
  const en = loadMessages("en");
  const de = loadMessages("de");
  const enKeys = getKeys(en);
  const deKeys = getKeys(de);

  it("EN and DE files should have identical key structure", () => {
    expect(enKeys).toEqual(deKeys);
  });

  it("should have all navigation labels in EN and DE", () => {
    const navKeys = [
      "nav.dashboard",
      "nav.schedule",
      "nav.growth",
      "nav.milestones",
      "nav.scan",
      "nav.settings",
    ];
    for (const key of navKeys) {
      expect(enKeys).toContain(key);
      expect(deKeys).toContain(key);
    }
  });

  it("should have all status labels in EN and DE", () => {
    const statusKeys = [
      "status.scheduled",
      "status.upcoming",
      "status.overdue",
      "status.completed",
      "status.skipped",
    ];
    for (const key of statusKeys) {
      expect(enKeys).toContain(key);
      expect(deKeys).toContain(key);
    }
  });

  it("should have all form labels in EN and DE", () => {
    const formKeys = [
      "child.name",
      "child.dateOfBirth",
      "child.gender",
      "child.allergies",
      "child.notes",
      "child.pediatrician",
      "auth.email",
      "auth.password",
    ];
    for (const key of formKeys) {
      expect(enKeys).toContain(key);
      expect(deKeys).toContain(key);
    }
  });

  it("should have all error messages in EN and DE", () => {
    const errorKeys = [
      "common.error",
      "scan.unreadable",
      "insights.unavailable",
    ];
    for (const key of errorKeys) {
      expect(enKeys).toContain(key);
      expect(deKeys).toContain(key);
    }
  });

  it("should have all U-exam names in EN and DE", () => {
    const examKeys = [
      "exams.title",
      "exams.markCompleted",
      "exams.markSkipped",
      "exams.date",
      "exams.physician",
      "exams.findings",
      "exams.observations",
      "exams.referrals",
    ];
    for (const key of examKeys) {
      expect(enKeys).toContain(key);
      expect(deKeys).toContain(key);
    }
  });

  it("should have all vaccine names in EN and DE", () => {
    const vaccineKeys = [
      "vaccinations.title",
      "vaccinations.markAdministered",
      "vaccinations.dose",
      "vaccinations.productName",
      "vaccinations.lotNumber",
      "vaccinations.injectionSite",
      "vaccinations.masernCompliant",
      "vaccinations.masernNonCompliant",
    ];
    for (const key of vaccineKeys) {
      expect(enKeys).toContain(key);
      expect(deKeys).toContain(key);
    }
  });

  it("should have medical disclaimer in EN and DE", () => {
    expect(enKeys).toContain("insights.disclaimer");
    expect(deKeys).toContain("insights.disclaimer");

    const enInsights = en as Record<string, Record<string, string>>;
    const deInsights = de as Record<string, Record<string, string>>;

    expect(enInsights.insights.disclaimer).toContain("not medical advice");
    expect(deInsights.insights.disclaimer).toContain("keine medizinische");
  });
});
