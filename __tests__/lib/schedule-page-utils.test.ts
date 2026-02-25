import {
  calculateAgeGroup,
  transformUExamToTimelineItem,
  transformVaccinationToTimelineItem,
  mergeAndSortTimelineItems,
} from "@/lib/schedule-page-utils";

describe("calculateAgeGroup", () => {
  const dob = "2024-01-15"; // Jan 15, 2024

  it("should return 'Newborn' for dates within 2 weeks of birth", () => {
    expect(calculateAgeGroup(dob, "2024-01-15")).toBe("Newborn");
    expect(calculateAgeGroup(dob, "2024-01-20")).toBe("Newborn");
    expect(calculateAgeGroup(dob, "2024-01-28")).toBe("Newborn");
  });

  it("should return '2-4 months' for dates 1-4 months after birth", () => {
    expect(calculateAgeGroup(dob, "2024-03-15")).toBe("2-4 months");
    expect(calculateAgeGroup(dob, "2024-05-10")).toBe("2-4 months");
  });

  it("should return '6-12 months' for dates 5-12 months after birth", () => {
    expect(calculateAgeGroup(dob, "2024-07-15")).toBe("6-12 months");
    expect(calculateAgeGroup(dob, "2024-12-15")).toBe("6-12 months");
  });

  it("should return '1-2 years' for dates 13-27 months after birth", () => {
    expect(calculateAgeGroup(dob, "2025-03-15")).toBe("1-2 years");
    expect(calculateAgeGroup(dob, "2026-03-15")).toBe("1-2 years");
  });

  it("should return '3-5 years' for dates 28-66 months after birth", () => {
    expect(calculateAgeGroup(dob, "2027-01-15")).toBe("3-5 years");
    expect(calculateAgeGroup(dob, "2029-06-15")).toBe("3-5 years");
  });

  it("should return 'School age (6-10)' for dates 67-130 months after birth", () => {
    expect(calculateAgeGroup(dob, "2030-08-15")).toBe("School age (6-10)");
    expect(calculateAgeGroup(dob, "2034-11-15")).toBe("School age (6-10)");
  });

  it("should return 'Adolescent (12-17)' for dates 131+ months after birth", () => {
    expect(calculateAgeGroup(dob, "2035-12-15")).toBe("Adolescent (12-17)");
    expect(calculateAgeGroup(dob, "2041-01-15")).toBe("Adolescent (12-17)");
  });
});

describe("transformUExamToTimelineItem", () => {
  const dob = "2024-01-15";

  it("should transform a completed u-exam record", () => {
    const record = {
      id: "rec-1",
      status: "completed",
      status_badge: "completed",
      scheduled_date: "2024-01-15",
      completed_date: "2024-01-15",
      physician_name: "Dr. Schmidt",
      u_exams: {
        name: "U1",
        description_en: "Initial newborn exam",
      },
    };

    const item = transformUExamToTimelineItem(record, dob);
    expect(item.id).toBe("rec-1");
    expect(item.name).toBe("U1");
    expect(item.type).toBe("u_exam");
    expect(item.status).toBe("completed");
    expect(item.scheduled_date).toBe("2024-01-15");
    expect(item.details).toBe("Initial newborn exam");
    expect(item.administered_date).toBe("2024-01-15");
    expect(item.physician).toBe("Dr. Schmidt");
    expect((item as Record<string, unknown>).age_group).toBe("Newborn");
  });

  it("should use status_badge over status for display", () => {
    const record = {
      id: "rec-2",
      status: "scheduled",
      status_badge: "overdue",
      scheduled_date: "2024-03-15",
      completed_date: null,
      physician_name: null,
      u_exams: { name: "U3", description_en: "4-5 week exam" },
    };

    const item = transformUExamToTimelineItem(record, dob);
    expect(item.status).toBe("overdue");
  });

  it("should fallback to 'U-Exam' if u_exams relation is missing", () => {
    const record = {
      id: "rec-3",
      status: "scheduled",
      status_badge: "scheduled",
      scheduled_date: "2024-06-15",
      completed_date: null,
      physician_name: null,
      u_exams: null,
    };

    const item = transformUExamToTimelineItem(record, dob);
    expect(item.name).toBe("U-Exam");
    expect(item.details).toBe("");
  });
});

