import { checkMasernCompliance } from "@/lib/masern-compliance";

describe("Masernschutzgesetz compliance", () => {
  it("should return non-compliant for child age 1+ with 0 measles doses", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 1);
    dob.setMonth(dob.getMonth() - 1); // 13 months old

    const result = checkMasernCompliance(dob, []);

    expect(result).toBe("non_compliant");
  });

  it("should return compliant for child age 1-2 with 1 measles dose", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 1);
    dob.setMonth(dob.getMonth() - 6); // 18 months old

    const records = [
      { vaccine_id: "v-mmr", dose_number: 1, status: "administered" as const },
    ];

    const result = checkMasernCompliance(dob, records);

    expect(result).toBe("compliant");
  });

  it("should return non-compliant for child age 2+ with only 1 measles dose", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 3); // 3 years old

    const records = [
      { vaccine_id: "v-mmr", dose_number: 1, status: "administered" as const },
    ];

    const result = checkMasernCompliance(dob, records);

    expect(result).toBe("non_compliant");
  });

  it("should return compliant for child age 2+ with 2 measles doses", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 3); // 3 years old

    const records = [
      { vaccine_id: "v-mmr", dose_number: 1, status: "administered" as const },
      { vaccine_id: "v-mmr", dose_number: 2, status: "administered" as const },
    ];

    const result = checkMasernCompliance(dob, records);

    expect(result).toBe("compliant");
  });

  it("should return 'not_yet_required' for child under 1 year", () => {
    const dob = new Date();
    dob.setMonth(dob.getMonth() - 6); // 6 months old

    const result = checkMasernCompliance(dob, []);

    expect(result).toBe("not_yet_required");
  });

  it("should only count doses with status 'administered'", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 3); // 3 years old

    const records = [
      { vaccine_id: "v-mmr", dose_number: 1, status: "administered" as const },
      { vaccine_id: "v-mmr", dose_number: 2, status: "scheduled" as const },
    ];

    const result = checkMasernCompliance(dob, records);

    expect(result).toBe("non_compliant");
  });
});
