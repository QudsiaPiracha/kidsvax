// Masernschutzgesetz compliance calculator
// Pure function - no side effects, no DB calls

export type MasernComplianceStatus =
  | "compliant"
  | "non_compliant"
  | "not_yet_required";

interface MeaslesVaccinationRecord {
  vaccine_id: string;
  dose_number: number;
  status: string;
}

/** Calculate child's age in months from DOB to today. */
function ageInMonths(dob: Date): number {
  const now = new Date();
  const years = now.getFullYear() - dob.getFullYear();
  const months = now.getMonth() - dob.getMonth();
  const dayAdjust = now.getDate() < dob.getDate() ? -1 : 0;
  return years * 12 + months + dayAdjust;
}

/**
 * Check Masernschutzgesetz compliance based on child's DOB
 * and their measles-containing vaccination records.
 *
 * Rules (Masernschutzgesetz):
 * - Under 12 months: not yet required
 * - 12-23 months: 1 administered dose required
 * - 24+ months: 2 administered doses required
 */
export function checkMasernCompliance(
  dob: Date,
  records: MeaslesVaccinationRecord[]
): MasernComplianceStatus {
  const months = ageInMonths(dob);

  if (months < 12) return "not_yet_required";

  const administeredCount = records.filter(
    (r) => r.status === "administered"
  ).length;

  if (months < 24) {
    return administeredCount >= 1 ? "compliant" : "non_compliant";
  }

  return administeredCount >= 2 ? "compliant" : "non_compliant";
}
