/**
 * Database Schema Tests
 *
 * These tests parse the migration SQL file and verify the schema structure
 * without requiring a live database connection. This is the TDD approach
 * for validating SQL migrations in unit tests.
 */
import * as fs from "fs";
import * as path from "path";

const MIGRATION_FILE = path.resolve(
  __dirname,
  "../../supabase/migrations/00001_initial_schema.sql"
);

let sql: string;

beforeAll(() => {
  sql = fs.readFileSync(MIGRATION_FILE, "utf-8");
});

describe("Migration file existence", () => {
  it("should have the initial schema migration file", () => {
    expect(fs.existsSync(MIGRATION_FILE)).toBe(true);
  });
});

describe("Table creation", () => {
  const expectedTables = [
    "user_profiles",
    "children",
    "pediatricians",
    "u_exams",
    "u_exam_records",
    "screenings",
    "vaccines",
    "vaccine_schedule_rules",
    "vaccination_records",
    "milestones",
    "milestone_records",
    "growth_measurements",
    "ai_insights",
    "document_scans",
    "appointments",
    "reminders",
  ];

  it("should create all 16 tables", () => {
    for (const table of expectedTables) {
      const pattern = new RegExp(
        `CREATE\\s+TABLE\\s+(public\\.)?${table}\\s*\\(`,
        "i"
      );
      expect(sql).toMatch(pattern);
    }
  });

  it.each(expectedTables)("should create table %s", (table) => {
    const pattern = new RegExp(
      `CREATE\\s+TABLE\\s+(public\\.)?${table}\\s*\\(`,
      "i"
    );
    expect(sql).toMatch(pattern);
  });
});

describe("user_profiles table", () => {
  it("should have id as UUID primary key referencing auth.users", () => {
    expect(sql).toMatch(
      /user_profiles[\s\S]*?id\s+uuid\s+PRIMARY\s+KEY\s+REFERENCES\s+auth\.users/i
    );
  });

  it("should have display_name column", () => {
    expect(sql).toMatch(/user_profiles[\s\S]*?display_name\s+text/i);
  });

  it("should have language column with default 'en'", () => {
    expect(sql).toMatch(
      /user_profiles[\s\S]*?language\s+text[\s\S]*?DEFAULT\s+'en'/i
    );
  });

  it("should have language check constraint for en and de", () => {
    expect(sql).toMatch(
      /language[\s\S]*?CHECK[\s\S]*?language[\s\S]*?IN\s*\(\s*'en'\s*,\s*'de'\s*\)/i
    );
  });

  it("should have bundesland column (nullable)", () => {
    expect(sql).toMatch(/user_profiles[\s\S]*?bundesland\s+text/i);
  });

  it("should have reminder_preferences as jsonb", () => {
    expect(sql).toMatch(
      /user_profiles[\s\S]*?reminder_preferences\s+jsonb/i
    );
  });

  it("should have created_at and updated_at timestamps", () => {
    expect(sql).toMatch(/user_profiles[\s\S]*?created_at\s+timestamptz/i);
    expect(sql).toMatch(/user_profiles[\s\S]*?updated_at\s+timestamptz/i);
  });
});

