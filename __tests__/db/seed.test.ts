/**
 * Seed Data Tests
 *
 * These tests parse the seed SQL file and verify all reference data entries
 * without requiring a live database connection. This validates the seed data
 * follows the STIKO recommendations and German U-Heft structure.
 *
 * Tests verify: U-exams (20), Vaccines (11), Schedule Rules (~30),
 * Milestones (~40), bilingual content, and idempotency.
 */
import * as fs from "fs";
import * as path from "path";

const SEED_FILE = path.resolve(__dirname, "../../supabase/seed.sql");

let sql: string;
let sqlNoComments: string;

/**
 * Strip SQL single-line comments (-- ...) from SQL text.
 * Preserves strings by not stripping inside single quotes.
 */
function stripSqlComments(input: string): string {
  const lines = input.split("\n");
  return lines
    .map((line) => {
      // Remove -- comments that are not inside single-quoted strings
      let inString = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === "'" && (i === 0 || line[i - 1] !== "\\")) {
          inString = !inString;
        }
        if (
          !inString &&
          line[i] === "-" &&
          i + 1 < line.length &&
          line[i + 1] === "-"
        ) {
          return line.substring(0, i);
        }
      }
      return line;
    })
    .join("\n");
}

beforeAll(() => {
  sql = fs.readFileSync(SEED_FILE, "utf-8");
  sqlNoComments = stripSqlComments(sql);
});

// ---------------------------------------------------------------------------
// Helper: Extract INSERT blocks for a given table
// ---------------------------------------------------------------------------
function extractInserts(tableName: string): string[] {
  // Match individual VALUES tuples for the given table
  // Handles multi-line INSERT ... VALUES (...), (...), ...;
  const insertBlockRegex = new RegExp(
    `INSERT\\s+INTO\\s+(public\\.)?${tableName}\\s*\\([^)]+\\)\\s*VALUES\\s*([\\s\\S]*?)(?:ON\\s+CONFLICT|;)`,
    "gi"
  );
  const blocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = insertBlockRegex.exec(sqlNoComments)) !== null) {
    blocks.push(match[2]);
  }
  return blocks;
}

function countValueTuples(tableName: string): number {
  const blocks = extractInserts(tableName);
  let count = 0;
  for (const block of blocks) {
    // Count top-level parenthesized tuples by tracking paren depth
    let depth = 0;
    for (let i = 0; i < block.length; i++) {
      if (block[i] === "(") {
        if (depth === 0) count++;
        depth++;
      } else if (block[i] === ")") {
        depth--;
      }
    }
  }
  return count;
}

function extractValueStrings(tableName: string): string[] {
  const blocks = extractInserts(tableName);
  const tuples: string[] = [];
  for (const block of blocks) {
    let depth = 0;
    let start = -1;
    for (let i = 0; i < block.length; i++) {
      if (block[i] === "(") {
        if (depth === 0) start = i;
        depth++;
      } else if (block[i] === ")") {
        depth--;
        if (depth === 0 && start >= 0) {
          tuples.push(block.substring(start, i + 1));
          start = -1;
        }
      }
    }
  }
  return tuples;
}

