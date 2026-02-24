import {
  generateUExamSchedule,
  generateVaccinationSchedule,
  recalculateSchedule,
  addMonths,
  addDays,
} from "@/lib/schedule-engine";

import type {
  UExam,
  VaccineScheduleRule,
  ExistingUExamRecord,
  ExistingVaccinationRecord,
} from "@/lib/types/schedule";

// =============================================================================
// Test Fixtures - matching seed.sql deterministic UUIDs
// =============================================================================

const CHILD_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

/** U-exams from seed.sql (only u_exam category, not j_exam or z_exam) */
const U_EXAMS: UExam[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "U1",
    category: "u_exam",
    recommended_age_months: 0,
    tolerance_from_months: 0,
    tolerance_to_months: 0.25,
    description_en: "Newborn examination at birth",
    description_de: "Neugeborenen-Erstuntersuchung bei Geburt",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "U2",
    category: "u_exam",
    recommended_age_months: 0,
    tolerance_from_months: 0.1,
    tolerance_to_months: 0.33,
    description_en: "Newborn examination at 3-10 days",
    description_de: "Neugeborenen-Basisuntersuchung am 3.-10. Lebenstag",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "U3",
    category: "u_exam",
    recommended_age_months: 1,
    tolerance_from_months: 0.75,
    tolerance_to_months: 2,
    description_en: "Examination at 4-5 weeks",
    description_de: "Untersuchung in der 4.-5. Lebenswoche",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "U4",
    category: "u_exam",
    recommended_age_months: 3,
    tolerance_from_months: 2,
    tolerance_to_months: 4.5,
    description_en: "Examination at 3-4 months",
    description_de: "Untersuchung im 3.-4. Lebensmonat",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "U5",
    category: "u_exam",
    recommended_age_months: 6,
    tolerance_from_months: 5,
    tolerance_to_months: 8,
    description_en: "Examination at 6-7 months",
    description_de: "Untersuchung im 6.-7. Lebensmonat",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "U6",
    category: "u_exam",
    recommended_age_months: 10,
    tolerance_from_months: 9,
    tolerance_to_months: 14,
    description_en: "Examination at 10-12 months",
    description_de: "Untersuchung im 10.-12. Lebensmonat",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "U7",
    category: "u_exam",
    recommended_age_months: 21,
    tolerance_from_months: 20,
    tolerance_to_months: 27,
    description_en: "Examination at 21-24 months",
    description_de: "Untersuchung im 21.-24. Lebensmonat",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    name: "U7a",
    category: "u_exam",
    recommended_age_months: 34,
    tolerance_from_months: 33,
    tolerance_to_months: 38,
    description_en: "Examination at 34-36 months",
    description_de: "Untersuchung im 34.-36. Lebensmonat",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "U8",
    category: "u_exam",
    recommended_age_months: 46,
    tolerance_from_months: 43,
    tolerance_to_months: 50,
    description_en: "Examination at 46-48 months",
    description_de: "Untersuchung im 46.-48. Lebensmonat",
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    name: "U9",
    category: "u_exam",
    recommended_age_months: 60,
    tolerance_from_months: 58,
    tolerance_to_months: 66,
    description_en: "Examination at 60-64 months",
    description_de: "Untersuchung im 60.-64. Lebensmonat",
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    name: "U10",
    category: "u_exam",
    recommended_age_months: 84,
    tolerance_from_months: 82,
    tolerance_to_months: 98,
    description_en: "Examination at 7-8 years",
    description_de: "Untersuchung im 7.-8. Lebensjahr",
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    name: "U11",
    category: "u_exam",
    recommended_age_months: 108,
    tolerance_from_months: 106,
    tolerance_to_months: 122,
    description_en: "Examination at 9-10 years",
    description_de: "Untersuchung im 9.-10. Lebensjahr",
  },
];

