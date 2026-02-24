import {
  listVaccinationRecords,
  updateVaccinationRecord,
} from "@/lib/services/vaccinations";

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

const VACCINE_REF = {
  name_en: "MMR",
  name_de: "MMR",
  protects_against_en: "Measles, Mumps, Rubella",
  protects_against_de: "Masern, Mumps, Roeteln",
  total_doses: 2,
};

const VAX_RECORD = {
  id: "vax-rec-1",
  child_id: "child-1",
  vaccine_id: "vaccine-1",
  dose_number: 1,
  status: "scheduled",
  scheduled_date: "2024-11-15",
  administered_date: null,
  physician_name: null,
  product_name: null,
  lot_number: null,
  injection_site: null,
  skip_reason: null,
  vaccines: VACCINE_REF,
};

const CHILD_ROW = {
  id: "child-1",
  user_id: "user-1",
};

// -----------------------------------------------------------------------
// GET /api/children/[id]/vaccinations
// -----------------------------------------------------------------------
describe("GET /api/children/[id]/vaccinations", () => {
  it("should return all vaccination records for a child ordered by scheduled_date", async () => {
    const secondRecord = { ...VAX_RECORD, id: "vax-rec-2", dose_number: 2, scheduled_date: "2025-05-15" };
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const recordsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [VAX_RECORD, secondRecord],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : recordsChain;
    });

    const result = await listVaccinationRecords("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const records = body.records as unknown[];
    expect(records).toHaveLength(2);
  });

  it("should include vaccine reference data (name, protects_against)", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const recordsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [VAX_RECORD],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : recordsChain;
    });

    const result = await listVaccinationRecords("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const records = body.records as Record<string, unknown>[];
    expect(records[0].vaccines).toEqual(VACCINE_REF);
  });

  it("should include dose number and total doses", async () => {
    const childChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const recordsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [VAX_RECORD],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    let callCount = 0;
    sb.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? childChain : recordsChain;
    });

    const result = await listVaccinationRecords("child-1", sb as never);

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const records = body.records as Record<string, unknown>[];
    expect(records[0].dose_number).toBe(1);
    const vaccine = records[0].vaccines as Record<string, unknown>;
    expect(vaccine.total_doses).toBe(2);
  });
});

// -----------------------------------------------------------------------
// PUT /api/vaccination-records/[id]
// -----------------------------------------------------------------------
describe("PUT /api/vaccination-records/[id]", () => {
  it("should mark vaccination as administered with date and physician", async () => {
    const updated = {
      ...VAX_RECORD,
      status: "administered",
      administered_date: "2024-11-16",
      physician_name: "Dr. Mueller",
    };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...VAX_RECORD, children: CHILD_ROW },
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

    const result = await updateVaccinationRecord("vax-rec-1", sb as never, {
      status: "administered",
      administered_date: "2024-11-16",
      physician_name: "Dr. Mueller",
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.status).toBe("administered");
  });

  it("should accept optional product_name, lot_number, injection_site", async () => {
    const updated = {
      ...VAX_RECORD,
      status: "administered",
      administered_date: "2024-11-16",
      physician_name: "Dr. Mueller",
      product_name: "Priorix",
      lot_number: "ABC123",
      injection_site: "left_thigh",
    };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...VAX_RECORD, children: CHILD_ROW },
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

    const result = await updateVaccinationRecord("vax-rec-1", sb as never, {
      status: "administered",
      administered_date: "2024-11-16",
      physician_name: "Dr. Mueller",
      product_name: "Priorix",
      lot_number: "ABC123",
      injection_site: "left_thigh",
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.product_name).toBe("Priorix");
    expect(record.lot_number).toBe("ABC123");
    expect(record.injection_site).toBe("left_thigh");
  });

  it("should reject administering without a date", async () => {
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...VAX_RECORD, children: CHILD_ROW },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(fetchChain);

    const result = await updateVaccinationRecord("vax-rec-1", sb as never, {
      status: "administered",
      physician_name: "Dr. Mueller",
    });

    expect(result.status).toBe(400);
  });

  it("should mark vaccination as skipped with reason", async () => {
    const updated = { ...VAX_RECORD, status: "skipped", skip_reason: "Parent declined" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...VAX_RECORD, children: CHILD_ROW },
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

    const result = await updateVaccinationRecord("vax-rec-1", sb as never, {
      status: "skipped",
      skip_reason: "Parent declined",
    });

    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const record = body.record as Record<string, unknown>;
    expect(record.status).toBe("skipped");
  });

  it("should return 403 for another user's child's vaccination", async () => {
    const otherChild = { id: "child-other", user_id: "user-other" };
    const fetchChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...VAX_RECORD, children: otherChild },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(fetchChain);

    const result = await updateVaccinationRecord("vax-rec-1", sb as never, {
      status: "skipped",
      skip_reason: "Parent declined",
    });

    expect(result.status).toBe(403);
  });
});
