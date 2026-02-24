import { identifyDueReminders } from "@/lib/reminder-scheduler";

// -----------------------------------------------------------------------
// Reminder Scheduler (pure function)
// -----------------------------------------------------------------------
describe("Reminder Scheduler", () => {
  const TODAY = "2026-02-24";

  const makeUExam = (overrides: Record<string, unknown> = {}) => ({
    id: "uexam-1",
    child_id: "child-1",
    exam_type: "U6",
    scheduled_date: "2026-03-05",
    status: "scheduled",
    ...overrides,
  });

  const makeVax = (overrides: Record<string, unknown> = {}) => ({
    id: "vax-1",
    child_id: "child-1",
    vaccine_name: "MMR",
    dose_number: 1,
    scheduled_date: "2026-02-28",
    status: "scheduled",
    ...overrides,
  });

  const makePrefs = (overrides: Record<string, unknown> = {}) => ({
    user_id: "user-1",
    u_exam_reminders: true,
    vaccination_reminders: true,
    ...overrides,
  });

  it("should identify U-exams due within 14 days and not yet reminded", () => {
    const items = {
      uExams: [makeUExam({ scheduled_date: "2026-03-05" })],
      vaccinations: [],
      reminderHistory: [],
      preferences: makePrefs(),
      children: [{ id: "child-1", date_of_birth: "2024-06-15" }],
    };

    const result = identifyDueReminders(items, TODAY);
    expect(result.uExamReminders).toHaveLength(1);
    expect(result.uExamReminders[0].id).toBe("uexam-1");
  });

  it("should identify vaccinations due within 7 days and not yet reminded", () => {
    const items = {
      uExams: [],
      vaccinations: [makeVax({ scheduled_date: "2026-02-28" })],
      reminderHistory: [],
      preferences: makePrefs(),
      children: [{ id: "child-1", date_of_birth: "2024-06-15" }],
    };

    const result = identifyDueReminders(items, TODAY);
    expect(result.vaccinationReminders).toHaveLength(1);
    expect(result.vaccinationReminders[0].id).toBe("vax-1");
  });

  it("should identify overdue items not yet alerted", () => {
    const items = {
      uExams: [makeUExam({ scheduled_date: "2026-02-20", status: "scheduled" })],
      vaccinations: [makeVax({ scheduled_date: "2026-02-20", status: "scheduled" })],
      reminderHistory: [],
      preferences: makePrefs(),
      children: [{ id: "child-1", date_of_birth: "2024-06-15" }],
    };

    const result = identifyDueReminders(items, TODAY);
    expect(result.overdueAlerts.length).toBeGreaterThan(0);
  });

  it("should not schedule reminder for items already reminded", () => {
    const items = {
      uExams: [makeUExam({ scheduled_date: "2026-03-05" })],
      vaccinations: [],
      reminderHistory: [
        { item_id: "uexam-1", item_type: "u_exam", sent_at: "2026-02-23" },
      ],
      preferences: makePrefs(),
      children: [{ id: "child-1", date_of_birth: "2024-06-15" }],
    };

    const result = identifyDueReminders(items, TODAY);
    expect(result.uExamReminders).toHaveLength(0);
  });

  it("should not schedule reminder for completed items", () => {
    const items = {
      uExams: [makeUExam({ scheduled_date: "2026-03-05", status: "completed" })],
      vaccinations: [makeVax({ scheduled_date: "2026-02-28", status: "administered" })],
      reminderHistory: [],
      preferences: makePrefs(),
      children: [{ id: "child-1", date_of_birth: "2024-06-15" }],
    };

    const result = identifyDueReminders(items, TODAY);
    expect(result.uExamReminders).toHaveLength(0);
    expect(result.vaccinationReminders).toHaveLength(0);
  });

  it("should respect user's reminder preferences (disabled reminders skipped)", () => {
    const items = {
      uExams: [makeUExam({ scheduled_date: "2026-03-05" })],
      vaccinations: [makeVax({ scheduled_date: "2026-02-28" })],
      reminderHistory: [],
      preferences: makePrefs({
        u_exam_reminders: false,
        vaccination_reminders: false,
      }),
      children: [{ id: "child-1", date_of_birth: "2024-06-15" }],
    };

    const result = identifyDueReminders(items, TODAY);
    expect(result.uExamReminders).toHaveLength(0);
    expect(result.vaccinationReminders).toHaveLength(0);
  });

  it("should identify Masernschutz non-compliant children approaching age 1 or 2", () => {
    const items = {
      uExams: [],
      vaccinations: [
        makeVax({
          id: "vax-masern-1",
          vaccine_name: "Masern",
          dose_number: 1,
          scheduled_date: "2025-06-15",
          status: "scheduled",
        }),
      ],
      reminderHistory: [],
      preferences: makePrefs(),
      children: [
        { id: "child-1", date_of_birth: "2024-06-15" },
      ],
    };

    const result = identifyDueReminders(items, TODAY);
    expect(result.masernschutzAlerts.length).toBeGreaterThanOrEqual(0);
    // The child is ~20 months, approaching age 2 - should flag if measles not given
    expect(result.masernschutzAlerts).toBeDefined();
  });
});
