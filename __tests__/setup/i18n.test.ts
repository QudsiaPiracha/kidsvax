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

describe("Internationalization", () => {
  const en = loadMessages("en");
  const de = loadMessages("de");

  it("should have EN message file with all required keys", () => {
    const keys = getKeys(en);
    expect(keys).toContain("common.appName");
    expect(keys).toContain("nav.dashboard");
    expect(keys).toContain("auth.login");
    expect(keys).toContain("dashboard.title");
    expect(keys).toContain("child.name");
    expect(keys).toContain("status.scheduled");
    expect(keys).toContain("exams.title");
    expect(keys).toContain("vaccinations.title");
    expect(keys).toContain("growth.title");
    expect(keys).toContain("milestones.title");
    expect(keys).toContain("scan.title");
    expect(keys).toContain("insights.disclaimer");
    expect(keys).toContain("settings.title");
  });

  it("should have DE message file with all required keys", () => {
    const keys = getKeys(de);
    expect(keys).toContain("common.appName");
    expect(keys).toContain("nav.dashboard");
    expect(keys).toContain("auth.login");
    expect(keys).toContain("dashboard.title");
    expect(keys).toContain("child.name");
    expect(keys).toContain("status.scheduled");
    expect(keys).toContain("exams.title");
    expect(keys).toContain("vaccinations.title");
    expect(keys).toContain("growth.title");
    expect(keys).toContain("milestones.title");
    expect(keys).toContain("scan.title");
    expect(keys).toContain("insights.disclaimer");
    expect(keys).toContain("settings.title");
  });

  it("should have identical key structure in EN and DE files", () => {
    const enKeys = getKeys(en);
    const deKeys = getKeys(de);
    expect(enKeys).toEqual(deKeys);
  });

  it("should default to EN locale", () => {
    const i18nConfig = fs.readFileSync(
      path.join(ROOT, "src/i18n/request.ts"),
      "utf-8"
    );
    expect(i18nConfig).toContain('"en"');
  });
});
