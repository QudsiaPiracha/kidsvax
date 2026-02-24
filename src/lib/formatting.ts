import type { Locale } from "@/i18n/config";

/**
 * Format date as DD.MM.YYYY (German standard, used in both locales).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Format number with locale-specific separators.
 * EN: 1,234.56  |  DE: 1.234,56
 */
export function formatNumber(num: number, locale: Locale): string {
  return num.toLocaleString(locale === "de" ? "de-DE" : "en-US");
}

/**
 * Calculate child age from date of birth and return display string.
 * Under 2 years: "X months" / "X Monate"
 * 2+ years: "X years" / "X Jahre"
 */
export function formatChildAge(
  dateOfBirth: Date,
  locale: Locale,
  now: Date = new Date()
): string {
  const months = calculateMonths(dateOfBirth, now);
  const years = Math.floor(months / 12);

  if (years >= 2) {
    return locale === "de" ? `${years} Jahre` : `${years} years`;
  }

  return formatMonthsLabel(months, locale);
}

function calculateMonths(dob: Date, now: Date): number {
  return (
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  );
}

function formatMonthsLabel(months: number, locale: Locale): string {
  if (locale === "de") {
    return months === 1 ? "1 Monat" : `${months} Monate`;
  }
  return months === 1 ? "1 month" : `${months} months`;
}

/**
 * Show German medical term in parentheses when in EN mode.
 * In DE mode, return only the German term.
 */
export function formatMedicalTerm(
  enTerm: string,
  deTerm: string,
  locale: Locale
): string {
  if (locale === "de") {
    return deTerm;
  }
  return `${enTerm} (${deTerm})`;
}
