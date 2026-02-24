// Pure function: given upcoming items and reminder history,
// determine what reminders to send.

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

interface UExamItem {
  id: string;
  child_id: string;
  exam_type: string;
  scheduled_date: string;
  status: string;
}

interface VaccinationItem {
  id: string;
  child_id: string;
  vaccine_name: string;
  dose_number: number;
  scheduled_date: string;
  status: string;
}

interface ReminderHistoryEntry {
  item_id: string;
  item_type: string;
  sent_at: string;
}

interface ReminderPreferences {
  u_exam_reminders: boolean;
  vaccination_reminders: boolean;
}

interface ChildInfo {
  id: string;
  date_of_birth: string;
}

export interface ReminderInput {
  uExams: UExamItem[];
  vaccinations: VaccinationItem[];
  reminderHistory: ReminderHistoryEntry[];
  preferences: ReminderPreferences;
  children: ChildInfo[];
}

export interface ReminderOutput {
  uExamReminders: UExamItem[];
  vaccinationReminders: VaccinationItem[];
  overdueAlerts: Array<UExamItem | VaccinationItem>;
  masernschutzAlerts: VaccinationItem[];
}

// -----------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------

const U_EXAM_REMINDER_DAYS = 14;
const VACCINATION_REMINDER_DAYS = 7;
const COMPLETED_STATUSES = ["completed", "administered", "skipped"];
const MASERN_NAMES = ["masern", "measles", "mmr"];

// -----------------------------------------------------------------------
// Main function
// -----------------------------------------------------------------------

export function identifyDueReminders(
  input: ReminderInput,
  todayStr: string
): ReminderOutput {
  const today = new Date(todayStr);
  const remindedIds = new Set(input.reminderHistory.map((r) => r.item_id));

  const uExamReminders = filterDueUExams(
    input.uExams, today, remindedIds, input.preferences
  );
  const vaccinationReminders = filterDueVaccinations(
    input.vaccinations, today, remindedIds, input.preferences
  );
  const overdueAlerts = findOverdueItems(
    input.uExams, input.vaccinations, today, remindedIds
  );
  const masernschutzAlerts = findMasernschutzAlerts(
    input.vaccinations, input.children
  );

  return { uExamReminders, vaccinationReminders, overdueAlerts, masernschutzAlerts };
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function filterDueUExams(
  exams: UExamItem[],
  today: Date,
  remindedIds: Set<string>,
  prefs: ReminderPreferences
): UExamItem[] {
  if (!prefs.u_exam_reminders) return [];

  return exams.filter((exam) => {
    if (COMPLETED_STATUSES.includes(exam.status)) return false;
    if (remindedIds.has(exam.id)) return false;
    const daysUntil = daysBetween(today, new Date(exam.scheduled_date));
    return daysUntil >= 0 && daysUntil <= U_EXAM_REMINDER_DAYS;
  });
}

function filterDueVaccinations(
  vaccinations: VaccinationItem[],
  today: Date,
  remindedIds: Set<string>,
  prefs: ReminderPreferences
): VaccinationItem[] {
  if (!prefs.vaccination_reminders) return [];

  return vaccinations.filter((vax) => {
    if (COMPLETED_STATUSES.includes(vax.status)) return false;
    if (remindedIds.has(vax.id)) return false;
    const daysUntil = daysBetween(today, new Date(vax.scheduled_date));
    return daysUntil >= 0 && daysUntil <= VACCINATION_REMINDER_DAYS;
  });
}

function findOverdueItems(
  exams: UExamItem[],
  vaccinations: VaccinationItem[],
  today: Date,
  remindedIds: Set<string>
): Array<UExamItem | VaccinationItem> {
  const overdue: Array<UExamItem | VaccinationItem> = [];

  for (const exam of exams) {
    if (COMPLETED_STATUSES.includes(exam.status)) continue;
    if (remindedIds.has(exam.id)) continue;
    if (new Date(exam.scheduled_date) < today) overdue.push(exam);
  }

  for (const vax of vaccinations) {
    if (COMPLETED_STATUSES.includes(vax.status)) continue;
    if (remindedIds.has(vax.id)) continue;
    if (new Date(vax.scheduled_date) < today) overdue.push(vax);
  }

  return overdue;
}

function findMasernschutzAlerts(
  vaccinations: VaccinationItem[],
  children: ChildInfo[]
): VaccinationItem[] {
  const alerts: VaccinationItem[] = [];

  for (const child of children) {
    const ageMonths = monthsBetween(
      new Date(child.date_of_birth),
      new Date()
    );
    const isMasernAge = ageMonths >= 10 && ageMonths <= 25;
    if (!isMasernAge) continue;

    const masernVax = vaccinations.filter(
      (v) =>
        v.child_id === child.id &&
        MASERN_NAMES.some((n) => v.vaccine_name.toLowerCase().includes(n))
    );
    const hasAdministered = masernVax.some(
      (v) => v.status === "administered"
    );
    if (!hasAdministered && masernVax.length > 0) {
      alerts.push(...masernVax.filter((v) => v.status === "scheduled"));
    }
  }

  return alerts;
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 86400000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}
