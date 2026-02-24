import {
  listUExamRecords,
  updateUExamRecord,
} from "@/lib/services/u-exams";

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
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

const U_EXAM_REF = {
  name: "U3",
  description_en: "3rd exam",
  description_de: "3. Untersuchung",
  category: "u_exam",
  recommended_age_months: 1,
  tolerance_from_months: 0.75,
  tolerance_to_months: 2,
};

const EXAM_RECORD = {
  id: "rec-1",
  child_id: "child-1",
  u_exam_id: "uexam-1",
  status: "scheduled",
  scheduled_date: "2024-07-15",
  completed_date: null,
  physician_name: null,
  findings_notes: null,
  parent_observations: null,
  referrals: null,
  u_exams: U_EXAM_REF,
};

const CHILD_ROW = {
  id: "child-1",
  user_id: "user-1",
};

// -----------------------------------------------------------------------
// GET /api/children/[id]/u-exams
// -----------------------------------------------------------------------
describe("GET /api/children/[id]/u-exams", () => {
  it("should return all U-exam records for a child ordered by scheduled_date", async () => {
    const secondRecord = { ...EXAM_RECORD, id: "rec-2", scheduled_date: "2024-09-15" };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const recordsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [EXAM_RECORD, secondRecord],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : recordsChain;
    });

    const result = await listUExamRecords("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const records = body.records as unknown[];
    expect(records).toHaveLength(2);
  });

  it("should include U-exam reference data (name, description)", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const recordsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [EXAM_RECORD],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : recordsChain;
    });

    const result = await listUExamRecords("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const records = body.records as Record<string, unknown>[];
    expect(records[0].u_exams).toEqual(U_EXAM_REF);
  });

  it("should include status badge based on current date vs scheduled_date", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const recordsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [EXAM_RECORD],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : recordsChain;
    });

    const result = await listUExamRecords("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const records = body.records as Record<string, unknown>[];
    expect(records[0]).toHaveProperty("status_badge");
  });
});

// -----------------------------------------------------------------------
// PUT /api/u-exam-records/[id]
// -----------------------------------------------------------------------
describe("PUT /api/u-exam-records/[id]", () => {
  it("should mark exam as completed with date and physician_name", async () => {
    const updated = { ...EXAM_RECORD, status: "completed", completed_date: "2024-07-16", physician_name: "Dr. Schmidt" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, child_id: "child-1", children: CHILD_ROW },
        error: null,
      }),
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? fetchChain : updateChain;
    });

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "completed",
      completed_date: "2024-07-16",
      physician_name: "Dr. Schmidt",
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.status).toBe("completed");
  });

  it("should reject completing without a date", async () => {
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, children: CHILD_ROW },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(fetchChain);

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "completed",
      physician_name: "Dr. Schmidt",
    });

    expect(result.status).toBe(400);
  });

  it("should reject completing without a physician_name", async () => {
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, children: CHILD_ROW },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(fetchChain);

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "completed",
      completed_date: "2024-07-16",
    });

    expect(result.status).toBe(400);
  });

  it("should allow adding findings_notes", async () => {
    const updated = { ...EXAM_RECORD, status: "completed", findings_notes: "All normal" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, children: CHILD_ROW },
        error: null,
      }),
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? fetchChain : updateChain;
    });

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "completed",
      completed_date: "2024-07-16",
      physician_name: "Dr. Schmidt",
      findings_notes: "All normal",
    });

    expect(result.status).toBe(200);
  });

  it("should allow adding parent_observations", async () => {
    const updated = { ...EXAM_RECORD, status: "completed", parent_observations: "Sleeping well" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, children: CHILD_ROW },
        error: null,
      }),
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? fetchChain : updateChain;
    });

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "completed",
      completed_date: "2024-07-16",
      physician_name: "Dr. Schmidt",
      parent_observations: "Sleeping well",
    });

    expect(result.status).toBe(200);
  });

  it("should allow adding referrals", async () => {
    const updated = { ...EXAM_RECORD, status: "completed", referrals: "ENT specialist" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, children: CHILD_ROW },
        error: null,
      }),
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? fetchChain : updateChain;
    });

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "completed",
      completed_date: "2024-07-16",
      physician_name: "Dr. Schmidt",
      referrals: "ENT specialist",
    });

    expect(result.status).toBe(200);
  });

  it("should mark exam as skipped", async () => {
    const updated = { ...EXAM_RECORD, status: "skipped" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, children: CHILD_ROW },
        error: null,
      }),
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? fetchChain : updateChain;
    });

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "skipped",
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.status).toBe("skipped");
  });

  it("should return 403 for another user's child's exam record", async () => {
    const otherChild = { id: "child-other", user_id: "user-other" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...EXAM_RECORD, children: otherChild },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(fetchChain);

    const result = await updateUExamRecord("rec-1", sb as never, {
      status: "skipped",
    });

    expect(result.status).toBe(403);
  });
});
