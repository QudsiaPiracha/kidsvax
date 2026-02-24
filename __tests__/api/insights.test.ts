import {
  getInsights,
  refreshInsights,
} from "@/lib/services/insights";

// --- helpers -----------------------------------------------------------

function createMockSupabase() {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

const CHILD_ROW = {
  id: "child-1",
  user_id: "user-1",
  first_name: "Max",
  date_of_birth: "2023-06-15",
  gender: "male",
};

const CACHED_INSIGHT = {
  id: "insight-1",
  child_id: "child-1",
  content: JSON.stringify({
    trend_summary: "Growing well",
    dietary_suggestions: ["More iron-rich foods"],
    doctor_questions: ["Ask about vitamin D"],
    disclaimer: "General guidance, not medical advice.",
  }),
  language: "en",
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

const MOCK_RUN_AGENT = jest.fn();
jest.mock("@/lib/agents/insights-agent", () => ({
  ...jest.requireActual("@/lib/agents/insights-agent"),
  runInsightsAgent: (...args: unknown[]) => MOCK_RUN_AGENT(...args),
}));

// -----------------------------------------------------------------------
// GET /api/children/[id]/insights
// -----------------------------------------------------------------------
describe("GET /api/children/[id]/insights", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return cached insights if valid", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: CHILD_ROW,
        error: null,
      }),
    };
    const insightChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [CACHED_INSIGHT],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : insightChain;
    });

    const result = await getInsights("child-1", sb as never, "en");
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const insights = body.insights as unknown[];
    expect(insights).toHaveLength(1);
  });

  it("should return empty array if no insights generated yet", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: CHILD_ROW,
        error: null,
      }),
    };
    const insightChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : insightChain;
    });

    const result = await getInsights("child-1", sb as never, "en");
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.insights).toEqual([]);
  });

  it("should return insights in the user's preferred language", async () => {
    const deInsight = {
      ...CACHED_INSIGHT,
      language: "de",
      content: JSON.stringify({
        trend_summary: "Wachstum normal",
        dietary_suggestions: ["Mehr Eisen"],
        doctor_questions: ["Fragen Sie nach Vitamin D"],
        disclaimer: "Allgemeine Hinweise, keine medizinische Beratung.",
      }),
    };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: CHILD_ROW,
        error: null,
      }),
    };
    const insightChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [deInsight],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : insightChain;
    });

    const result = await getInsights("child-1", sb as never, "de");
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const insights = body.insights as Record<string, unknown>[];
    expect(insights[0].language).toBe("de");
  });
});

// -----------------------------------------------------------------------
// POST /api/children/[id]/insights/refresh
// -----------------------------------------------------------------------
describe("POST /api/children/[id]/insights/refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MOCK_RUN_AGENT.mockResolvedValue({
      trend_summary: "Growing well",
      dietary_suggestions: ["More iron-rich foods"],
      doctor_questions: ["Ask about vitamin D"],
      disclaimer: "General guidance, not medical advice.",
    });
  });

  it("should generate new insights", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: CHILD_ROW,
        error: null,
      }),
    };
    const measurementsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [{ height_cm: 75, weight_kg: 9.5, measured_date: "2024-06-15" }],
        error: null,
      }),
    };
    const deleteChain = {
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockResolvedValue({ error: null }),
    };
    const insertChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "insight-new", content: "{}" },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return childChain;
      if (callCount === 2) return measurementsChain;
      if (callCount === 3) return deleteChain;
      return insertChain;
    });

    const result = await refreshInsights("child-1", sb as never, "en");
    expect(result.status).toBe(201);
  });

  it("should invalidate old cached insights", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: CHILD_ROW,
        error: null,
      }),
    };
    const measurementsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [{ height_cm: 75, weight_kg: 9.5, measured_date: "2024-06-15" }],
        error: null,
      }),
    };
    const deleteChain = {
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockResolvedValue({ error: null }),
    };
    const insertChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "insight-new", content: "{}" },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return childChain;
      if (callCount === 2) return measurementsChain;
      if (callCount === 3) return deleteChain;
      return insertChain;
    });

    await refreshInsights("child-1", sb as never, "en");
    // Verify the delete chain was called (3rd call)
    expect(deleteChain.delete).toHaveBeenCalled();
  });

  it("should return 403 for another user's child", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...CHILD_ROW, user_id: "other-user" },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(childChain);

    const result = await refreshInsights("child-1", sb as never, "en");
    expect(result.status).toBe(403);
  });
});