describe("transformVaccinationToTimelineItem", () => {
  const dob = "2024-01-15";

  it("should transform an administered vaccination record", () => {
    const record = {
      id: "vacc-1",
      dose_number: 1,
      status: "administered",
      scheduled_date: "2024-03-15",
      administered_date: "2024-03-16",
      physician_name: "Dr. Mueller",
      vaccines: {
        name_en: "Hexavalent",
        protects_against_en: "Diphtheria, Tetanus, Pertussis, Polio, Hib, Hep B",
      },
    };

    const item = transformVaccinationToTimelineItem(record, dob);
    expect(item.id).toBe("vacc-1");
    expect(item.name).toBe("Hexavalent (Dose 1)");
    expect(item.type).toBe("vaccination");
    expect(item.status).toBe("completed"); // "administered" mapped to "completed"
    expect(item.administered_date).toBe("2024-03-16");
    expect(item.physician).toBe("Dr. Mueller");
    expect(item.details).toContain("Diphtheria");
    expect((item as Record<string, unknown>).age_group).toBe("2-4 months");
  });

  it("should map 'administered' status to 'completed'", () => {
    const record = {
      id: "vacc-2",
      dose_number: 2,
      status: "administered",
      scheduled_date: "2024-05-15",
      administered_date: "2024-05-15",
      physician_name: null,
      vaccines: { name_en: "Hexavalent", protects_against_en: "" },
    };

    const item = transformVaccinationToTimelineItem(record, dob);
    expect(item.status).toBe("completed");
  });

  it("should keep overdue status as-is", () => {
    const record = {
      id: "vacc-3",
      dose_number: 2,
      status: "overdue",
      scheduled_date: "2024-05-15",
      administered_date: null,
      physician_name: null,
      vaccines: { name_en: "MMR", protects_against_en: "Measles, Mumps, Rubella" },
    };

    const item = transformVaccinationToTimelineItem(record, dob);
    expect(item.status).toBe("overdue");
    expect(item.name).toBe("MMR (Dose 2)");
  });

  it("should fallback to 'Vaccination' if vaccines relation is missing", () => {
    const record = {
      id: "vacc-4",
      dose_number: 1,
      status: "scheduled",
      scheduled_date: "2024-06-15",
      administered_date: null,
      physician_name: null,
      vaccines: null,
    };

    const item = transformVaccinationToTimelineItem(record, dob);
    expect(item.name).toBe("Vaccination (Dose 1)");
    expect(item.details).toBe("");
  });
});

describe("mergeAndSortTimelineItems", () => {
  it("should merge u-exam and vaccination items sorted by scheduled_date", () => {
    const items = mergeAndSortTimelineItems(
      [
        {
          id: "1", name: "U1", type: "u_exam" as const,
          status: "completed" as const, scheduled_date: "2024-01-15",
          details: "", administered_date: null, physician: null,
        },
        {
          id: "3", name: "U3", type: "u_exam" as const,
          status: "completed" as const, scheduled_date: "2024-03-15",
          details: "", administered_date: null, physician: null,
        },
      ],
      [
        {
          id: "2", name: "Hex Dose 1", type: "vaccination" as const,
          status: "completed" as const, scheduled_date: "2024-02-15",
          details: "", administered_date: null, physician: null,
        },
      ]
    );

    expect(items).toHaveLength(3);
    expect(items[0].id).toBe("1");
    expect(items[1].id).toBe("2");
    expect(items[2].id).toBe("3");
  });

  it("should return empty array when both inputs are empty", () => {
    expect(mergeAndSortTimelineItems([], [])).toEqual([]);
  });
});
