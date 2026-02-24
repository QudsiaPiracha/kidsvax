import {
  getReminderPreferences,
  updateReminderPreferences,
} from "@/lib/services/reminders";

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
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  };
}

const DEFAULT_PREFS = {
  user_id: "user-1",
  u_exam_reminders: true,
  vaccination_reminders: true,
  reminder_days_before_u_exam: 14,
  reminder_days_before_vaccination: 7,
};

// -----------------------------------------------------------------------
// GET /api/reminders
// -----------------------------------------------------------------------
describe("GET /api/reminders", () => {
  it("should return user's reminder preferences", async () => {
    const prefsChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: DEFAULT_PREFS,
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(prefsChain);

    const result = await getReminderPreferences(sb as never);
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    expect(body.preferences).toBeDefined();
    const prefs = body.preferences as Record<string, unknown>;
    expect(prefs.u_exam_reminders).toBe(true);
    expect(prefs.vaccination_reminders).toBe(true);
  });
});

// -----------------------------------------------------------------------
// PUT /api/reminders
// -----------------------------------------------------------------------
describe("PUT /api/reminders", () => {
  it("should update reminder preferences", async () => {
    const upsertChain = {
      select: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...DEFAULT_PREFS, reminder_days_before_u_exam: 7 },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(upsertChain);

    const result = await updateReminderPreferences(sb as never, {
      reminder_days_before_u_exam: 7,
    });
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const prefs = body.preferences as Record<string, unknown>;
    expect(prefs.reminder_days_before_u_exam).toBe(7);
  });

  it("should allow disabling U-exam reminders", async () => {
    const upsertChain = {
      select: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...DEFAULT_PREFS, u_exam_reminders: false },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(upsertChain);

    const result = await updateReminderPreferences(sb as never, {
      u_exam_reminders: false,
    });
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const prefs = body.preferences as Record<string, unknown>;
    expect(prefs.u_exam_reminders).toBe(false);
  });

  it("should allow disabling vaccination reminders", async () => {
    const upsertChain = {
      select: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { ...DEFAULT_PREFS, vaccination_reminders: false },
        error: null,
      }),
    };
    const sb = createMockSupabase();
    sb.from.mockReturnValue(upsertChain);

    const result = await updateReminderPreferences(sb as never, {
      vaccination_reminders: false,
    });
    expect(result.status).toBe(200);
    const body = result.body as Record<string, unknown>;
    const prefs = body.preferences as Record<string, unknown>;
    expect(prefs.vaccination_reminders).toBe(false);
  });
});
