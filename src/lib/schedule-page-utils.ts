import type { TimelineItemData } from "@/components/Timeline/TimelineItem";

/**
 * Calculate the age group label for a scheduled item based on
 * the child's DOB and the item's scheduled date.
 */
export function calculateAgeGroup(
  childDob: string,
  scheduledDate: string
): string {
  const dob = new Date(childDob);
  const scheduled = new Date(scheduledDate);
  const diffMs = scheduled.getTime() - dob.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths =
    (scheduled.getFullYear() - dob.getFullYear()) * 12 +
    (scheduled.getMonth() - dob.getMonth());

  if (diffDays <= 14) return "Newborn";
  if (diffMonths <= 4) return "2-4 months";
  if (diffMonths <= 12) return "6-12 months";
  if (diffMonths <= 27) return "1-2 years";
  if (diffMonths <= 66) return "3-5 years";
  if (diffMonths <= 130) return "School age (6-10)";
  return "Adolescent (12-17)";
}

interface UExamApiRecord {
  id: string;
  status: string;
  status_badge: string;
  scheduled_date: string;
  completed_date: string | null;
  physician_name: string | null;
  u_exams: { name: string; description_en: string } | null;
}

interface VaccinationApiRecord {
  id: string;
  dose_number: number;
  status: string;
  scheduled_date: string;
  administered_date: string | null;
  physician_name: string | null;
  vaccines: { name_en: string; protects_against_en: string } | null;
}

type TimelineItemWithAgeGroup = TimelineItemData & { age_group: string };

/**
 * Transform a u-exam API record into a TimelineItemData with age_group.
 */
export function transformUExamToTimelineItem(
  record: UExamApiRecord,
  childDob: string
): TimelineItemWithAgeGroup {
  const name = record.u_exams?.name ?? "U-Exam";
  const details = record.u_exams?.description_en ?? "";
  const status = (record.status_badge ?? record.status) as TimelineItemData["status"];

  return {
    id: record.id,
    name,
    type: "u_exam",
    status,
    scheduled_date: record.scheduled_date,
    details,
    administered_date: record.completed_date,
    physician: record.physician_name,
    age_group: calculateAgeGroup(childDob, record.scheduled_date),
  };
}

/**
 * Transform a vaccination API record into a TimelineItemData with age_group.
 * Maps "administered" status to "completed" for consistent display.
 */
export function transformVaccinationToTimelineItem(
  record: VaccinationApiRecord,
  childDob: string
): TimelineItemWithAgeGroup {
  const vaccineName = record.vaccines?.name_en ?? "Vaccination";
  const name = `${vaccineName} (Dose ${record.dose_number})`;
  const details = record.vaccines?.protects_against_en ?? "";
  const status =
    record.status === "administered"
      ? "completed"
      : (record.status as TimelineItemData["status"]);

  return {
    id: record.id,
    name,
    type: "vaccination",
    status,
    scheduled_date: record.scheduled_date,
    details,
    administered_date: record.administered_date,
    physician: record.physician_name,
    age_group: calculateAgeGroup(childDob, record.scheduled_date),
  };
}

/**
 * Merge u-exam and vaccination timeline items, sorted by scheduled_date.
 */
export function mergeAndSortTimelineItems(
  uExamItems: TimelineItemData[],
  vaccItems: TimelineItemData[]
): TimelineItemData[] {
  return [...uExamItems, ...vaccItems].sort(
    (a, b) =>
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  );
}
