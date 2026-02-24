// Schedule Generation Engine - Pure functions, no side effects, data in/data out.

import type {
  UExamScheduleInput,
  VaccinationScheduleInput,
  RecalculateScheduleInput,
  RecalculateScheduleResult,
  GeneratedUExamRecord,
  GeneratedVaccinationRecord,
} from "@/lib/types/schedule";

// --- Date Helpers ---

/** Add exact months to a date, clamping to last day of month on overflow. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const wholeMonths = Math.floor(months);
  const fractionalDays = Math.round((months % 1) * 30);

  const originalDay = result.getDate();
  result.setMonth(result.getMonth() + wholeMonths);

  // Clamp: if day overflowed (e.g., Jan 31 + 1 month = Mar 3), go to last day
  if (result.getDate() !== originalDay) {
    result.setDate(0); // sets to last day of previous month
  }

  if (fractionalDays > 0) {
    result.setDate(result.getDate() + fractionalDays);
  }

  return result;
}

/** Add exact days to a date. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// --- Format Helper ---

/** Format a Date to ISO date string (YYYY-MM-DD). */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// --- U-Exam Schedule Generation ---

/** Calculate the scheduled date for a single U-exam based on DOB. */
function calculateUExamDate(
  dob: Date,
  examName: string,
  recommendedAgeMonths: number
): Date {
  if (examName === "U1") return new Date(dob);
  if (examName === "U2") return addDays(dob, 5);
  return addMonths(dob, recommendedAgeMonths);
}

/** Generate U-exam schedule records for a child. Only includes u_exam category. */
export function generateUExamSchedule(
  input: UExamScheduleInput
): GeneratedUExamRecord[] {
  const { childId, dateOfBirth, uExams } = input;

  return uExams
    .filter((exam) => exam.category === "u_exam")
    .map((exam) => ({
      child_id: childId,
      u_exam_id: exam.id,
      status: "scheduled" as const,
      scheduled_date: toDateString(
        calculateUExamDate(dateOfBirth, exam.name, exam.recommended_age_months)
      ),
    }));
}

// --- Vaccination Schedule Generation ---

/** Check if a dose is premature-only (not part of the standard schedule). */
function isPrematureOnlyDose(
  rule: { vaccine_id: string; dose_number: number; recommended_age_months: number; premature_age_months: number | null },
  allRules: { vaccine_id: string; dose_number: number; recommended_age_months: number; premature_age_months: number | null }[]
): boolean {
  if (rule.premature_age_months === null) return false;
  // A dose is premature-only if an earlier dose shares its recommended_age_months
  const sameVaccine = allRules.filter((r) => r.vaccine_id === rule.vaccine_id);
  return sameVaccine.some(
    (r) =>
      r.dose_number < rule.dose_number &&
      r.recommended_age_months === rule.recommended_age_months
  );
}

/** Determine if a schedule rule applies based on premature status. */
function shouldIncludeRule(
  rule: { vaccine_id: string; dose_number: number; recommended_age_months: number; premature_age_months: number | null },
  isPremature: boolean,
  allRules: { vaccine_id: string; dose_number: number; recommended_age_months: number; premature_age_months: number | null }[]
): boolean {
  if (isPrematureOnlyDose(rule, allRules) && !isPremature) return false;
  return true;
}

/** Get the age in months for a rule based on premature status. */
function getAgeMonths(
  rule: { recommended_age_months: number; premature_age_months: number | null },
  isPremature: boolean
): number {
  if (isPremature && rule.premature_age_months !== null) {
    return rule.premature_age_months;
  }
  return rule.recommended_age_months;
}

/** Generate vaccination schedule records for a child. */
export function generateVaccinationSchedule(
  input: VaccinationScheduleInput
): GeneratedVaccinationRecord[] {
  const { childId, dateOfBirth, isPremature, scheduleRules } = input;

  return scheduleRules
    .filter((rule) =>
      shouldIncludeRule(rule, isPremature, scheduleRules)
    )
    .map((rule) => ({
      child_id: childId,
      vaccine_id: rule.vaccine_id,
      dose_number: rule.dose_number,
      status: "scheduled" as const,
      scheduled_date: toDateString(
        addMonths(dateOfBirth, getAgeMonths(rule, isPremature))
      ),
    }));
}

// --- Schedule Recalculation ---

/** Recalculate schedule, preserving completed records. */
export function recalculateSchedule(
  input: RecalculateScheduleInput
): RecalculateScheduleResult {
  const {
    childId,
    dateOfBirth,
    isPremature,
    uExams,
    scheduleRules,
    existingUExamRecords,
    existingVaccinationRecords,
  } = input;

  const completedUExamIds = new Set(
    existingUExamRecords
      .filter((r) => r.status === "completed")
      .map((r) => r.u_exam_id)
  );

  const completedVaxKeys = new Set(
    existingVaccinationRecords
      .filter((r) => r.status === "completed")
      .map((r) => `${r.vaccine_id}:${r.dose_number}`)
  );

  const allUExamRecords = generateUExamSchedule({
    childId,
    dateOfBirth,
    uExams,
  });

  const allVaxRecords = generateVaccinationSchedule({
    childId,
    dateOfBirth,
    isPremature,
    scheduleRules,
  });

  return {
    uExamRecords: allUExamRecords.filter(
      (r) => !completedUExamIds.has(r.u_exam_id)
    ),
    vaccinationRecords: allVaxRecords.filter(
      (r) => !completedVaxKeys.has(`${r.vaccine_id}:${r.dose_number}`)
    ),
  };
}