/** Vaccine schedule rules from seed.sql */
const SCHEDULE_RULES: VaccineScheduleRule[] = [
  // Rotavirus (RV): 2 doses at 1.5m, 2m
  {
    id: "20000000-0000-0000-0000-000000000001",
    vaccine_id: "10000000-0000-0000-0000-000000000001",
    dose_number: 1,
    recommended_age_months: 1.5,
    min_age_months: 1.5,
    min_interval_days: null,
    premature_age_months: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    vaccine_id: "10000000-0000-0000-0000-000000000001",
    dose_number: 2,
    recommended_age_months: 2,
    min_age_months: 2,
    min_interval_days: 28,
    premature_age_months: null,
  },
  // Hexavalent / DTaP-IPV-Hib-HepB: standard 2+1 at 2m, 4m, 11m; premature 3+1 at 2m, 3m, 4m, 11m
  {
    id: "20000000-0000-0000-0000-000000000003",
    vaccine_id: "10000000-0000-0000-0000-000000000002",
    dose_number: 1,
    recommended_age_months: 2,
    min_age_months: 2,
    min_interval_days: null,
    premature_age_months: 2,
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    vaccine_id: "10000000-0000-0000-0000-000000000002",
    dose_number: 2,
    recommended_age_months: 4,
    min_age_months: 4,
    min_interval_days: 28,
    premature_age_months: 3,
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    vaccine_id: "10000000-0000-0000-0000-000000000002",
    dose_number: 3,
    recommended_age_months: 11,
    min_age_months: 11,
    min_interval_days: 180,
    premature_age_months: 4,
  },
  // Premature-only dose 4
  {
    id: "20000000-0000-0000-0000-000000000006",
    vaccine_id: "10000000-0000-0000-0000-000000000002",
    dose_number: 4,
    recommended_age_months: 11,
    min_age_months: 11,
    min_interval_days: 180,
    premature_age_months: 11,
  },
  // PCV: 3 doses at 2m, 4m, 11m
  {
    id: "20000000-0000-0000-0000-000000000007",
    vaccine_id: "10000000-0000-0000-0000-000000000003",
    dose_number: 1,
    recommended_age_months: 2,
    min_age_months: 2,
    min_interval_days: null,
    premature_age_months: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000008",
    vaccine_id: "10000000-0000-0000-0000-000000000003",
    dose_number: 2,
    recommended_age_months: 4,
    min_age_months: 4,
    min_interval_days: 56,
    premature_age_months: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000009",
    vaccine_id: "10000000-0000-0000-0000-000000000003",
    dose_number: 3,
    recommended_age_months: 11,
    min_age_months: 11,
    min_interval_days: 180,
    premature_age_months: null,
  },
  // MenB: 3 doses at 2m, 4m, 12m
  {
    id: "20000000-0000-0000-0000-000000000010",
    vaccine_id: "10000000-0000-0000-0000-000000000004",
    dose_number: 1,
    recommended_age_months: 2,
    min_age_months: 2,
    min_interval_days: null,
    premature_age_months: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000011",
    vaccine_id: "10000000-0000-0000-0000-000000000004",
    dose_number: 2,
    recommended_age_months: 4,
    min_age_months: 4,
    min_interval_days: 56,
    premature_age_months: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000012",
    vaccine_id: "10000000-0000-0000-0000-000000000004",
    dose_number: 3,
    recommended_age_months: 12,
    min_age_months: 12,
    min_interval_days: 180,
    premature_age_months: null,
  },
  // MenC: 1 dose at 12m
  {
    id: "20000000-0000-0000-0000-000000000013",
    vaccine_id: "10000000-0000-0000-0000-000000000005",
    dose_number: 1,
    recommended_age_months: 12,
    min_age_months: 12,
    min_interval_days: null,
    premature_age_months: null,
  },
  // MMR: 2 doses at 11m, 15m
  {
    id: "20000000-0000-0000-0000-000000000014",
    vaccine_id: "10000000-0000-0000-0000-000000000006",
    dose_number: 1,
    recommended_age_months: 11,
    min_age_months: 11,
    min_interval_days: null,
    premature_age_months: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000015",
    vaccine_id: "10000000-0000-0000-0000-000000000006",
    dose_number: 2,
    recommended_age_months: 15,
    min_age_months: 15,
    min_interval_days: 28,
    premature_age_months: null,
  },
  // Varicella: 2 doses at 11m, 15m
  {
    id: "20000000-0000-0000-0000-000000000016",
    vaccine_id: "10000000-0000-0000-0000-000000000007",
    dose_number: 1,
    recommended_age_months: 11,
    min_age_months: 11,
    min_interval_days: null,
    premature_age_months: null,
  },
  {
    id: "20000000-0000-0000-0000-000000000017",
    vaccine_id: "10000000-0000-0000-0000-000000000007",
    dose_number: 2,
    recommended_age_months: 15,
    min_age_months: 15,
    min_interval_days: 28,
    premature_age_months: null,
  },
];

