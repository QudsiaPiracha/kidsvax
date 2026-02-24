import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");

describe("Project Configuration", () => {
  it("should have TypeScript strict mode enabled in tsconfig", () => {
    const tsconfig = JSON.parse(
      fs.readFileSync(path.join(ROOT, "tsconfig.json"), "utf-8")
    );
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noImplicitAny).toBe(true);
    expect(tsconfig.compilerOptions.strictNullChecks).toBe(true);
  });

  it("should have all required env vars defined in .env.example", () => {
    const envExample = fs.readFileSync(
      path.join(ROOT, ".env.example"),
      "utf-8"
    );
    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "DATABASE_URL",
      "ANTHROPIC_API_KEY",
      "RESEND_API_KEY",
    ];
    for (const varName of requiredVars) {
      expect(envExample).toContain(varName);
    }
  });

  it("should export Supabase client from lib/supabase", () => {
    const filePath = path.join(ROOT, "src/lib/supabase.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("createClient");
    expect(content).toContain("export");
  });

  it("should export Anthropic agent helpers from lib/ai", () => {
    const filePath = path.join(ROOT, "src/lib/ai.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("AI_MODEL");
    expect(content).toContain("claude-sonnet-4-6");
    expect(content).toContain("export");
  });

  it("should export Resend client from lib/email", () => {
    const filePath = path.join(ROOT, "src/lib/email.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("Resend");
    expect(content).toContain("export");
  });
});
