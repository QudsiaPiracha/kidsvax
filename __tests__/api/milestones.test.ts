import {
  listMilestones,
  toggleMilestone,
} from "@/lib/services/milestones";

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

const CHILD_ROW = {
  id: "child-1",
  user_id: "user-1",
  name: "Max",
  date_of_birth: "2023-06-15",
  gender: "male",
};

const MILESTONE_RECORDS = [
  {
    id: "rec-1",
    child_id: "child-1",
    milestone_id: "ms-1",
    achieved: false,
    observed_date: null,
    milestone: {
      id: "ms-1",
      u_exam: "U3",
      category: "motor",
      title_en: "Lifts head",
      title_de: "Hebt den Kopf",
    },
  },
  {
    id: "rec-2",
    child_id: "child-1",
    milestone_id: "ms-2",
    achieved: true,
    observed_date: "2024-01-15",
    milestone: {
      id: "ms-2",
      u_exam: "U3",
      category: "language",
      title_en: "Coos",
      title_de: "Gurrt",
    },
  },
  {
    id: "rec-3",
    child_id: "child-1",
    milestone_id: "ms-3",
    achieved: false,
    observed_date: null,
    milestone: {
      id: "ms-3",
      u_exam: "U4",
      category: "social_cognitive",
      title_en: "Smiles responsively",
      title_de: "Laechelt responsiv",
    },
  },
];

// -----------------------------------------------------------------------
// GET /api/children/[id]/milestones
// -----------------------------------------------------------------------
describe("GET /api/children/[id]/milestones", () => {
  it("should return milestones grouped by U-exam", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const listChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: MILESTONE_RECORDS,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : listChain;
    });

    const result = await listMilestones("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const groups = body.milestones as Record<string, unknown>;
    expect(groups).toHaveProperty("U3");
    expect(groups).toHaveProperty("U4");
  });

  it("should include category (motor, language, social_cognitive)", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const listChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: MILESTONE_RECORDS,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : listChain;
    });

    const result = await listMilestones("child-1", sb as never);
    const body = result.body as Record<string, unknown>;
    const groups = body.milestones as Record<string, Record<string, unknown>[]>;
    const u3Items = groups["U3"] as Record<string, unknown>[];
    const categories = u3Items.map((m) => {
      const ms = m.milestone as Record<string, unknown>;
      return ms.category;
    });
    expect(categories).toContain("motor");
    expect(categories).toContain("language");
  });

  it("should include current achieved status for each milestone", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const listChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: MILESTONE_RECORDS,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : listChain;
    });

    const result = await listMilestones("child-1", sb as never);
    const body = result.body as Record<string, unknown>;
    const groups = body.milestones as Record<string, Record<string, unknown>[]>;
    const u3Items = groups["U3"];
    expect(u3Items[0].achieved).toBe(false);
    expect(u3Items[1].achieved).toBe(true);
  });
});

// -----------------------------------------------------------------------
// PUT /api/milestone-records/[id]
// -----------------------------------------------------------------------
describe("PUT /api/milestone-records/[id]", () => {
  it("should toggle achieved from false to true", async () => {
    const existingRecord = { ...MILESTONE_RECORDS[0] };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: existingRecord,
        error: null,
      }),
    };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const updatedRecord = {
      ...existingRecord,
      achieved: true,
      observed_date: "2024-06-15",
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: updatedRecord,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return selectChain;
      if (callCount === 2) return childChain;
      return updateChain;
    });

    const result = await toggleMilestone("rec-1", sb as never, {
      achieved: true,
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.achieved).toBe(true);
  });

  it("should toggle achieved from true to false", async () => {
    const existingRecord = { ...MILESTONE_RECORDS[1] };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: existingRecord,
        error: null,
      }),
    };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const updatedRecord = {
      ...existingRecord,
      achieved: false,
      observed_date: null,
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: updatedRecord,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return selectChain;
      if (callCount === 2) return childChain;
      return updateChain;
    });

    const result = await toggleMilestone("rec-2", sb as never, {
      achieved: false,
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.achieved).toBe(false);
  });

  it("should set observed_date when marking as achieved", async () => {
    const existingRecord = { ...MILESTONE_RECORDS[0] };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: existingRecord,
        error: null,
      }),
    };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const today = new Date().toISOString().split("T")[0];
    const updatedRecord = {
      ...existingRecord,
      achieved: true,
      observed_date: today,
    };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: updatedRecord,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return selectChain;
      if (callCount === 2) return childChain;
      return updateChain;
    });

    const result = await toggleMilestone("rec-1", sb as never, {
      achieved: true,
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.observed_date).toBe(today);
  });

  it("should return 403 for another user's child", async () => {
    const existingRecord = { ...MILESTONE_RECORDS[0] };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: existingRecord,
        error: null,
      }),
    };
    const otherChild = { ...CHILD_ROW, user_id: "user-other" };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: otherChild, error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return selectChain;
      return childChain;
    });

    const result = await toggleMilestone("rec-1", sb as never, {
      achieved: true,
    });

    expect(result.status).toBe(403);
  });
});
