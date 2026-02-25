import { calculateAgeMonths } from "@/lib/age-utils";

describe("calculateAgeMonths", () => {
  it("should return 0 for the same date", () => {
    expect(calculateAgeMonths("2024-01-15", "2024-01-15")).toBe(0);
  });

  it("should return ~6 for 6 months apart", () => {
    const result = calculateAgeMonths("2024-01-15", "2024-07-15");
    expect(result).toBe(6);
  });

  it("should return ~12 for 12 months apart", () => {
    const result = calculateAgeMonths("2024-01-15", "2025-01-15");
    expect(result).toBe(12);
  });

  it("should handle partial months", () => {
    const result = calculateAgeMonths("2024-01-01", "2024-01-16");
    expect(result).toBe(0.5);
  });

  it("should return 0 for reference before birth", () => {
    expect(calculateAgeMonths("2024-06-15", "2024-01-15")).toBe(0);
  });
});
