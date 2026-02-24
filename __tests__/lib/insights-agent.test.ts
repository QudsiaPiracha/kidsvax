import {
  createInsightsAgentConfig,
  anonymizeChildData,
  parseInsightsResult,
} from "@/lib/agents/insights-agent";

// -----------------------------------------------------------------------
// Insights Agent Config
// -----------------------------------------------------------------------
describe("Insights Agent Config", () => {
  const CHILD_DATA = {
    age_months: 18,
    gender: "male" as const,
    measurements: [
      { height_cm: 82, weight_kg: 11.5, measured_date: "2024-12-15" },
      { height_cm: 75, weight_kg: 9.5, measured_date: "2024-06-15" },
    ],
    milestones: [
      { name: "first_steps", achieved_date: "2024-11-01" },
    ],
  };

  it("should create agent config with claude-sonnet-4-6 model", () => {
    const config = createInsightsAgentConfig(CHILD_DATA);
    expect(config.model).toBe("claude-sonnet-4-6");
  });

  it("should include system prompt with pediatric guidelines context", () => {
    const config = createInsightsAgentConfig(CHILD_DATA);
    expect(config.systemPrompt).toContain("pediatric");
    expect(config.systemPrompt).toContain("STIKO");
  });

  it("should send only anonymized data (age, gender -- no name)", () => {
    const child = {
      first_name: "Max",
      last_name: "Mustermann",
      date_of_birth: "2023-06-15",
      gender: "male" as const,
    };
    const measurements = [
      { height_cm: 75, weight_kg: 9.5, measured_date: "2024-06-15" },
    ];
    const milestones = [
      { name: "first_steps", achieved_date: "2024-11-01" },
    ];

    const anonymized = anonymizeChildData(child, measurements, milestones);

    expect(anonymized).not.toHaveProperty("first_name");
    expect(anonymized).not.toHaveProperty("last_name");
    expect(anonymized).toHaveProperty("age_months");
    expect(anonymized).toHaveProperty("gender");
    expect(anonymized).toHaveProperty("measurements");
  });

  it("should set maxTurns and maxBudgetUsd for cost control", () => {
    const config = createInsightsAgentConfig(CHILD_DATA);
    expect(config.maxTurns).toBeDefined();
    expect(config.maxTurns).toBeLessThanOrEqual(10);
    expect(config.maxBudgetUsd).toBeDefined();
    expect(config.maxBudgetUsd).toBeLessThanOrEqual(0.5);
  });

  it("should return structured JSON with trend_summary section", () => {
    const rawOutput = JSON.stringify({
      trend_summary: "Child is growing at a healthy pace.",
      dietary_suggestions: ["Include iron-rich foods"],
      doctor_questions: ["Ask about vitamin D supplementation"],
      disclaimer: "General guidance, not medical advice.",
    });

    const result = parseInsightsResult(rawOutput);
    expect(result.trend_summary).toBe(
      "Child is growing at a healthy pace."
    );
  });

  it("should return structured JSON with dietary_suggestions section", () => {
    const rawOutput = JSON.stringify({
      trend_summary: "Growing well",
      dietary_suggestions: [
        "Include iron-rich foods",
        "Ensure adequate calcium intake",
      ],
      doctor_questions: ["Ask about vitamin D"],
      disclaimer: "General guidance, not medical advice.",
    });

    const result = parseInsightsResult(rawOutput);
    expect(result.dietary_suggestions).toHaveLength(2);
    expect(result.dietary_suggestions[0]).toContain("iron");
  });

  it("should return structured JSON with doctor_questions section", () => {
    const rawOutput = JSON.stringify({
      trend_summary: "Growing well",
      dietary_suggestions: ["More iron"],
      doctor_questions: [
        "Ask about vitamin D supplementation",
        "Discuss sleep patterns",
      ],
      disclaimer: "General guidance, not medical advice.",
    });

    const result = parseInsightsResult(rawOutput);
    expect(result.doctor_questions).toHaveLength(2);
  });

  it("should include medical disclaimer in output", () => {
    const rawOutput = JSON.stringify({
      trend_summary: "Growing well",
      dietary_suggestions: ["More iron"],
      doctor_questions: ["Ask about vitamin D"],
      disclaimer: "General guidance, not medical advice.",
    });

    const result = parseInsightsResult(rawOutput);
    expect(result.disclaimer).toContain("not medical advice");
  });
});