// Vaccine IDs from seed.sql
const VACCINE_IDS = {
  ROTAVIRUS: "10000000-0000-0000-0000-000000000001",
  HEXAVALENT: "10000000-0000-0000-0000-000000000002",
  PCV: "10000000-0000-0000-0000-000000000003",
  MEN_B: "10000000-0000-0000-0000-000000000004",
  MEN_C: "10000000-0000-0000-0000-000000000005",
  MMR: "10000000-0000-0000-0000-000000000006",
  VARICELLA: "10000000-0000-0000-0000-000000000007",
};

// =============================================================================
// Helper: format Date to YYYY-MM-DD
// =============================================================================
function fmt(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// =============================================================================
// U-Exam Schedule Generation
// =============================================================================
describe("U-Exam Schedule Generation", () => {
  const dob = new Date(2025, 0, 15); // January 15, 2025

  it("should generate u_exam_records for a newborn (U1-U9, U7a, U10, U11)", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });

    // U1 through U9 + U7a + U10 + U11 = 12 exams
    expect(records).toHaveLength(12);

    const names = U_EXAMS.map((e) => e.name);
    expect(names).toEqual([
      "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U7a", "U8", "U9", "U10", "U11",
    ]);

    // Each record maps to one u_exam
    const examIds = records.map((r) => r.u_exam_id);
    for (const exam of U_EXAMS) {
      expect(examIds).toContain(exam.id);
    }
  });

  it("should calculate U1 scheduled_date as the DOB itself", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u1 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000001"
    );
    expect(u1?.scheduled_date).toBe("2025-01-15");
  });

  it("should calculate U2 scheduled_date as DOB + 5 days (midpoint of 3-10 day range)", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u2 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000002"
    );
    // Jan 15 + 5 days = Jan 20
    expect(u2?.scheduled_date).toBe("2025-01-20");
  });

  it("should calculate U3 scheduled_date as DOB + 1 month", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u3 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000003"
    );
    expect(u3?.scheduled_date).toBe("2025-02-15");
  });

  it("should calculate U4 scheduled_date as DOB + 3 months", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u4 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000004"
    );
    expect(u4?.scheduled_date).toBe("2025-04-15");
  });

  it("should calculate U5 scheduled_date as DOB + 6 months", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u5 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000005"
    );
    expect(u5?.scheduled_date).toBe("2025-07-15");
  });

  it("should calculate U6 scheduled_date as DOB + 10 months", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u6 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000006"
    );
    expect(u6?.scheduled_date).toBe("2025-11-15");
  });

  it("should calculate U7 scheduled_date as DOB + 21 months", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u7 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000007"
    );
    expect(u7?.scheduled_date).toBe("2026-10-15");
  });

  it("should calculate U8 scheduled_date as DOB + 46 months", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u8 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000009"
    );
    expect(u8?.scheduled_date).toBe("2028-11-15");
  });

  it("should calculate U9 scheduled_date as DOB + 60 months", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const u9 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000010"
    );
    expect(u9?.scheduled_date).toBe("2030-01-15");
  });

  it("should set all generated records to status 'scheduled'", () => {
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    for (const record of records) {
      expect(record.status).toBe("scheduled");
    }
  });

  it("should handle DOB on Feb 29 (leap year) correctly", () => {
    const leapDob = new Date(2024, 1, 29); // Feb 29, 2024
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: leapDob,
      uExams: U_EXAMS,
    });

    // U3 = DOB + 1 month = March 29
    const u3 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000003"
    );
    expect(u3?.scheduled_date).toBe("2024-03-29");

    // U4 = DOB + 3 months = May 29
    const u4 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000004"
    );
    expect(u4?.scheduled_date).toBe("2024-05-29");

    // U9 = DOB + 60 months (5 years) = Feb 28, 2029 (not a leap year)
    const u9 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000010"
    );
    expect(u9?.scheduled_date).toBe("2029-02-28");
  });

  it("should handle DOB at end of month (Jan 31 + 1 month = Feb 28)", () => {
    const endOfMonthDob = new Date(2025, 0, 31); // January 31, 2025
    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: endOfMonthDob,
      uExams: U_EXAMS,
    });

    // U3 = Jan 31 + 1 month = Feb 28 (not leap year)
    const u3 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000003"
    );
    expect(u3?.scheduled_date).toBe("2025-02-28");
  });
});