describe("children table", () => {
  it("should have id as UUID primary key with gen_random_uuid()", () => {
    expect(sql).toMatch(
      /children[\s\S]*?id\s+uuid\s+PRIMARY\s+KEY\s+DEFAULT\s+gen_random_uuid\(\)/i
    );
  });

  it("should have user_id as FK to auth.users NOT NULL", () => {
    expect(sql).toMatch(
      /children[\s\S]*?user_id\s+uuid[\s\S]*?NOT\s+NULL[\s\S]*?REFERENCES\s+auth\.users/i
    );
  });

  it("should have name as NOT NULL text", () => {
    expect(sql).toMatch(/children[\s\S]*?name\s+text\s+NOT\s+NULL/i);
  });

  it("should have date_of_birth as NOT NULL date", () => {
    expect(sql).toMatch(
      /children[\s\S]*?date_of_birth\s+date\s+NOT\s+NULL/i
    );
  });

  it("should have gender with check constraint", () => {
    expect(sql).toMatch(
      /gender[\s\S]*?CHECK[\s\S]*?gender[\s\S]*?IN\s*\(\s*'male'\s*,\s*'female'\s*,\s*'diverse'\s*\)/i
    );
  });

  it("should have is_premature boolean defaulting to false", () => {
    expect(sql).toMatch(
      /children[\s\S]*?is_premature\s+boolean[\s\S]*?DEFAULT\s+false/i
    );
  });

  it("should have optional columns: photo_url, allergies, notes, blood_type", () => {
    expect(sql).toMatch(/children[\s\S]*?photo_url\s+text/i);
    expect(sql).toMatch(/children[\s\S]*?allergies\s+text/i);
    expect(sql).toMatch(/children[\s\S]*?notes\s+text/i);
    expect(sql).toMatch(/children[\s\S]*?blood_type\s+text/i);
  });
});

describe("pediatricians table", () => {
  it("should have id as UUID primary key", () => {
    expect(sql).toMatch(
      /pediatricians[\s\S]*?id\s+uuid\s+PRIMARY\s+KEY/i
    );
  });

  it("should have user_id FK to auth.users NOT NULL", () => {
    expect(sql).toMatch(
      /pediatricians[\s\S]*?user_id\s+uuid[\s\S]*?NOT\s+NULL[\s\S]*?REFERENCES\s+auth\.users/i
    );
  });

  it("should have name NOT NULL", () => {
    expect(sql).toMatch(/pediatricians[\s\S]*?name\s+text\s+NOT\s+NULL/i);
  });

  it("should have optional columns: practice_name, phone, address", () => {
    expect(sql).toMatch(/pediatricians[\s\S]*?practice_name\s+text/i);
    expect(sql).toMatch(/pediatricians[\s\S]*?phone\s+text/i);
    expect(sql).toMatch(/pediatricians[\s\S]*?address\s+text/i);
  });
});

describe("u_exams table (reference data)", () => {
  it("should have name as unique NOT NULL text", () => {
    expect(sql).toMatch(
      /u_exams[\s\S]*?name\s+text[\s\S]*?NOT\s+NULL[\s\S]*?UNIQUE/i
    );
  });

  it("should have category NOT NULL", () => {
    expect(sql).toMatch(/u_exams[\s\S]*?category\s+text\s+NOT\s+NULL/i);
  });

  it("should have recommended_age_months as integer NOT NULL", () => {
    expect(sql).toMatch(
      /u_exams[\s\S]*?recommended_age_months\s+integer\s+NOT\s+NULL/i
    );
  });

  it("should have tolerance_from_months and tolerance_to_months as numeric NOT NULL", () => {
    expect(sql).toMatch(
      /u_exams[\s\S]*?tolerance_from_months\s+numeric\s+NOT\s+NULL/i
    );
    expect(sql).toMatch(
      /u_exams[\s\S]*?tolerance_to_months\s+numeric\s+NOT\s+NULL/i
    );
  });

  it("should have bilingual description columns", () => {
    expect(sql).toMatch(
      /u_exams[\s\S]*?description_en\s+text\s+NOT\s+NULL/i
    );
    expect(sql).toMatch(
      /u_exams[\s\S]*?description_de\s+text\s+NOT\s+NULL/i
    );
  });
});

