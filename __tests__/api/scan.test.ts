import {
  processScan,
  confirmScanVaccinations,
  confirmScanUExams,
} from "@/lib/services/scan";

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
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

const VALID_BASE64 = "data:image/png;base64," + "A".repeat(100);
const LARGE_BASE64 = "data:image/png;base64," + "A".repeat(3_000_000);

const MOCK_SCAN_RESULT = {
  document_type: "vaccination_record" as const,
  confidence: 0.92,
  extracted_items: [
    {
      vaccine_name: "MMR",
      dose_number: 1,
      administered_date: "2024-06-15",
      physician_name: "Dr. Mueller",
      confidence: 0.95,
    },
  ],
  low_confidence_fields: [],
};

const MOCK_RUN_AGENT = jest.fn();
jest.mock("@/lib/agents/scan-agent", () => ({
  ...jest.requireActual("@/lib/agents/scan-agent"),
  runScanAgent: (...args: unknown[]) => MOCK_RUN_AGENT(...args),
}));

// -----------------------------------------------------------------------
// POST /api/scan
// -----------------------------------------------------------------------
describe("POST /api/scan", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MOCK_RUN_AGENT.mockResolvedValue(MOCK_SCAN_RESULT);
  });

  it("should accept base64 image and document_type", async () => {
    const sb = createMockSupabase();
    const result = await processScan(
      sb as never,
      { image: VALID_BASE64, document_type: "vaccination_record" }
    );
    expect(result.status).toBe(200);
    expect(result.body).toBeDefined();
  });

  it("should reject image larger than 2MB", async () => {
    const sb = createMockSupabase();
    const result = await processScan(
      sb as never,
      { image: LARGE_BASE64, document_type: "vaccination_record" }
    );
    expect(result.status).toBe(400);
    const body = result.body as Record<string, unknown>;
    expect(body.error).toContain("2MB");
  });

  it("should reject invalid document_type", async () => {
    const sb = createMockSupabase();
    const result = await processScan(
      sb as never,
      { image: VALID_BASE64, document_type: "invalid_type" }
    );
    expect(result.status).toBe(400);
  });

  it("should return structured extraction result", async () => {
    const sb = createMockSupabase();
    const result = await processScan(
      sb as never,
      { image: VALID_BASE64, document_type: "vaccination_record" }
    );
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.document_type).toBe("vaccination_record");
    expect(body.extracted_items).toBeDefined();
    expect(body.confidence).toBeGreaterThan(0);
  });

  it("should return 429 after rate limit exceeded", async () => {
    const sb = createMockSupabase();
    const input = { image: VALID_BASE64, document_type: "vaccination_record" };
    // Exhaust rate limit (10 per hour)
    for (let i = 0; i < 10; i++) {
      await processScan(sb as never, input, "user-rate-test");
    }
    const result = await processScan(sb as never, input, "user-rate-test");
    expect(result.status).toBe(429);
  });
});

// -----------------------------------------------------------------------
// POST /api/scan/confirm
// -----------------------------------------------------------------------
describe("POST /api/scan/confirm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should write vaccination records to database", async () => {
    const insertChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "vax-1" },
        error: null,
      }),
    };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "child-1", user_id: "user-1" },
        error: null,
      }),
    };
    const existingChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return childChain;
      if (callCount === 2) return existingChain;
      return insertChain;
    });

    const result = await confirmScanVaccinations(sb as never, {
      child_id: "child-1",
      items: [
        {
          vaccine_name: "MMR",
          dose_number: 1,
          administered_date: "2024-06-15",
          physician_name: "Dr. Mueller",
        },
      ],
    });

    expect(result.status).toBe(201);
  });

  it("should write u_exam records to database", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "child-1", user_id: "user-1" },
        error: null,
      }),
    };
    const existingChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    const insertChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "uexam-1" },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return childChain;
      if (callCount === 2) return existingChain;
      return insertChain;
    });

    const result = await confirmScanUExams(sb as never, {
      child_id: "child-1",
      items: [
        {
          exam_type: "U3",
          exam_date: "2024-03-15",
          physician_name: "Dr. Schmidt",
        },
      ],
    });

    expect(result.status).toBe(201);
  });

  it("should skip duplicate records", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "child-1", user_id: "user-1" },
        error: null,
      }),
    };
    const existingChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: "existing-1",
            vaccine_name: "MMR",
            dose_number: 1,
            administered_date: "2024-06-15",
          },
        ],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return childChain;
      return existingChain;
    });

    const result = await confirmScanVaccinations(sb as never, {
      child_id: "child-1",
      items: [
        {
          vaccine_name: "MMR",
          dose_number: 1,
          administered_date: "2024-06-15",
          physician_name: "Dr. Mueller",
        },
      ],
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.skipped).toBe(1);
  });

  it("should flag conflicting records for review", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "child-1", user_id: "user-1" },
        error: null,
      }),
    };
    const existingChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: "existing-1",
            vaccine_name: "MMR",
            dose_number: 1,
            administered_date: "2024-05-10",
          },
        ],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return childChain;
      return existingChain;
    });

    const result = await confirmScanVaccinations(sb as never, {
      child_id: "child-1",
      items: [
        {
          vaccine_name: "MMR",
          dose_number: 1,
          administered_date: "2024-06-15",
          physician_name: "Dr. Mueller",
        },
      ],
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.conflicts).toBeDefined();
    const conflicts = body.conflicts as unknown[];
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
