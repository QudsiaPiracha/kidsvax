import {
  calculateBMI,
  calculatePercentile,
  detectPercentileCrossing,
} from "@/lib/percentile";

// -----------------------------------------------------------------------
// calculatePercentile
// -----------------------------------------------------------------------
describe("calculatePercentile", () => {
  it("should calculate 50th percentile for average height-for-age boy", () => {
    // 12-month-old boy, average height ~75.7cm
    const result = calculatePercentile(75.7, 12, "male", "height");
    expect(result).toBeGreaterThanOrEqual(40);
    expect(result).toBeLessThanOrEqual(60);
  });

  it("should calculate 50th percentile for average height-for-age girl", () => {
    // 12-month-old girl, average height ~74.0cm
    const result = calculatePercentile(74.0, 12, "female", "height");
    expect(result).toBeGreaterThanOrEqual(40);
    expect(result).toBeLessThanOrEqual(60);
  });

  it("should return <3rd percentile for significantly low weight", () => {
    // 12-month-old boy with very low weight (5 kg vs p3 = 7.8)
    const result = calculatePercentile(5.0, 12, "male", "weight");
    expect(result).toBeLessThan(3);
  });

  it("should return >97th percentile for significantly high weight", () => {
    // 12-month-old boy with very high weight (15 kg vs p97 = 11.8)
    const result = calculatePercentile(15.0, 12, "male", "weight");
    expect(result).toBeGreaterThan(97);
  });
});

// -----------------------------------------------------------------------
// calculateBMI
// -----------------------------------------------------------------------
describe("calculateBMI", () => {
  it("should calculate BMI from height and weight", () => {
    // BMI = weight / (height_m^2) = 10 / (0.75^2) = 17.78
    const result = calculateBMI(75, 10);
    expect(result).toBeCloseTo(17.78, 1);
  });
});

// -----------------------------------------------------------------------
// detectPercentileCrossing
// -----------------------------------------------------------------------
describe("detectPercentileCrossing", () => {
  it("should detect percentile crossing (moved from 50th to 25th)", () => {
    const history = [
      { date: "2024-01-01", percentile: 50 },
      { date: "2024-03-01", percentile: 48 },
      { date: "2024-06-01", percentile: 25 },
    ];

    const result = detectPercentileCrossing(history);

    expect(result.crossed).toBe(true);
    expect(result.direction).toBe("down");
    expect(result.from).toBe(50);
    expect(result.to).toBe(25);
  });
});