describe("u_exam_records table", () => {
  it("should have child_id FK to children with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /u_exam_records[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have u_exam_id FK to u_exams", () => {
    expect(sql).toMatch(
      /u_exam_records[\s\S]*?u_exam_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?u_exams/i
    );
  });

  it("should have status with check constraint and default 'scheduled'", () => {
    expect(sql).toMatch(
      /u_exam_records[\s\S]*?status\s+text[\s\S]*?DEFAULT\s+'scheduled'/i
    );
    expect(sql).toMatch(
      /u_exam_records[\s\S]*?CHECK[\s\S]*?status[\s\S]*?IN\s*\([^)]*'scheduled'[^)]*'completed'[^)]*\)/i
    );
  });

  it("should have scheduled_date NOT NULL and completed_date nullable", () => {
    expect(sql).toMatch(
      /u_exam_records[\s\S]*?scheduled_date\s+date\s+NOT\s+NULL/i
    );
    expect(sql).toMatch(/u_exam_records[\s\S]*?completed_date\s+date/i);
  });

  it("should have physician_name, findings_notes, parent_observations, referrals", () => {
    expect(sql).toMatch(/u_exam_records[\s\S]*?physician_name\s+text/i);
    expect(sql).toMatch(/u_exam_records[\s\S]*?findings_notes\s+text/i);
    expect(sql).toMatch(
      /u_exam_records[\s\S]*?parent_observations\s+text/i
    );
    expect(sql).toMatch(/u_exam_records[\s\S]*?referrals\s+text/i);
  });
});

describe("screenings table", () => {
  it("should have u_exam_record_id FK to u_exam_records with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /screenings[\s\S]*?u_exam_record_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?u_exam_records[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have screening_type NOT NULL", () => {
    expect(sql).toMatch(
      /screenings[\s\S]*?screening_type\s+text\s+NOT\s+NULL/i
    );
  });

  it("should have result and notes columns", () => {
    expect(sql).toMatch(/screenings[\s\S]*?result\s+text/i);
    expect(sql).toMatch(/screenings[\s\S]*?notes\s+text/i);
  });
});

describe("vaccines table (reference data)", () => {
  it("should have bilingual name columns", () => {
    expect(sql).toMatch(/vaccines[\s\S]*?name_en\s+text\s+NOT\s+NULL/i);
    expect(sql).toMatch(/vaccines[\s\S]*?name_de\s+text\s+NOT\s+NULL/i);
  });

  it("should have abbreviation NOT NULL", () => {
    expect(sql).toMatch(
      /vaccines[\s\S]*?abbreviation\s+text\s+NOT\s+NULL/i
    );
  });

  it("should have bilingual protects_against columns", () => {
    expect(sql).toMatch(
      /vaccines[\s\S]*?protects_against_en\s+text\s+NOT\s+NULL/i
    );
    expect(sql).toMatch(
      /vaccines[\s\S]*?protects_against_de\s+text\s+NOT\s+NULL/i
    );
  });

  it("should have total_doses as integer NOT NULL", () => {
    expect(sql).toMatch(
      /vaccines[\s\S]*?total_doses\s+integer\s+NOT\s+NULL/i
    );
  });

  it("should have is_mandatory boolean with default false", () => {
    expect(sql).toMatch(
      /vaccines[\s\S]*?is_mandatory\s+boolean[\s\S]*?DEFAULT\s+false/i
    );
  });
});

describe("vaccine_schedule_rules table", () => {
  it("should have vaccine_id FK to vaccines", () => {
    expect(sql).toMatch(
      /vaccine_schedule_rules[\s\S]*?vaccine_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?vaccines/i
    );
  });

  it("should have dose_number as integer NOT NULL", () => {
    expect(sql).toMatch(
      /vaccine_schedule_rules[\s\S]*?dose_number\s+integer\s+NOT\s+NULL/i
    );
  });

  it("should have recommended_age_months as numeric NOT NULL", () => {
    expect(sql).toMatch(
      /vaccine_schedule_rules[\s\S]*?recommended_age_months\s+numeric\s+NOT\s+NULL/i
    );
  });

  it("should have premature_age_months for 3+1 schedule", () => {
    expect(sql).toMatch(
      /vaccine_schedule_rules[\s\S]*?premature_age_months\s+numeric/i
    );
  });
});

