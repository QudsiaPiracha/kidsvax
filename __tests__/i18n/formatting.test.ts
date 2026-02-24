import {
  formatDate,
  formatNumber,
  formatChildAge,
  formatMedicalTerm,
} from "@/lib/formatting";

describe("formatDate", () => {
  it("should format date as DD.MM.YYYY in EN locale", () => {
    const date = new Date(2024, 2, 15); // March 15, 2024
    expect(formatDate(date)).toBe("15.03.2024");
  });

  it("should format date as DD.MM.YYYY in DE locale", () => {
    const date = new Date(2024, 11, 1); // Dec 1, 2024
    expect(formatDate(date)).toBe("01.12.2024");
  });

  it("should handle string date input", () => {
    expect(formatDate("2024-06-05")).toBe("05.06.2024");
  });

  it("should pad single-digit day and month with zero", () => {
    const date = new Date(2024, 0, 3); // Jan 3, 2024
    expect(formatDate(date)).toBe("03.01.2024");
  });
});

describe("formatNumber", () => {
  it("should format number as 1,234.56 in EN locale", () => {
    expect(formatNumber(1234.56, "en")).toBe("1,234.56");
  });

  it("should format number as 1.234,56 in DE locale", () => {
    expect(formatNumber(1234.56, "de")).toBe("1.234,56");
  });

  it("should format integer without decimals in EN locale", () => {
    expect(formatNumber(1000, "en")).toBe("1,000");
  });

  it("should format integer without decimals in DE locale", () => {
    expect(formatNumber(1000, "de")).toBe("1.000");
  });

  it("should handle small numbers without separators", () => {
    expect(formatNumber(42, "en")).toBe("42");
    expect(formatNumber(42, "de")).toBe("42");
  });
});

describe("formatMedicalTerm", () => {
  it("should show German medical terms in parentheses in EN mode", () => {
    const result = formatMedicalTerm(
      "U-Exam",
      "Vorsorgeuntersuchung",
      "en"
    );
    expect(result).toBe("U-Exam (Vorsorgeuntersuchung)");
  });

  it("should show only the German term in DE mode", () => {
    const result = formatMedicalTerm(
      "U-Exam",
      "Vorsorgeuntersuchung",
      "de"
    );
    expect(result).toBe("Vorsorgeuntersuchung");
  });

  it("should handle vaccination term formatting", () => {
    const result = formatMedicalTerm(
      "Vaccination",
      "Impfung",
      "en"
    );
    expect(result).toBe("Vaccination (Impfung)");
  });
});

describe("formatChildAge", () => {
  it("should calculate and display child age in months for under 2 years in EN", () => {
    const now = new Date(2024, 6, 15); // July 15, 2024
    const dob = new Date(2024, 0, 15); // Jan 15, 2024 (6 months)
    expect(formatChildAge(dob, "en", now)).toBe("6 months");
  });

  it("should calculate and display child age in months for under 2 years in DE", () => {
    const now = new Date(2024, 6, 15);
    const dob = new Date(2024, 0, 15);
    expect(formatChildAge(dob, "de", now)).toBe("6 Monate");
  });

  it("should calculate and display child age in years for 2+ in EN", () => {
    const now = new Date(2026, 0, 15); // Jan 15, 2026
    const dob = new Date(2022, 0, 15); // Jan 15, 2022 (4 years)
    expect(formatChildAge(dob, "en", now)).toBe("4 years");
  });

  it("should calculate and display child age in years for 2+ in DE", () => {
    const now = new Date(2026, 0, 15);
    const dob = new Date(2022, 0, 15);
    expect(formatChildAge(dob, "de", now)).toBe("4 Jahre");
  });

  it("should show 1 month for a newborn at exactly 1 month", () => {
    const now = new Date(2024, 1, 15); // Feb 15, 2024
    const dob = new Date(2024, 0, 15); // Jan 15, 2024
    expect(formatChildAge(dob, "en", now)).toBe("1 month");
  });

  it("should show singular month in DE", () => {
    const now = new Date(2024, 1, 15);
    const dob = new Date(2024, 0, 15);
    expect(formatChildAge(dob, "de", now)).toBe("1 Monat");
  });

  it("should show exactly 2 years at the boundary", () => {
    const now = new Date(2026, 0, 15);
    const dob = new Date(2024, 0, 15); // exactly 2 years
    expect(formatChildAge(dob, "en", now)).toBe("2 years");
  });

  it("should show 23 months just before 2 years", () => {
    const now = new Date(2025, 11, 15); // Dec 15, 2025
    const dob = new Date(2024, 0, 15); // Jan 15, 2024 (23 months)
    expect(formatChildAge(dob, "en", now)).toBe("23 months");
  });
});