// =============================================================================
// Vaccination Schedule Generation
// =============================================================================
describe("Vaccination Schedule Generation", () => {
  const dob = new Date(2025, 0, 15); // January 15, 2025

  it("should generate Rotavirus records with 2 doses at 1.5m and 2m", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    const rvRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.ROTAVIRUS
    );
    expect(rvRecords).toHaveLength(2);
    expect(rvRecords[0].dose_number).toBe(1);
    expect(rvRecords[1].dose_number).toBe(2);
    // 1.5 months = 1 month + 15 days
    expect(rvRecords[0].scheduled_date).toBe(fmt(addMonths(dob, 1.5)));
    expect(rvRecords[1].scheduled_date).toBe(fmt(addMonths(dob, 2)));
  });

  it("should generate DTaP-IPV-Hib-HepB with 3 doses at 2, 4, 11 months (standard)", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    const hexRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.HEXAVALENT
    );
    expect(hexRecords).toHaveLength(3);
    expect(hexRecords[0].dose_number).toBe(1);
    expect(hexRecords[0].scheduled_date).toBe("2025-03-15");
    expect(hexRecords[1].dose_number).toBe(2);
    expect(hexRecords[1].scheduled_date).toBe("2025-05-15");
    expect(hexRecords[2].dose_number).toBe(3);
    expect(hexRecords[2].scheduled_date).toBe("2025-12-15");
  });

  it("should generate DTaP-IPV-Hib-HepB with 4 doses at 2, 3, 4, 11 months (premature)", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: true,
      scheduleRules: SCHEDULE_RULES,
    });

    const hexRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.HEXAVALENT
    );
    expect(hexRecords).toHaveLength(4);
    expect(hexRecords[0].dose_number).toBe(1);
    expect(hexRecords[0].scheduled_date).toBe("2025-03-15");
    expect(hexRecords[1].dose_number).toBe(2);
    expect(hexRecords[1].scheduled_date).toBe("2025-04-15");
    expect(hexRecords[2].dose_number).toBe(3);
    expect(hexRecords[2].scheduled_date).toBe("2025-05-15");
    expect(hexRecords[3].dose_number).toBe(4);
    expect(hexRecords[3].scheduled_date).toBe("2025-12-15");
  });

  it("should generate PCV with 3 doses at 2, 4, 11 months", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    const pcvRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.PCV
    );
    expect(pcvRecords).toHaveLength(3);
    expect(pcvRecords[0].scheduled_date).toBe("2025-03-15");
    expect(pcvRecords[1].scheduled_date).toBe("2025-05-15");
    expect(pcvRecords[2].scheduled_date).toBe("2025-12-15");
  });

  it("should generate MenB with 3 doses at 2, 4, 12 months", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    const menBRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.MEN_B
    );
    expect(menBRecords).toHaveLength(3);
    expect(menBRecords[0].scheduled_date).toBe("2025-03-15");
    expect(menBRecords[1].scheduled_date).toBe("2025-05-15");
    expect(menBRecords[2].scheduled_date).toBe("2026-01-15");
  });

  it("should generate MenC with 1 dose at 12 months", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    const menCRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.MEN_C
    );
    expect(menCRecords).toHaveLength(1);
    expect(menCRecords[0].dose_number).toBe(1);
    expect(menCRecords[0].scheduled_date).toBe("2026-01-15");
  });

  it("should generate MMR with 2 doses at 11 and 15 months", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    const mmrRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.MMR
    );
    expect(mmrRecords).toHaveLength(2);
    expect(mmrRecords[0].dose_number).toBe(1);
    expect(mmrRecords[0].scheduled_date).toBe("2025-12-15");
    expect(mmrRecords[1].dose_number).toBe(2);
    expect(mmrRecords[1].scheduled_date).toBe("2026-04-15");
  });

  it("should generate Varicella with 2 doses at 11 and 15 months", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    const vzRecords = records.filter(
      (r) => r.vaccine_id === VACCINE_IDS.VARICELLA
    );
    expect(vzRecords).toHaveLength(2);
    expect(vzRecords[0].dose_number).toBe(1);
    expect(vzRecords[0].scheduled_date).toBe("2025-12-15");
    expect(vzRecords[1].dose_number).toBe(2);
    expect(vzRecords[1].scheduled_date).toBe("2026-04-15");
  });

  it("should set all generated vaccination records to status 'scheduled'", () => {
    const records = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    for (const record of records) {
      expect(record.status).toBe("scheduled");
    }
  });
});

