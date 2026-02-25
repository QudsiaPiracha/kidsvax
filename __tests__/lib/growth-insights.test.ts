import { generateGrowthInsights } from "@/lib/growth-insights";
import type { GrowthInsightsInput } from "@/lib/growth-insights";

describe("generateGrowthInsights", () => {
  it("should return all four insight sections", () => {
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 3.3, height_cm: 50.0, head_circumference_cm: 34.0 },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result).toHaveProperty("growth_summary");
    expect(result).toHaveProperty("dietary_suggestions");
    expect(result).toHaveProperty("activity_tips");
    expect(result).toHaveProperty("doctor_questions");
  });

  it("should handle empty measurements", () => {
    const input: GrowthInsightsInput = {
      measurements: [],
      dateOfBirth: "2024-08-24",
      gender: "male",
    };

    const result = generateGrowthInsights(input);
    expect(result.growth_summary).toContain("No measurements");
    expect(result.dietary_suggestions.length).toBeGreaterThan(0);
    expect(result.activity_tips.length).toBeGreaterThan(0);
  });

  it("should include percentile information in growth summary", () => {
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 3.2, height_cm: 49.0, head_circumference_cm: 33.9 },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.growth_summary).toContain("percentile");
  });

  it("should describe mid-range weight as healthy", () => {
    // Female newborn at p50 weight = 3.2 kg
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 3.2, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.growth_summary).toContain("healthy middle range");
  });

  it("should flag very low percentile as needing attention", () => {
    // Female newborn well below p3 weight (p3 = 2.4)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 1.5, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.growth_summary).toContain("below the 3rd percentile");
    expect(result.growth_summary).toContain("pediatrician");
  });

  it("should flag very high percentile", () => {
    // Female newborn well above p97 weight (p97 = 4.0)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 4.5, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.growth_summary).toContain("97th percentile");
  });

  it("should detect percentile crossing and alert", () => {
    // Drop from ~50th to very low percentile for weight
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 3.2, height_cm: null, head_circumference_cm: null },
        { measured_date: "2025-02-24", weight_kg: 5.0, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    // p50 at 0mo = 3.2, p3 at 6mo = 5.8, so 5.0 at 6mo is below p3
    // This is a significant drop from ~50th to ~below 3rd
    expect(result.growth_summary).toContain("dropped");
    expect(result.doctor_questions).toContain("percentile");
  });

  it("should use Length label for children under 24 months", () => {
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: null, height_cm: 49.0, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.growth_summary).toContain("Length");
  });

  it("should provide age-appropriate dietary suggestions for infant < 6 months", () => {
    // Use a recent DOB so current age is < 6 months (today is ~Feb 2026)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2025-12-01", weight_kg: 3.2, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2025-12-01",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.dietary_suggestions).toContain("breastfeeding");
  });

  it("should provide age-appropriate activity tips for infant < 6 months", () => {
    // Use a recent DOB so current age is < 6 months (today is ~Feb 2026)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2025-12-01", weight_kg: 3.2, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2025-12-01",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.activity_tips).toContain("tummy time");
  });

  it("should provide toddler dietary suggestions for 1-2 year olds", () => {
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2025-08-24", weight_kg: 9.5, height_cm: 76.0, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "male",
    };

    const result = generateGrowthInsights(input);
    // Child is ~18 months now, so gets 12-24 month suggestions
    expect(result.dietary_suggestions).toContain("family foods");
  });

  it("should provide default doctor questions when percentiles are normal", () => {
    // Female newborn at p50
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 3.2, height_cm: 49.0, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.doctor_questions).toContain("tracking well");
  });

  it("should include head circumference analysis for young children", () => {
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 3.2, height_cm: 49.0, head_circumference_cm: 33.9 },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.growth_summary).toContain("Head circumference");
  });

  // ----- Percentile-aware dietary advice tests -----

  it("should give calorie-dense food advice for low-weight infant", () => {
    // Female 6mo at very low weight (well below p3 = 5.8)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2025-02-24", weight_kg: 4.0, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    // Should contain both baseline diet AND low-weight specific advice
    expect(result.dietary_suggestions).toContain("calorie-dense");
    expect(result.dietary_suggestions).toContain("underweight");
  });

  it("should give portion-control advice for high-weight toddler", () => {
    // Male 18mo boy well above p97 weight (p97 at 18mo = 13.3, so 15 kg is high)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2026-02-24", weight_kg: 15.0, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "male",
    };

    const result = generateGrowthInsights(input);
    expect(result.dietary_suggestions).toContain("above average for weight");
    expect(result.dietary_suggestions).toContain("portion");
  });

  it("should give dropping-weight dietary boost advice on percentile crossing down", () => {
    // Weight drops significantly: 50th at birth, below 3rd at 6mo
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 3.2, height_cm: null, head_circumference_cm: null },
        { measured_date: "2025-02-24", weight_kg: 5.0, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.dietary_suggestions).toContain("dropping");
    expect(result.dietary_suggestions).toContain("calorie density");
  });

  it("should recommend appetite-stimulating play for underweight children", () => {
    // Female 6mo at very low weight
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2025-02-24", weight_kg: 5.0, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.activity_tips).toContain("appetite");
  });

  it("should recommend more active play for overweight children", () => {
    // Male 18mo well above p97
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2026-02-24", weight_kg: 15.0, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "male",
    };

    const result = generateGrowthInsights(input);
    expect(result.activity_tips).toContain("active play");
  });

  it("should recommend sleep for short-stature children", () => {
    // Female newborn with very short length (below p3 at birth = 45.6)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: null, height_cm: 43.0, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.activity_tips).toContain("sleep");
    expect(result.activity_tips).toContain("growth");
  });

  it("should ask about feeding difficulties for very underweight child", () => {
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 1.5, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.doctor_questions).toContain("below the 3rd percentile");
    expect(result.doctor_questions).toContain("dietitian");
  });

  it("should ask about hormonal factors for very overweight child", () => {
    // Male newborn way above p97 (p97 = 4.2, use 5.5)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 5.5, height_cm: null, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "male",
    };

    const result = generateGrowthInsights(input);
    expect(result.doctor_questions).toContain("97th percentile");
  });

  it("should ask about growth hormone for very short child", () => {
    // Female newborn, p3 = 45.6, so 37.0 maps to percentile < 3
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: null, height_cm: 37.0, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.doctor_questions).toContain("growth hormone");
  });

  it("should flag divergent weight vs height percentiles", () => {
    // Female newborn: very heavy (above p97 = 4.0) but very short (below p3 = 45.6)
    const input: GrowthInsightsInput = {
      measurements: [
        { measured_date: "2024-08-24", weight_kg: 4.5, height_cm: 43.0, head_circumference_cm: null },
      ],
      dateOfBirth: "2024-08-24",
      gender: "female",
    };

    const result = generateGrowthInsights(input);
    expect(result.doctor_questions).toContain("weight percentile is much higher");
  });
});
