import {
  createMeasurement,
  listMeasurements,
  updateMeasurement,
  deleteMeasurement,
} from "@/lib/services/growth";

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

const VALID_MEASUREMENT = {
  height_cm: 75.5,
  weight_kg: 9.2,
  head_circumference_cm: 45.0,
};

const MEASUREMENT_ROW = {
  id: "meas-1",
  child_id: "child-1",
  height_cm: 75.5,
  weight_kg: 9.2,
  head_circumference_cm: 45.0,
  bmi: 16.13,
  measured_date: "2024-06-15",
  created_at: "2024-06-15T00:00:00Z",
};

// -----------------------------------------------------------------------
// POST - create measurement
// -----------------------------------------------------------------------
describe("POST /api/children/[id]/growth", () => {
  it("should create a measurement with height, weight, head_circumference", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const insertChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: MEASUREMENT_ROW,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : insertChain;
    });

    const result = await createMeasurement("child-1", sb as never, VALID_MEASUREMENT);

    expect(result.status).toBe(201);
    const body = result.body as Record<string, unknown>;
    const meas = body.measurement as Record<string, unknown>;
    expect(meas.height_cm).toBe(75.5);
    expect(meas.weight_kg).toBe(9.2);
    expect(meas.head_circumference_cm).toBe(45.0);
  });

  it("should accept optional measured_date (defaults to today)", async () => {
    const today = new Date().toISOString().split("T")[0];
    const rowWithToday = { ...MEASUREMENT_ROW, measured_date: today };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const insertChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: rowWithToday,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : insertChain;
    });

    const result = await createMeasurement("child-1", sb as never, {
      ...VALID_MEASUREMENT,
    });

    expect(result.status).toBe(201);
    const body = result.body as Record<string, unknown>;
    const meas = body.measurement as Record<string, unknown>;
    expect(meas.measured_date).toBe(today);
  });

  it("should reject negative values", async () => {
    const sb = createMockSupabase();
    const result = await createMeasurement("child-1", sb as never, {
      height_cm: -10,
      weight_kg: 9.2,
    });

    expect(result.status).toBe(400);
    expect((result.body as Record<string, unknown>).error).toBeDefined();
  });

  it("should reject measurement for another user's child", async () => {
    const otherChild = { ...CHILD_ROW, user_id: "user-other" };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: otherChild, error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(childChain);

    const result = await createMeasurement("child-1", sb as never, VALID_MEASUREMENT);

    expect(result.status).toBe(403);
  });
});

// -----------------------------------------------------------------------
// GET - list measurements
// -----------------------------------------------------------------------
describe("GET /api/children/[id]/growth", () => {
  it("should return measurements ordered by measured_date ascending", async () => {
    const m1 = { ...MEASUREMENT_ROW, measured_date: "2024-03-01" };
    const m2 = { ...MEASUREMENT_ROW, id: "meas-2", measured_date: "2024-06-01" };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const listChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [m1, m2],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : listChain;
    });

    const result = await listMeasurements("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const measurements = body.measurements as Record<string, unknown>[];
    expect(measurements).toHaveLength(2);
    expect(measurements[0].measured_date).toBe("2024-03-01");
    expect(measurements[1].measured_date).toBe("2024-06-01");
  });
});

// -----------------------------------------------------------------------
// PUT - update measurement
// -----------------------------------------------------------------------
describe("PUT /api/growth-measurements/[id]", () => {
  it("should update a measurement", async () => {
    const existingRow = {
      ...MEASUREMENT_ROW,
      child_id: "child-1",
    };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: existingRow, error: null }),
    };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const updatedRow = { ...existingRow, weight_kg: 10.0, bmi: 17.53 };
    const updateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updatedRow, error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return selectChain;
      if (callCount === 2) return childChain;
      return updateChain;
    });

    const result = await updateMeasurement("meas-1", sb as never, {
      weight_kg: 10.0,
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const meas = body.measurement as Record<string, unknown>;
    expect(meas.weight_kg).toBe(10.0);
  });
});

// -----------------------------------------------------------------------
// DELETE - remove measurement
// -----------------------------------------------------------------------
describe("DELETE /api/growth-measurements/[id]", () => {
  it("should remove a measurement", async () => {
    const existingRow = { ...MEASUREMENT_ROW, child_id: "child-1" };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: existingRow, error: null }),
    };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const deleteChain = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return selectChain;
      if (callCount === 2) return childChain;
      return deleteChain;
    });

    const result = await deleteMeasurement("meas-1", sb as never);

    expect(result.status).toBe(204);
  });
});