// =============================================================================
// Schedule Updates (Recalculation)
// =============================================================================
describe("Schedule Updates", () => {
  const oldDob = new Date(2025, 0, 15);
  const newDob = new Date(2025, 2, 1); // March 1, 2025

  it("should recalculate all dates when DOB is updated", () => {
    const result = recalculateSchedule({
      childId: CHILD_ID,
      dateOfBirth: newDob,
      isPremature: false,
      uExams: U_EXAMS,
      scheduleRules: SCHEDULE_RULES,
      existingUExamRecords: [],
      existingVaccinationRecords: [],
    });

    // U1 should be on new DOB
    const u1 = result.uExamRecords.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000001"
    );
    expect(u1?.scheduled_date).toBe("2025-03-01");

    // U3 = new DOB + 1 month = April 1
    const u3 = result.uExamRecords.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000003"
    );
    expect(u3?.scheduled_date).toBe("2025-04-01");
  });

  it("should switch from 2+1 to 3+1 hexavalent when premature flag is set", () => {
    const result = recalculateSchedule({
      childId: CHILD_ID,
      dateOfBirth: oldDob,
      isPremature: true,
      uExams: U_EXAMS,
      scheduleRules: SCHEDULE_RULES,
      existingUExamRecords: [],
      existingVaccinationRecords: [],
    });

    const hexRecords = result.vaccinationRecords.filter(
      (r) => r.vaccine_id === VACCINE_IDS.HEXAVALENT
    );
    expect(hexRecords).toHaveLength(4);
  });

  it("should switch from 3+1 to 2+1 hexavalent when premature flag is cleared", () => {
    const result = recalculateSchedule({
      childId: CHILD_ID,
      dateOfBirth: oldDob,
      isPremature: false,
      uExams: U_EXAMS,
      scheduleRules: SCHEDULE_RULES,
      existingUExamRecords: [],
      existingVaccinationRecords: [],
    });

    const hexRecords = result.vaccinationRecords.filter(
      (r) => r.vaccine_id === VACCINE_IDS.HEXAVALENT
    );
    expect(hexRecords).toHaveLength(3);
  });

  it("should not overwrite records that are already 'completed' when recalculating", () => {
    const completedUExamRecords: ExistingUExamRecord[] = [
      {
        id: "existing-u1-record",
        u_exam_id: "00000000-0000-0000-0000-000000000001",
        status: "completed",
      },
    ];

    const completedVaxRecords: ExistingVaccinationRecord[] = [
      {
        id: "existing-rv-dose1",
        vaccine_id: VACCINE_IDS.ROTAVIRUS,
        dose_number: 1,
        status: "completed",
      },
    ];

    const result = recalculateSchedule({
      childId: CHILD_ID,
      dateOfBirth: newDob,
      isPremature: false,
      uExams: U_EXAMS,
      scheduleRules: SCHEDULE_RULES,
      existingUExamRecords: completedUExamRecords,
      existingVaccinationRecords: completedVaxRecords,
    });

    // U1 should NOT be regenerated (it's completed)
    const u1Records = result.uExamRecords.filter(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000001"
    );
    expect(u1Records).toHaveLength(0);

    // Rotavirus dose 1 should NOT be regenerated (it's completed)
    const rvDose1 = result.vaccinationRecords.filter(
      (r) =>
        r.vaccine_id === VACCINE_IDS.ROTAVIRUS && r.dose_number === 1
    );
    expect(rvDose1).toHaveLength(0);

    // Rotavirus dose 2 SHOULD still be generated (not completed)
    const rvDose2 = result.vaccinationRecords.filter(
      (r) =>
        r.vaccine_id === VACCINE_IDS.ROTAVIRUS && r.dose_number === 2
    );
    expect(rvDose2).toHaveLength(1);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================
describe("Edge Cases", () => {
  it("should handle child born today (all future exams scheduled correctly)", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: today,
      uExams: U_EXAMS,
    });

    // U1 is today
    const u1 = records.find(
      (r) => r.u_exam_id === "00000000-0000-0000-0000-000000000001"
    );
    expect(u1?.scheduled_date).toBe(fmt(today));

    // All other dates should be today or in the future
    for (const record of records) {
      expect(new Date(record.scheduled_date).getTime()).toBeGreaterThanOrEqual(
        today.getTime()
      );
    }
  });

  it("should use exact month calculation (not 30-day approximation)", () => {
    // Jan 15 + 1 month = Feb 15 (not Jan 15 + 30 days = Feb 14)
    const dob = new Date(2025, 0, 15);
    const result = addMonths(dob, 1);
    expect(fmt(result)).toBe("2025-02-15");

    // March 15 + 1 month = April 15 (not March 15 + 30 days = April 14)
    const marchDob = new Date(2025, 2, 15);
    const marchResult = addMonths(marchDob, 1);
    expect(fmt(marchResult)).toBe("2025-04-15");
  });

  it("should calculate month difference correctly for DOB 2025-01-31 + 1 month = 2025-02-28", () => {
    const dob = new Date(2025, 0, 31);
    const result = addMonths(dob, 1);
    expect(fmt(result)).toBe("2025-02-28");
  });

  it("should correctly add fractional months (1.5 months = 1 month + 15 days)", () => {
    const dob = new Date(2025, 0, 15);
    const result = addMonths(dob, 1.5);
    // 1 month = Feb 15, then + 15 days = March 2
    expect(fmt(result)).toBe("2025-03-02");
  });

  it("should correctly add days", () => {
    const dob = new Date(2025, 0, 15);
    const result = addDays(dob, 5);
    expect(fmt(result)).toBe("2025-01-20");
  });

  it("should add days across month boundary", () => {
    const dob = new Date(2025, 0, 28);
    const result = addDays(dob, 5);
    expect(fmt(result)).toBe("2025-02-02");
  });

  it("should not mutate the input date", () => {
    const dob = new Date(2025, 0, 15);
    const original = dob.getTime();
    addMonths(dob, 6);
    addDays(dob, 10);
    expect(dob.getTime()).toBe(original);
  });

  it("should set child_id on all generated records", () => {
    const dob = new Date(2025, 0, 15);
    const uRecords = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      uExams: U_EXAMS,
    });
    const vRecords = generateVaccinationSchedule({
      childId: CHILD_ID,
      dateOfBirth: dob,
      isPremature: false,
      scheduleRules: SCHEDULE_RULES,
    });

    for (const r of uRecords) {
      expect(r.child_id).toBe(CHILD_ID);
    }
    for (const r of vRecords) {
      expect(r.child_id).toBe(CHILD_ID);
    }
  });

  it("should only include u_exam category exams (not j_exam or z_exam)", () => {
    const allExams: UExam[] = [
      ...U_EXAMS,
      {
        id: "00000000-0000-0000-0000-000000000013",
        name: "J1",
        category: "j_exam",
        recommended_age_months: 144,
        tolerance_from_months: 142,
        tolerance_to_months: 170,
        description_en: "Youth examination",
        description_de: "Jugendgesundheitsuntersuchung",
      },
      {
        id: "00000000-0000-0000-0000-000000000015",
        name: "Z1",
        category: "z_exam",
        recommended_age_months: 6,
        tolerance_from_months: 5,
        tolerance_to_months: 7,
        description_en: "First dental",
        description_de: "Erste zahnaerztliche",
      },
    ];

    const records = generateUExamSchedule({
      childId: CHILD_ID,
      dateOfBirth: new Date(2025, 0, 15),
      uExams: allExams,
    });

    // Should still be 12 records (only u_exam category)
    expect(records).toHaveLength(12);
    const examIds = records.map((r) => r.u_exam_id);
    expect(examIds).not.toContain("00000000-0000-0000-0000-000000000013");
    expect(examIds).not.toContain("00000000-0000-0000-0000-000000000015");
  });
});