describe("vaccination_records table", () => {
  it("should have child_id FK to children with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /vaccination_records[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have vaccine_id FK to vaccines", () => {
    expect(sql).toMatch(
      /vaccination_records[\s\S]*?vaccine_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?vaccines/i
    );
  });

  it("should have status with check constraint including administered", () => {
    expect(sql).toMatch(
      /vaccination_records[\s\S]*?CHECK[\s\S]*?status[\s\S]*?IN\s*\([^)]*'administered'[^)]*\)/i
    );
  });

  it("should have medical detail columns: product_name, lot_number, injection_site", () => {
    expect(sql).toMatch(/vaccination_records[\s\S]*?product_name\s+text/i);
    expect(sql).toMatch(/vaccination_records[\s\S]*?lot_number\s+text/i);
    expect(sql).toMatch(
      /vaccination_records[\s\S]*?injection_site\s+text/i
    );
  });
});

describe("milestones table (reference data)", () => {
  it("should have u_exam_id FK to u_exams", () => {
    expect(sql).toMatch(
      /milestones[\s\S]*?u_exam_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?u_exams/i
    );
  });

  it("should have category with check constraint for motor, language, social_cognitive", () => {
    expect(sql).toMatch(
      /milestones[\s\S]*?CHECK[\s\S]*?category[\s\S]*?IN\s*\([^)]*'motor'[^)]*'language'[^)]*'social_cognitive'[^)]*\)/i
    );
  });

  it("should have bilingual description columns", () => {
    expect(sql).toMatch(
      /milestones[\s\S]*?description_en\s+text\s+NOT\s+NULL/i
    );
    expect(sql).toMatch(
      /milestones[\s\S]*?description_de\s+text\s+NOT\s+NULL/i
    );
  });
});

describe("milestone_records table", () => {
  it("should have child_id FK with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /milestone_records[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have milestone_id FK to milestones", () => {
    expect(sql).toMatch(
      /milestone_records[\s\S]*?milestone_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?milestones/i
    );
  });

  it("should have achieved boolean with default false", () => {
    expect(sql).toMatch(
      /milestone_records[\s\S]*?achieved\s+boolean[\s\S]*?DEFAULT\s+false/i
    );
  });
});

describe("growth_measurements table", () => {
  it("should have child_id FK with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /growth_measurements[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have measured_date as NOT NULL date", () => {
    expect(sql).toMatch(
      /growth_measurements[\s\S]*?measured_date\s+date\s+NOT\s+NULL/i
    );
  });

  it("should have measurement columns: height_cm, weight_kg, head_circumference_cm, bmi", () => {
    expect(sql).toMatch(/growth_measurements[\s\S]*?height_cm\s+numeric/i);
    expect(sql).toMatch(/growth_measurements[\s\S]*?weight_kg\s+numeric/i);
    expect(sql).toMatch(
      /growth_measurements[\s\S]*?head_circumference_cm\s+numeric/i
    );
    expect(sql).toMatch(/growth_measurements[\s\S]*?bmi\s+numeric/i);
  });

  it("should have optional u_exam_record_id FK", () => {
    expect(sql).toMatch(
      /growth_measurements[\s\S]*?u_exam_record_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?u_exam_records/i
    );
  });
});

describe("ai_insights table", () => {
  it("should have child_id FK with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /ai_insights[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have insight_type NOT NULL", () => {
    expect(sql).toMatch(
      /ai_insights[\s\S]*?insight_type\s+text\s+NOT\s+NULL/i
    );
  });

  it("should have content as jsonb NOT NULL", () => {
    expect(sql).toMatch(
      /ai_insights[\s\S]*?content\s+jsonb\s+NOT\s+NULL/i
    );
  });

  it("should have language with default 'en'", () => {
    expect(sql).toMatch(
      /ai_insights[\s\S]*?language\s+text[\s\S]*?DEFAULT\s+'en'/i
    );
  });

  it("should have expires_at as timestamptz NOT NULL", () => {
    expect(sql).toMatch(
      /ai_insights[\s\S]*?expires_at\s+timestamptz\s+NOT\s+NULL/i
    );
  });
});

