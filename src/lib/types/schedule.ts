// =============================================================================
// Schedule Engine Types
// =============================================================================
// Pure type definitions for the schedule generation engine.
// Maps to database schema from 00001_initial_schema.sql and seed.sql.
// =============================================================================

/** Reference data: a U-exam definition (from public.u_exams table) */
export interface UExam {
  id: string;
  name: string;
  category: "u_exam" | "j_exam" | "z_exam";
  recommended_age_months: number;
  tolerance_from_months: number;
  tolerance_to_months: number;
  description_en: string;
  description_de: string;
}

/** Reference data: a vaccine schedule rule (from public.vaccine_schedule_rules) */
export interface VaccineScheduleRule {
  id: string;
  vaccine_id: string;
  dose_number: number;
  recommended_age_months: number;
  min_age_months: number | null;
  min_interval_days: number | null;
  premature_age_months: number | null;
}

/** A generated U-exam record ready to insert into public.u_exam_records */
export interface GeneratedUExamRecord {
  child_id: string;
  u_exam_id: string;
  status: "scheduled";
  scheduled_date: string; // ISO date string (YYYY-MM-DD)
}

/** A generated vaccination record ready to insert into public.vaccination_records */
export interface GeneratedVaccinationRecord {
  child_id: string;
  vaccine_id: string;
  dose_number: number;
  status: "scheduled";
  scheduled_date: string; // ISO date string (YYYY-MM-DD)
}

/** Input for U-exam schedule generation */
export interface UExamScheduleInput {
  childId: string;
  dateOfBirth: Date;
  uExams: UExam[];
}

/** Input for vaccination schedule generation */
export interface VaccinationScheduleInput {
  childId: string;
  dateOfBirth: Date;
  isPremature: boolean;
  scheduleRules: VaccineScheduleRule[];
}

/** Existing record status for recalculation (preserving completed records) */
export type RecordStatus =
  | "scheduled"
  | "upcoming"
  | "completed"
  | "skipped"
  | "overdue";

/** Existing U-exam record for recalculation */
export interface ExistingUExamRecord {
  id: string;
  u_exam_id: string;
  status: RecordStatus;
}

/** Existing vaccination record for recalculation */
export interface ExistingVaccinationRecord {
  id: string;
  vaccine_id: string;
  dose_number: number;
  status: RecordStatus;
}

/** Input for schedule recalculation */
export interface RecalculateScheduleInput {
  childId: string;
  dateOfBirth: Date;
  isPremature: boolean;
  uExams: UExam[];
  scheduleRules: VaccineScheduleRule[];
  existingUExamRecords: ExistingUExamRecord[];
  existingVaccinationRecords: ExistingVaccinationRecord[];
}

/** Output from schedule recalculation */
export interface RecalculateScheduleResult {
  uExamRecords: GeneratedUExamRecord[];
  vaccinationRecords: GeneratedVaccinationRecord[];
}
