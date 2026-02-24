import {
  listChildren,
  createChild,
  getChild,
  updateChild,
  deleteChild,
} from "@/lib/services/children";

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
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

const VALID_CHILD = {
  name: "Max",
  date_of_birth: "2023-06-15",
  gender: "male" as const,
};

const CHILD_ROW = {
  id: "child-1",
  user_id: "user-1",
  name: "Max",
  date_of_birth: "2023-06-15",
  gender: "male",
  is_premature: false,
  allergies: null,
  notes: null,
  photo_url: null,
  blood_type: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// -----------------------------------------------------------------------
// POST /api/children
// -----------------------------------------------------------------------
describe("POST /api/children", () => {
  it("should create a child with valid data", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await createChild(sb as never, VALID_CHILD);

    expect(result.status).toBe(201);
    expect((result.body as Record<string, unknown>).child).toEqual(CHILD_ROW);
  });

  it("should reject missing name", async () => {
    const sb = createMockSupabase();
    const result = await createChild(sb as never, {
      date_of_birth: "2023-06-15",
      gender: "male",
    });

    expect(result.status).toBe(400);
    expect((result.body as Record<string, unknown>).error).toBeDefined();
  });

  it("should reject missing date_of_birth", async () => {
    const sb = createMockSupabase();
    const result = await createChild(sb as never, {
      name: "Max",
      gender: "male",
    });

    expect(result.status).toBe(400);
  });

  it("should reject DOB in the future", async () => {
    const sb = createMockSupabase();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const result = await createChild(sb as never, {
      ...VALID_CHILD,
      date_of_birth: futureDate.toISOString().split("T")[0],
    });

    expect(result.status).toBe(400);
  });

  it("should default is_premature to false", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await createChild(sb as never, VALID_CHILD);

    expect(result.status).toBe(201);
    const child = (result.body as Record<string, unknown>).child as Record<string, unknown>;
    expect(child.is_premature).toBe(false);
  });

  it("should accept optional allergies and notes", async () => {
    const childWithExtras = {
      ...CHILD_ROW,
      allergies: "Penicillin",
      notes: "Born via C-section",
    };
    const chain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: childWithExtras,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await createChild(sb as never, {
      ...VALID_CHILD,
      allergies: "Penicillin",
      notes: "Born via C-section",
    });

    expect(result.status).toBe(201);
    const child = (result.body as Record<string, unknown>).child as Record<string, unknown>;
    expect(child.allergies).toBe("Penicillin");
    expect(child.notes).toBe("Born via C-section");
  });
});

// -----------------------------------------------------------------------
// GET /api/children
// -----------------------------------------------------------------------
describe("GET /api/children", () => {
  it("should return empty array for new user", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await listChildren(sb as never);

    expect(result.status).toBe(200);
    expect((result.body as Record<string, unknown>).children).toEqual([]);
  });

  it("should return all children for the user", async () => {
    const secondChild = { ...CHILD_ROW, id: "child-2", name: "Lisa" };
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [CHILD_ROW, secondChild],
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await listChildren(sb as never);

    expect(result.status).toBe(200);
    const children = (result.body as Record<string, unknown>).children as unknown[];
    expect(children).toHaveLength(2);
  });

  it("should not return another user's children", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await listChildren(sb as never);

    expect((result.body as Record<string, unknown>).children).toEqual([]);
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
  });
});

// -----------------------------------------------------------------------
// GET /api/children/[id]
// -----------------------------------------------------------------------
describe("GET /api/children/[id]", () => {
  it("should return child with profile data", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await getChild("child-1", sb as never);

    expect(result.status).toBe(200);
    const child = (result.body as Record<string, unknown>).child as Record<string, unknown>;
    expect(child.id).toBe("child-1");
  });

  it("should return 404 for non-existent child", async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "not found" },
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await getChild("nonexistent", sb as never);

    expect(result.status).toBe(404);
  });

  it("should return 403 for another user's child", async () => {
    const otherChild = { ...CHILD_ROW, user_id: "user-other" };
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: otherChild, error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(chain);

    const result = await getChild("child-1", sb as never);

    expect(result.status).toBe(403);
  });
});

// -----------------------------------------------------------------------
// PUT /api/children/[id]
// -----------------------------------------------------------------------
describe("PUT /api/children/[id]", () => {
  it("should update name", async () => {
    const updated = { ...CHILD_ROW, name: "Maximilian" };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
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
      return callCount === 1 ? selectChain : updateChain;
    });

    const result = await updateChild("child-1", sb as never, {
      name: "Maximilian",
    });

    expect(result.status).toBe(200);
    const child = (result.body as Record<string, unknown>).child as Record<string, unknown>;
    expect(child.name).toBe("Maximilian");
  });

  it("should update allergies", async () => {
    const updated = { ...CHILD_ROW, allergies: "Peanuts" };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
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
      return callCount === 1 ? selectChain : updateChain;
    });

    const result = await updateChild("child-1", sb as never, {
      allergies: "Peanuts",
    });

    expect(result.status).toBe(200);
    const child = (result.body as Record<string, unknown>).child as Record<string, unknown>;
    expect(child.allergies).toBe("Peanuts");
  });

  it("should update is_premature flag", async () => {
    const updated = { ...CHILD_ROW, is_premature: true };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
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
      return callCount === 1 ? selectChain : updateChain;
    });

    const result = await updateChild("child-1", sb as never, {
      is_premature: true,
    });

    expect(result.status).toBe(200);
    const child = (result.body as Record<string, unknown>).child as Record<string, unknown>;
    expect(child.is_premature).toBe(true);
  });

  it("should reject DOB in the future", async () => {
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: CHILD_ROW, error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(selectChain);

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const result = await updateChild("child-1", sb as never, {
      date_of_birth: futureDate.toISOString().split("T")[0],
    });

    expect(result.status).toBe(400);
  });
});

// -----------------------------------------------------------------------
// DELETE /api/children/[id]
// -----------------------------------------------------------------------
describe("DELETE /api/children/[id]", () => {
  it("should delete child and return 204", async () => {
    const selectChain = {
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
      return callCount === 1 ? selectChain : deleteChain;
    });

    const result = await deleteChild("child-1", sb as never);

    expect(result.status).toBe(204);
  });

  it("should return 403 for another user's child", async () => {
    const otherChild = { ...CHILD_ROW, user_id: "user-other" };
    const selectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: otherChild, error: null }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(selectChain);

    const result = await deleteChild("child-1", sb as never);

    expect(result.status).toBe(403);
  });
});