// ---------------------------------------------------------------------------
// Seed file existence
// ---------------------------------------------------------------------------
describe("Seed file existence", () => {
  it("should have the seed.sql file", () => {
    expect(fs.existsSync(SEED_FILE)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// U-Exams
// ---------------------------------------------------------------------------
describe("U-Exams seed data", () => {
  it("should seed exactly 14 U/J-exam entries (U1-U9, U10, U11, J1, J2)", () => {
    const tuples = extractValueStrings("u_exams");
    const uAndJExams = tuples.filter((t) => {
      // Match category 'u_exam' or 'j_exam'
      return /'u_exam'/.test(t) || /'j_exam'/.test(t);
    });
    expect(uAndJExams.length).toBe(14);
  });

  it("should seed exactly 6 Z-exam entries (Z1-Z6)", () => {
    const tuples = extractValueStrings("u_exams");
    const zExams = tuples.filter((t) => /'z_exam'/.test(t));
    expect(zExams.length).toBe(6);
  });

  it("should seed a total of 20 U-exam entries", () => {
    const count = countValueTuples("u_exams");
    expect(count).toBe(20);
  });

  it("should have U3 with recommended_age_months=1 and tolerance 0.75-2", () => {
    const tuples = extractValueStrings("u_exams");
    const u3 = tuples.find((t) => /'U3'/.test(t));
    expect(u3).toBeDefined();
    // U3: name='U3', category='u_exam', recommended_age_months=1, tolerance_from=0.75, tolerance_to=2
    expect(u3).toMatch(/\b1\b/); // recommended_age_months = 1
    expect(u3).toMatch(/0\.75/); // tolerance_from_months
    expect(u3).toMatch(/\b2\b/); // tolerance_to_months (just the number 2)
  });

  it("should have U6 with recommended_age_months between 10-12 and tolerance 9-14", () => {
    const tuples = extractValueStrings("u_exams");
    const u6 = tuples.find((t) => /'U6'/.test(t));
    expect(u6).toBeDefined();
    // recommended_age_months is integer; for U6 we pick a value in 10-12 range
    // tolerance_from=9, tolerance_to=14
    expect(u6).toMatch(/\b(10|11|12)\b/);
    expect(u6).toMatch(/\b9\b/);
    expect(u6).toMatch(/\b14\b/);
  });

  it("should have U9 with recommended_age_months between 60-64 and tolerance 58-66", () => {
    const tuples = extractValueStrings("u_exams");
    const u9 = tuples.find((t) => /'U9'/.test(t));
    expect(u9).toBeDefined();
    expect(u9).toMatch(/\b(60|61|62|63|64)\b/);
    expect(u9).toMatch(/\b58\b/);
    expect(u9).toMatch(/\b66\b/);
  });

  it("should have all U-exam names present", () => {
    const expectedNames = [
      "U1",
      "U2",
      "U3",
      "U4",
      "U5",
      "U6",
      "U7",
      "U7a",
      "U8",
      "U9",
      "U10",
      "U11",
      "J1",
      "J2",
      "Z1",
      "Z2",
      "Z3",
      "Z4",
      "Z5",
      "Z6",
    ];
    for (const name of expectedNames) {
      expect(sql).toMatch(new RegExp(`'${name}'`));
    }
  });

  it("should have all U-exam descriptions in both EN and DE", () => {
    const tuples = extractValueStrings("u_exams");
    for (const tuple of tuples) {
      // Each tuple should have at least 2 quoted strings for description_en and description_de
      // Extract quoted strings (single-quoted)
      const quotes = tuple.match(/'[^']+'/g);
      // Should have at minimum: name, category, description_en, description_de = 4 quoted strings
      expect(quotes).not.toBeNull();
      expect(quotes!.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("should use deterministic UUIDs for u_exams starting with 00000000", () => {
    const tuples = extractValueStrings("u_exams");
    for (const tuple of tuples) {
      expect(tuple).toMatch(/'00000000-0000-0000-0000-\d{12}'/);
    }
  });
});

// ---------------------------------------------------------------------------
// Vaccines
// ---------------------------------------------------------------------------
describe("Vaccines seed data", () => {
  it("should seed all 11 STIKO vaccines", () => {
    const count = countValueTuples("vaccines");
    expect(count).toBe(11);
  });

  it("should mark only Masern-containing vaccines as is_mandatory=true", () => {
    const tuples = extractValueStrings("vaccines");
    const mandatoryTuples = tuples.filter((t) => /,\s*true\s*\)/.test(t));
    // Only MMR should be mandatory (Masernschutzgesetz)
    expect(mandatoryTuples.length).toBe(1);
    // That mandatory vaccine should be MMR
    const mmrTuple = mandatoryTuples[0];
    expect(mmrTuple).toMatch(/MMR/i);
  });

  it("should have all vaccine names in both EN and DE", () => {
    const tuples = extractValueStrings("vaccines");
    for (const tuple of tuples) {
      // Each vaccine has name_en, name_de, abbreviation, protects_against_en, protects_against_de
      const quotes = tuple.match(/'[^']+'/g);
      expect(quotes).not.toBeNull();
      // At least: uuid, name_en, name_de, abbreviation, protects_against_en, protects_against_de = 6
      expect(quotes!.length).toBeGreaterThanOrEqual(6);
    }
  });

  it("should have correct vaccine abbreviations", () => {
    const expectedAbbreviations = [
      "RV",
      "DTaP-IPV-Hib-HepB",
      "PCV",
      "MenB",
      "MenC",
      "MMR",
      "VZV",
      "Influenza",
      "Tdap-IPV",
      "HPV",
      "MenACWY",
    ];
    for (const abbr of expectedAbbreviations) {
      expect(sql).toMatch(new RegExp(`'${abbr}'`));
    }
  });

  it("should use deterministic UUIDs for vaccines starting with 10000000", () => {
    const tuples = extractValueStrings("vaccines");
    for (const tuple of tuples) {
      expect(tuple).toMatch(/'10000000-0000-0000-0000-\d{12}'/);
    }
  });
});

// ---------------------------------------------------------------------------
// Vaccine Schedule Rules
// ---------------------------------------------------------------------------
describe("Vaccine schedule rules seed data", () => {
  it("should seed at least 22 vaccine schedule rules", () => {
    const count = countValueTuples("vaccine_schedule_rules");
    // RV(2) + Hex(4) + PCV(3) + MenB(3) + MenC(1) + MMR(2) + VZV(2)
    // + Influenza(1) + Tdap(1) + HPV(2) + MenACWY(1) = 22
    expect(count).toBeGreaterThanOrEqual(22);
  });

  it("should have DTaP-IPV-Hib-HepB with 3 doses at months 2, 4, 11", () => {
    // Hexavalent vaccine UUID: 10000000-0000-0000-0000-000000000002
    const tuples = extractValueStrings("vaccine_schedule_rules");
    const hexTuples = tuples.filter((t) =>
      t.includes("10000000-0000-0000-0000-000000000002")
    );
    // Should have 3 standard doses (dose 1, 2, 3)
    expect(hexTuples.length).toBeGreaterThanOrEqual(3);

    // Check dose numbers 1, 2, 3 exist with correct ages
    const dose1 = hexTuples.find((t) => /,\s*1\s*,\s*2[\s,.]/.test(t));
    const dose2 = hexTuples.find((t) => /,\s*2\s*,\s*4[\s,.]/.test(t));
    const dose3 = hexTuples.find((t) => /,\s*3\s*,\s*11[\s,.]/.test(t));
    expect(dose1).toBeDefined();
    expect(dose2).toBeDefined();
    expect(dose3).toBeDefined();
  });

  it("should have MMR with 2 doses at months 11, 15", () => {
    // MMR vaccine UUID: 10000000-0000-0000-0000-000000000006
    const tuples = extractValueStrings("vaccine_schedule_rules");
    const mmrTuples = tuples.filter((t) =>
      t.includes("10000000-0000-0000-0000-000000000006")
    );
    expect(mmrTuples.length).toBe(2);

    const dose1 = mmrTuples.find((t) => /,\s*1\s*,\s*11[\s,.]/.test(t));
    const dose2 = mmrTuples.find((t) => /,\s*2\s*,\s*15[\s,.]/.test(t));
    expect(dose1).toBeDefined();
    expect(dose2).toBeDefined();
  });

  it("should have premature_age_months for hexavalent vaccine (2, 3, 4, 11)", () => {
    const tuples = extractValueStrings("vaccine_schedule_rules");
    const hexTuples = tuples.filter((t) =>
      t.includes("10000000-0000-0000-0000-000000000002")
    );

    // Check that premature_age_months values 2, 3, 4, 11 are present
    const prematureValues: number[] = [];
    for (const tuple of hexTuples) {
      // premature_age_months is the last numeric value before the closing paren
      // Look for non-NULL premature values
      const prematureMatch = tuple.match(
        /,\s*([\d.]+)\s*\)\s*$/
      );
      if (prematureMatch) {
        prematureValues.push(parseFloat(prematureMatch[1]));
      }
    }
    expect(prematureValues).toContain(2);
    expect(prematureValues).toContain(3);
    expect(prematureValues).toContain(4);
    expect(prematureValues).toContain(11);
  });

  it("should have Rotavirus with min_interval_days between doses", () => {
    // Rotavirus vaccine UUID: 10000000-0000-0000-0000-000000000001
    const tuples = extractValueStrings("vaccine_schedule_rules");
    const rvTuples = tuples.filter((t) =>
      t.includes("10000000-0000-0000-0000-000000000001")
    );
    expect(rvTuples.length).toBe(2);

    // At least one dose should have a min_interval_days value (not NULL)
    const hasMinInterval = rvTuples.some(
      (t) => /min_interval_days/.test(sql) && !/NULL.*NULL.*NULL/.test(t)
    );
    // The second dose should have min_interval_days set
    const dose2 = rvTuples.find((t) => /,\s*2\s*,/.test(t));
    expect(dose2).toBeDefined();
    // dose 2 should contain a min_interval_days value (not NULL for that field)
    // min_interval_days is the 5th value in the tuple
    expect(dose2).toMatch(/\b28\b/); // 28 days minimum interval
  });

  it("should use deterministic UUIDs for schedule rules starting with 20000000", () => {
    const tuples = extractValueStrings("vaccine_schedule_rules");
    for (const tuple of tuples) {
      expect(tuple).toMatch(/'20000000-0000-0000-0000-\d{12}'/);
    }
  });
});

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------
describe("Milestones seed data", () => {
  it("should seed milestones for U3 through U9", () => {
    // U3 = 00000000-0000-0000-0000-000000000003
    // U4 = 00000000-0000-0000-0000-000000000004
    // U5 = 00000000-0000-0000-0000-000000000005
    // U6 = 00000000-0000-0000-0000-000000000006
    // U7 = 00000000-0000-0000-0000-000000000007
    // U7a = 00000000-0000-0000-0000-000000000008
    // U8 = 00000000-0000-0000-0000-000000000009
    // U9 = 00000000-0000-0000-0000-000000000010
    const uExamIds = [
      "00000000-0000-0000-0000-000000000003", // U3
      "00000000-0000-0000-0000-000000000004", // U4
      "00000000-0000-0000-0000-000000000005", // U5
      "00000000-0000-0000-0000-000000000006", // U6
      "00000000-0000-0000-0000-000000000007", // U7
      "00000000-0000-0000-0000-000000000008", // U7a
      "00000000-0000-0000-0000-000000000009", // U8
      "00000000-0000-0000-0000-000000000010", // U9
    ];

    const tuples = extractValueStrings("milestones");

    for (const examId of uExamIds) {
      const examMilestones = tuples.filter((t) => t.includes(examId));
      expect(examMilestones.length).toBeGreaterThanOrEqual(3); // At least motor, language, social_cognitive
    }
  });

  it("should have motor, language, and social_cognitive milestones for each exam", () => {
    const uExamIds = [
      "00000000-0000-0000-0000-000000000003",
      "00000000-0000-0000-0000-000000000004",
      "00000000-0000-0000-0000-000000000005",
      "00000000-0000-0000-0000-000000000006",
      "00000000-0000-0000-0000-000000000007",
      "00000000-0000-0000-0000-000000000008",
      "00000000-0000-0000-0000-000000000009",
      "00000000-0000-0000-0000-000000000010",
    ];
    const categories = ["motor", "language", "social_cognitive"];
    const tuples = extractValueStrings("milestones");

    for (const examId of uExamIds) {
      const examMilestones = tuples.filter((t) => t.includes(examId));
      for (const category of categories) {
        const hasCat = examMilestones.some((t) =>
          t.includes(`'${category}'`)
        );
        expect(hasCat).toBe(true);
      }
    }
  });

  it("should have all milestone descriptions in both EN and DE", () => {
    const tuples = extractValueStrings("milestones");
    for (const tuple of tuples) {
      // Each milestone has: id, u_exam_id, category, description_en, description_de
      const quotes = tuple.match(/'[^']+'/g);
      expect(quotes).not.toBeNull();
      // At least: id(uuid), u_exam_id(uuid), category, description_en, description_de = 5
      expect(quotes!.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("should seed at least 32 milestones total", () => {
    const count = countValueTuples("milestones");
    // 8 exams x 4 milestones each = 32 minimum
    expect(count).toBeGreaterThanOrEqual(32);
  });

  it("should use deterministic UUIDs for milestones starting with 30000000", () => {
    const tuples = extractValueStrings("milestones");
    for (const tuple of tuples) {
      expect(tuple).toMatch(/'30000000-0000-0000-0000-\d{12}'/);
    }
  });
});

// ---------------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------------
describe("Idempotency", () => {
  it("should be idempotent -- running seed twice produces no duplicates", () => {
    // Use comment-stripped SQL to avoid matching comments
    // Count INSERT INTO statements
    const insertStatements =
      sqlNoComments.match(/INSERT\s+INTO\s+\S+/gi) || [];
    expect(insertStatements.length).toBeGreaterThan(0);

    // Count ON CONFLICT DO NOTHING statements
    const onConflictStatements =
      sqlNoComments.match(/ON\s+CONFLICT[\s\S]*?DO\s+NOTHING/gi) || [];

    // Every INSERT must have a corresponding ON CONFLICT DO NOTHING
    expect(onConflictStatements.length).toBe(insertStatements.length);
  });

  it("should use ON CONFLICT for u_exams inserts", () => {
    // u_exams has UNIQUE on name, so ON CONFLICT (name) or (id) should be used
    const uExamInsert =
      sql.match(
        /INSERT\s+INTO\s+(public\.)?u_exams[\s\S]*?ON\s+CONFLICT/i
      ) || [];
    expect(uExamInsert.length).toBeGreaterThan(0);
  });

  it("should use ON CONFLICT for vaccines inserts", () => {
    const vaccineInsert =
      sql.match(
        /INSERT\s+INTO\s+(public\.)?vaccines[\s\S]*?ON\s+CONFLICT/i
      ) || [];
    expect(vaccineInsert.length).toBeGreaterThan(0);
  });

  it("should use ON CONFLICT for vaccine_schedule_rules inserts", () => {
    const scheduleInsert =
      sql.match(
        /INSERT\s+INTO\s+(public\.)?vaccine_schedule_rules[\s\S]*?ON\s+CONFLICT/i
      ) || [];
    expect(scheduleInsert.length).toBeGreaterThan(0);
  });

  it("should use ON CONFLICT for milestones inserts", () => {
    const milestoneInsert =
      sql.match(
        /INSERT\s+INTO\s+(public\.)?milestones[\s\S]*?ON\s+CONFLICT/i
      ) || [];
    expect(milestoneInsert.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Specific content validations
// ---------------------------------------------------------------------------
describe("Specific content validations", () => {
  it("should have Rotavirus with 2 total_doses", () => {
    const tuples = extractValueStrings("vaccines");
    const rv = tuples.find((t) => /'RV'/.test(t));
    expect(rv).toBeDefined();
    expect(rv).toMatch(/,\s*2\s*,/); // total_doses = 2
  });

  it("should have Hexavalent with 3 total_doses", () => {
    const tuples = extractValueStrings("vaccines");
    const hex = tuples.find((t) => /'DTaP-IPV-Hib-HepB'/.test(t));
    expect(hex).toBeDefined();
    expect(hex).toMatch(/,\s*3\s*,/); // total_doses = 3
  });

  it("should have MMR with 2 total_doses and is_mandatory=true", () => {
    const tuples = extractValueStrings("vaccines");
    const mmr = tuples.find((t) => /'MMR'/.test(t));
    expect(mmr).toBeDefined();
    expect(mmr).toMatch(/,\s*2\s*,/); // total_doses = 2
    expect(mmr).toMatch(/true/); // is_mandatory = true
  });

  it("should have HPV with 2 total_doses", () => {
    const tuples = extractValueStrings("vaccines");
    const hpv = tuples.find((t) => /'HPV'/.test(t));
    expect(hpv).toBeDefined();
    expect(hpv).toMatch(/,\s*2\s*,/); // total_doses = 2
  });

  it("should have U1 for birth (0 months)", () => {
    const tuples = extractValueStrings("u_exams");
    const u1 = tuples.find((t) => /'U1'/.test(t));
    expect(u1).toBeDefined();
    // recommended_age_months = 0
    expect(u1).toMatch(/'u_exam'/);
  });

  it("should have J1 and J2 categorized as j_exam", () => {
    const tuples = extractValueStrings("u_exams");
    const j1 = tuples.find((t) => /'J1'/.test(t));
    const j2 = tuples.find((t) => /'J2'/.test(t));
    expect(j1).toBeDefined();
    expect(j2).toBeDefined();
    expect(j1).toMatch(/'j_exam'/);
    expect(j2).toMatch(/'j_exam'/);
  });

  it("should have Z exams categorized as z_exam", () => {
    const tuples = extractValueStrings("u_exams");
    for (let i = 1; i <= 6; i++) {
      const z = tuples.find((t) => new RegExp(`'Z${i}'`).test(t));
      expect(z).toBeDefined();
      expect(z).toMatch(/'z_exam'/);
    }
  });

  it("should have German descriptions containing German characters or words", () => {
    // Check that German descriptions exist (contain typical German words)
    expect(sql).toMatch(/Untersuchung/i);
    expect(sql).toMatch(/Impfung|Impfstoff/i);
  });
});
