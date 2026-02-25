/**
 * Calculate the age of a child from date of birth.
 * Under 2 years: returns "X months"
 * 2+ years: returns "X years"
 */
export function calculateAge(dateOfBirth: string, now = new Date()): string {
  const dob = new Date(dateOfBirth);
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  const years = Math.floor(months / 12);

  if (years >= 2) {
    return `${years} years`;
  }
  return months === 1 ? "1 month" : `${months} months`;
}

/**
 * Calculate countdown text for an upcoming date.
 * < 30 days: "X days"
 * 30-90 days: "X weeks"
 * > 90 days: returns null (no countdown shown)
 */
export function calculateCountdown(
  dateStr: string,
  now = new Date()
): string | null {
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays <= 90) {
    const weeks = Math.round(diffDays / 7);
    return `${weeks} weeks`;
  }
  return null;
}

/** Calculate age in months (decimal) between DOB and a reference date. */
export function calculateAgeMonths(dob: string, referenceDate: string): number {
  const birth = new Date(dob);
  const ref = new Date(referenceDate);
  const months =
    (ref.getFullYear() - birth.getFullYear()) * 12 +
    (ref.getMonth() - birth.getMonth()) +
    (ref.getDate() - birth.getDate()) / 30;
  return Math.max(0, Math.round(months * 10) / 10);
}

/**
 * Format an ISO date string as DD.MM.YYYY (German standard).
 */
export function formatDateDE(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