describe("document_scans table", () => {
  it("should have child_id FK with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /document_scans[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have user_id FK to auth.users NOT NULL", () => {
    expect(sql).toMatch(
      /document_scans[\s\S]*?user_id\s+uuid[\s\S]*?NOT\s+NULL[\s\S]*?REFERENCES\s+auth\.users/i
    );
  });

  it("should have document_type with check constraint", () => {
    expect(sql).toMatch(
      /document_scans[\s\S]*?CHECK[\s\S]*?document_type[\s\S]*?IN\s*\([^)]*'u_heft'[^)]*'impfpass'[^)]*'growth_chart'[^)]*\)/i
    );
  });

  it("should have status with check constraint and default 'pending'", () => {
    expect(sql).toMatch(
      /document_scans[\s\S]*?status\s+text[\s\S]*?DEFAULT\s+'pending'/i
    );
    expect(sql).toMatch(
      /document_scans[\s\S]*?CHECK[\s\S]*?status[\s\S]*?IN\s*\([^)]*'pending'[^)]*'processing'[^)]*'completed'[^)]*'failed'[^)]*\)/i
    );
  });

  it("should have extraction_result as jsonb", () => {
    expect(sql).toMatch(
      /document_scans[\s\S]*?extraction_result\s+jsonb/i
    );
  });
});

describe("appointments table", () => {
  it("should have child_id FK with ON DELETE CASCADE", () => {
    expect(sql).toMatch(
      /appointments[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have title NOT NULL", () => {
    expect(sql).toMatch(
      /appointments[\s\S]*?title\s+text\s+NOT\s+NULL/i
    );
  });

  it("should have appointment_date as timestamptz NOT NULL", () => {
    expect(sql).toMatch(
      /appointments[\s\S]*?appointment_date\s+timestamptz\s+NOT\s+NULL/i
    );
  });

  it("should have optional FKs to u_exam_records and vaccination_records", () => {
    expect(sql).toMatch(
      /appointments[\s\S]*?u_exam_record_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?u_exam_records/i
    );
    expect(sql).toMatch(
      /appointments[\s\S]*?vaccination_record_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?vaccination_records/i
    );
  });
});

describe("reminders table", () => {
  it("should have user_id FK to auth.users NOT NULL", () => {
    expect(sql).toMatch(
      /reminders[\s\S]*?user_id\s+uuid[\s\S]*?NOT\s+NULL[\s\S]*?REFERENCES\s+auth\.users/i
    );
  });

  it("should have child_id FK with ON DELETE CASCADE (nullable)", () => {
    expect(sql).toMatch(
      /reminders[\s\S]*?child_id\s+uuid[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should have reminder_type with check constraint", () => {
    expect(sql).toMatch(
      /reminders[\s\S]*?CHECK[\s\S]*?reminder_type[\s\S]*?IN\s*\([^)]*'u_exam'[^)]*'vaccination'[^)]*'masernschutz'[^)]*'overdue'[^)]*\)/i
    );
  });

  it("should have scheduled_send_at as timestamptz NOT NULL", () => {
    expect(sql).toMatch(
      /reminders[\s\S]*?scheduled_send_at\s+timestamptz\s+NOT\s+NULL/i
    );
  });

  it("should have sent_at as nullable timestamptz", () => {
    expect(sql).toMatch(/reminders[\s\S]*?sent_at\s+timestamptz/i);
  });
});

