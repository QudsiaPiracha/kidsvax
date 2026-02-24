import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");

describe("Tailwind Configuration", () => {
  const tailwindConfig = fs.readFileSync(
    path.join(ROOT, "tailwind.config.ts"),
    "utf-8"
  );

  it("should define custom color 'sage' in tailwind config", () => {
    expect(tailwindConfig).toContain("sage");
    expect(tailwindConfig).toContain("#5B8C5A");
  });

  it("should define custom color 'terracotta' in tailwind config", () => {
    expect(tailwindConfig).toContain("terracotta");
    expect(tailwindConfig).toContain("#C45C3E");
  });

  it("should define custom color 'warm-white' in tailwind config", () => {
    expect(tailwindConfig).toContain("warm-white");
    expect(tailwindConfig).toContain("#FAFAF8");
  });

  it("should define custom color 'warm-amber' in tailwind config", () => {
    expect(tailwindConfig).toContain("warm-amber");
    expect(tailwindConfig).toContain("#D4A030");
  });

  it("should use Inter as default sans font", () => {
    expect(tailwindConfig).toContain("Inter");
    expect(tailwindConfig).toContain("sans");
  });
});