describe("Row Level Security", () => {
  const allTables = [
    "user_profiles",
    "children",
    "pediatricians",
    "u_exams",
    "u_exam_records",
    "screenings",
    "vaccines",
    "vaccine_schedule_rules",
    "vaccination_records",
    "milestones",
    "milestone_records",
    "growth_measurements",
    "ai_insights",
    "document_scans",
    "appointments",
    "reminders",
  ];

  it.each(allTables)(
    "should enable RLS on %s",
    (table) => {
      const pattern = new RegExp(
        `ALTER\\s+TABLE\\s+(public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
        "i"
      );
      expect(sql).toMatch(pattern);
    }
  );

  it("should have RLS policies for user_profiles", () => {
    expect(sql).toMatch(/CREATE\s+POLICY[\s\S]*?ON\s+(public\.)?user_profiles/i);
  });

  it("should have RLS policies for children", () => {
    expect(sql).toMatch(/CREATE\s+POLICY[\s\S]*?ON\s+(public\.)?children/i);
  });

  it("should have RLS policies for pediatricians", () => {
    expect(sql).toMatch(/CREATE\s+POLICY[\s\S]*?ON\s+(public\.)?pediatricians/i);
  });

  it("should have public read policy for reference tables (u_exams)", () => {
    // Reference tables should allow public SELECT
    expect(sql).toMatch(
      /CREATE\s+POLICY[\s\S]*?ON\s+(public\.)?u_exams[\s\S]*?FOR\s+SELECT[\s\S]*?USING\s*\(\s*true\s*\)/i
    );
  });

  it("should have public read policy for reference tables (vaccines)", () => {
    expect(sql).toMatch(
      /CREATE\s+POLICY[\s\S]*?ON\s+(public\.)?vaccines[\s\S]*?FOR\s+SELECT[\s\S]*?USING\s*\(\s*true\s*\)/i
    );
  });

  it("should have public read policy for reference tables (milestones)", () => {
    expect(sql).toMatch(
      /CREATE\s+POLICY[\s\S]*?ON\s+(public\.)?milestones[\s\S]*?FOR\s+SELECT[\s\S]*?USING\s*\(\s*true\s*\)/i
    );
  });

  it("should have public read policy for reference tables (vaccine_schedule_rules)", () => {
    expect(sql).toMatch(
      /CREATE\s+POLICY[\s\S]*?ON\s+(public\.)?vaccine_schedule_rules[\s\S]*?FOR\s+SELECT[\s\S]*?USING\s*\(\s*true\s*\)/i
    );
  });

  it("should use auth.uid() in user-scoped policies", () => {
    // Policies should reference auth.uid() for user isolation
    expect(sql).toMatch(/auth\.uid\(\)/i);
  });
});

describe("Cascade deletes", () => {
  it("should cascade delete u_exam_records when child is deleted", () => {
    expect(sql).toMatch(
      /u_exam_records[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete screenings when u_exam_record is deleted", () => {
    expect(sql).toMatch(
      /screenings[\s\S]*?u_exam_record_id[\s\S]*?REFERENCES[\s\S]*?u_exam_records[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete vaccination_records when child is deleted", () => {
    expect(sql).toMatch(
      /vaccination_records[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete milestone_records when child is deleted", () => {
    expect(sql).toMatch(
      /milestone_records[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete growth_measurements when child is deleted", () => {
    expect(sql).toMatch(
      /growth_measurements[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete ai_insights when child is deleted", () => {
    expect(sql).toMatch(
      /ai_insights[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete document_scans when child is deleted", () => {
    expect(sql).toMatch(
      /document_scans[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete appointments when child is deleted", () => {
    expect(sql).toMatch(
      /appointments[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });

  it("should cascade delete reminders when child is deleted", () => {
    expect(sql).toMatch(
      /reminders[\s\S]*?child_id[\s\S]*?REFERENCES[\s\S]*?children[\s\S]*?ON\s+DELETE\s+CASCADE/i
    );
  });
});

describe("Indexes", () => {
  it("should create index on children(user_id)", () => {
    expect(sql).toMatch(/CREATE\s+INDEX[\s\S]*?children[\s\S]*?user_id/i);
  });

  it("should create index on u_exam_records(child_id)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?u_exam_records[\s\S]*?child_id/i
    );
  });

  it("should create index on u_exam_records(status)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?u_exam_records[\s\S]*?status/i
    );
  });

  it("should create index on vaccination_records(child_id)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?vaccination_records[\s\S]*?child_id/i
    );
  });

  it("should create index on vaccination_records(status)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?vaccination_records[\s\S]*?status/i
    );
  });

  it("should create index on milestone_records(child_id)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?milestone_records[\s\S]*?child_id/i
    );
  });

  it("should create index on growth_measurements(child_id)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?growth_measurements[\s\S]*?child_id/i
    );
  });

  it("should create index on growth_measurements(measured_date)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?growth_measurements[\s\S]*?measured_date/i
    );
  });

  it("should create index on ai_insights(child_id)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?ai_insights[\s\S]*?child_id/i
    );
  });

  it("should create index on ai_insights(expires_at)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?ai_insights[\s\S]*?expires_at/i
    );
  });

  it("should create index on appointments(child_id)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?appointments[\s\S]*?child_id/i
    );
  });

  it("should create index on appointments(appointment_date)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?appointments[\s\S]*?appointment_date/i
    );
  });

  it("should create index on reminders(user_id)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?reminders[\s\S]*?user_id/i
    );
  });

  it("should create index on reminders(scheduled_send_at)", () => {
    expect(sql).toMatch(
      /CREATE\s+INDEX[\s\S]*?reminders[\s\S]*?scheduled_send_at/i
    );
  });
});

describe("Updated_at trigger", () => {
  it("should create a trigger function for auto-updating updated_at", () => {
    expect(sql).toMatch(
      /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION[\s\S]*?updated_at/i
    );
  });

  it("should use NEW.updated_at = NOW() in the trigger function", () => {
    expect(sql).toMatch(/NEW\.updated_at\s*=\s*(NOW\(\)|CURRENT_TIMESTAMP)/i);
  });

  it("should create triggers on tables with updated_at columns", () => {
    const tablesWithUpdatedAt = [
      "user_profiles",
      "children",
      "pediatricians",
      "u_exam_records",
      "vaccination_records",
      "milestone_records",
      "growth_measurements",
      "document_scans",
      "appointments",
    ];

    for (const table of tablesWithUpdatedAt) {
      const pattern = new RegExp(
        `CREATE\\s+TRIGGER[\\s\\S]*?${table}`,
        "i"
      );
      expect(sql).toMatch(pattern);
    }
  });
});

describe("Check constraints", () => {
  it("should have check constraint on user_profiles.language", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*language\s+IN\s*\(\s*'en'\s*,\s*'de'\s*\)\s*\)/i
    );
  });

  it("should have check constraint on children.gender", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*gender\s+IN\s*\(\s*'male'\s*,\s*'female'\s*,\s*'diverse'\s*\)\s*\)/i
    );
  });

  it("should have check constraint on u_exam_records.status", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*status\s+IN\s*\([^)]*'scheduled'[^)]*'upcoming'[^)]*'completed'[^)]*'skipped'[^)]*'overdue'[^)]*\)\s*\)/i
    );
  });

  it("should have check constraint on vaccination_records.status", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*status\s+IN\s*\([^)]*'scheduled'[^)]*'upcoming'[^)]*'administered'[^)]*'skipped'[^)]*'overdue'[^)]*\)\s*\)/i
    );
  });

  it("should have check constraint on milestones.category", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*category\s+IN\s*\([^)]*'motor'[^)]*'language'[^)]*'social_cognitive'[^)]*\)\s*\)/i
    );
  });

  it("should have check constraint on document_scans.document_type", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*document_type\s+IN\s*\([^)]*'u_heft'[^)]*'impfpass'[^)]*'growth_chart'[^)]*\)\s*\)/i
    );
  });

  it("should have check constraint on document_scans.status", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*status\s+IN\s*\([^)]*'pending'[^)]*'processing'[^)]*'completed'[^)]*'failed'[^)]*\)\s*\)/i
    );
  });

  it("should have check constraint on reminders.reminder_type", () => {
    expect(sql).toMatch(
      /CHECK\s*\(\s*reminder_type\s+IN\s*\([^)]*'u_exam'[^)]*'vaccination'[^)]*'masernschutz'[^)]*'overdue'[^)]*\)\s*\)/i
    );
  });
});
