-- =============================================================================
-- KidsVax Initial Database Schema
-- =============================================================================
-- Digitized Gelbes Heft (U-Heft) and Impfpass for German parents
-- All dates stored in UTC, displayed in Europe/Berlin timezone
-- RLS enabled on all tables for DSGVO/GDPR compliance
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Trigger function for auto-updating updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. user_profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  language      text        NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'de')),
  bundesland    text,
  reminder_preferences jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. children
-- ---------------------------------------------------------------------------
CREATE TABLE public.children (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text    NOT NULL,
  date_of_birth   date    NOT NULL,
  gender          text    NOT NULL
    CHECK (gender IN ('male', 'female', 'diverse')),
  is_premature    boolean NOT NULL DEFAULT false,
  photo_url       text,
  allergies       text,
  notes           text,
  blood_type      text,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. pediatricians
-- ---------------------------------------------------------------------------
CREATE TABLE public.pediatricians (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text    NOT NULL,
  practice_name   text,
  phone           text,
  address         text,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 4. u_exams (reference data - static)
-- ---------------------------------------------------------------------------
CREATE TABLE public.u_exams (
  id                      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    text    NOT NULL UNIQUE,
  category                text    NOT NULL,
  recommended_age_months  integer NOT NULL,
  tolerance_from_months   numeric NOT NULL,
  tolerance_to_months     numeric NOT NULL,
  description_en          text    NOT NULL,
  description_de          text    NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. u_exam_records (per-child)
-- ---------------------------------------------------------------------------
CREATE TABLE public.u_exam_records (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            uuid    NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  u_exam_id           uuid    NOT NULL REFERENCES public.u_exams(id),
  status              text    NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'upcoming', 'completed', 'skipped', 'overdue')),
  scheduled_date      date    NOT NULL,
  completed_date      date,
  physician_name      text,
  findings_notes      text,
  parent_observations text,
  referrals           text,
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 6. screenings (linked to u_exam_records)
-- ---------------------------------------------------------------------------
CREATE TABLE public.screenings (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  u_exam_record_id    uuid    NOT NULL REFERENCES public.u_exam_records(id) ON DELETE CASCADE,
  screening_type      text    NOT NULL,
  result              text,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 7. vaccines (reference data - static)
-- ---------------------------------------------------------------------------
CREATE TABLE public.vaccines (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en             text    NOT NULL,
  name_de             text    NOT NULL,
  abbreviation        text    NOT NULL,
  protects_against_en text    NOT NULL,
  protects_against_de text    NOT NULL,
  total_doses         integer NOT NULL,
  is_mandatory        boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 8. vaccine_schedule_rules (reference data - static)
-- ---------------------------------------------------------------------------
CREATE TABLE public.vaccine_schedule_rules (
  id                      uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine_id              uuid    NOT NULL REFERENCES public.vaccines(id),
  dose_number             integer NOT NULL,
  recommended_age_months  numeric NOT NULL,
  min_age_months          numeric,
  min_interval_days       integer,
  premature_age_months    numeric,
  created_at              timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 9. vaccination_records (per-child)
-- ---------------------------------------------------------------------------
CREATE TABLE public.vaccination_records (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            uuid    NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  vaccine_id          uuid    NOT NULL REFERENCES public.vaccines(id),
  dose_number         integer NOT NULL,
  status              text    NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'upcoming', 'administered', 'skipped', 'overdue')),
  scheduled_date      date    NOT NULL,
  administered_date   date,
  physician_name      text,
  product_name        text,
  lot_number          text,
  injection_site      text,
  skip_reason         text,
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 10. milestones (reference data, linked to u_exams)
-- ---------------------------------------------------------------------------
CREATE TABLE public.milestones (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  u_exam_id       uuid    NOT NULL REFERENCES public.u_exams(id),
  category        text    NOT NULL
    CHECK (category IN ('motor', 'language', 'social_cognitive')),
  description_en  text    NOT NULL,
  description_de  text    NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 11. milestone_records (per-child)
-- ---------------------------------------------------------------------------
CREATE TABLE public.milestone_records (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        uuid    NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  milestone_id    uuid    NOT NULL REFERENCES public.milestones(id),
  achieved        boolean NOT NULL DEFAULT false,
  observed_date   date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 12. growth_measurements
-- ---------------------------------------------------------------------------
CREATE TABLE public.growth_measurements (
  id                    uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id              uuid    NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  measured_date         date    NOT NULL,
  height_cm             numeric,
  weight_kg             numeric,
  head_circumference_cm numeric,
  bmi                   numeric,
  u_exam_record_id      uuid    REFERENCES public.u_exam_records(id),
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 13. ai_insights
-- ---------------------------------------------------------------------------
CREATE TABLE public.ai_insights (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  insight_type    text        NOT NULL,
  content         jsonb       NOT NULL,
  language        text        NOT NULL DEFAULT 'en',
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 14. document_scans
-- ---------------------------------------------------------------------------
CREATE TABLE public.document_scans (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id            uuid    NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id             uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type       text    NOT NULL
    CHECK (document_type IN ('u_heft', 'impfpass', 'growth_chart')),
  extraction_result   jsonb,
  status              text    NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 15. appointments
-- ---------------------------------------------------------------------------
CREATE TABLE public.appointments (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id                uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  title                   text        NOT NULL,
  appointment_date        timestamptz NOT NULL,
  u_exam_record_id        uuid        REFERENCES public.u_exam_records(id),
  vaccination_record_id   uuid        REFERENCES public.vaccination_records(id),
  physician_name          text,
  location                text,
  notes                   text,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 16. reminders
-- ---------------------------------------------------------------------------
CREATE TABLE public.reminders (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id            uuid        REFERENCES public.children(id) ON DELETE CASCADE,
  reminder_type       text        NOT NULL
    CHECK (reminder_type IN ('u_exam', 'vaccination', 'masernschutz', 'overdue')),
  reference_id        uuid,
  scheduled_send_at   timestamptz NOT NULL,
  sent_at             timestamptz,
  email_subject       text,
  email_body          text,
  created_at          timestamptz NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on ALL tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pediatricians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.u_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.u_exam_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_schedule_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- user_profiles: Users can only read/update their own profile
-- ---------------------------------------------------------------------------
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- children: Users can only CRUD their own children
-- ---------------------------------------------------------------------------
CREATE POLICY "children_select_own"
  ON public.children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "children_insert_own"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "children_update_own"
  ON public.children FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "children_delete_own"
  ON public.children FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- pediatricians: Users can only CRUD their own pediatricians
-- ---------------------------------------------------------------------------
CREATE POLICY "pediatricians_select_own"
  ON public.pediatricians FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "pediatricians_insert_own"
  ON public.pediatricians FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pediatricians_update_own"
  ON public.pediatricians FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pediatricians_delete_own"
  ON public.pediatricians FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- u_exams: Public read (reference data), no insert/update/delete by users
-- ---------------------------------------------------------------------------
CREATE POLICY "u_exams_public_read"
  ON public.u_exams FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- u_exam_records: Users can CRUD records for their own children
-- ---------------------------------------------------------------------------
CREATE POLICY "u_exam_records_select_own"
  ON public.u_exam_records FOR SELECT
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "u_exam_records_insert_own"
  ON public.u_exam_records FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "u_exam_records_update_own"
  ON public.u_exam_records FOR UPDATE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  )
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "u_exam_records_delete_own"
  ON public.u_exam_records FOR DELETE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- screenings: Same as u_exam_records (join through u_exam_records -> children)
-- ---------------------------------------------------------------------------
CREATE POLICY "screenings_select_own"
  ON public.screenings FOR SELECT
  USING (
    u_exam_record_id IN (
      SELECT uer.id FROM public.u_exam_records uer
      JOIN public.children c ON c.id = uer.child_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "screenings_insert_own"
  ON public.screenings FOR INSERT
  WITH CHECK (
    u_exam_record_id IN (
      SELECT uer.id FROM public.u_exam_records uer
      JOIN public.children c ON c.id = uer.child_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "screenings_update_own"
  ON public.screenings FOR UPDATE
  USING (
    u_exam_record_id IN (
      SELECT uer.id FROM public.u_exam_records uer
      JOIN public.children c ON c.id = uer.child_id
      WHERE c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    u_exam_record_id IN (
      SELECT uer.id FROM public.u_exam_records uer
      JOIN public.children c ON c.id = uer.child_id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "screenings_delete_own"
  ON public.screenings FOR DELETE
  USING (
    u_exam_record_id IN (
      SELECT uer.id FROM public.u_exam_records uer
      JOIN public.children c ON c.id = uer.child_id
      WHERE c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- vaccines: Public read (reference data), no insert/update/delete by users
-- ---------------------------------------------------------------------------
CREATE POLICY "vaccines_public_read"
  ON public.vaccines FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- vaccine_schedule_rules: Public read (reference data)
-- ---------------------------------------------------------------------------
CREATE POLICY "vaccine_schedule_rules_public_read"
  ON public.vaccine_schedule_rules FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- vaccination_records: Users can CRUD records for their own children
-- ---------------------------------------------------------------------------
CREATE POLICY "vaccination_records_select_own"
  ON public.vaccination_records FOR SELECT
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "vaccination_records_insert_own"
  ON public.vaccination_records FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "vaccination_records_update_own"
  ON public.vaccination_records FOR UPDATE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  )
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "vaccination_records_delete_own"
  ON public.vaccination_records FOR DELETE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- milestones: Public read (reference data)
-- ---------------------------------------------------------------------------
CREATE POLICY "milestones_public_read"
  ON public.milestones FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- milestone_records: Users can CRUD records for their own children
-- ---------------------------------------------------------------------------
CREATE POLICY "milestone_records_select_own"
  ON public.milestone_records FOR SELECT
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "milestone_records_insert_own"
  ON public.milestone_records FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "milestone_records_update_own"
  ON public.milestone_records FOR UPDATE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  )
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "milestone_records_delete_own"
  ON public.milestone_records FOR DELETE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- growth_measurements: Users can CRUD measurements for their own children
-- ---------------------------------------------------------------------------
CREATE POLICY "growth_measurements_select_own"
  ON public.growth_measurements FOR SELECT
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "growth_measurements_insert_own"
  ON public.growth_measurements FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "growth_measurements_update_own"
  ON public.growth_measurements FOR UPDATE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  )
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "growth_measurements_delete_own"
  ON public.growth_measurements FOR DELETE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- ai_insights: Users read their own children's insights
-- ---------------------------------------------------------------------------
CREATE POLICY "ai_insights_select_own"
  ON public.ai_insights FOR SELECT
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "ai_insights_insert_own"
  ON public.ai_insights FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "ai_insights_delete_own"
  ON public.ai_insights FOR DELETE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- document_scans: Users CRUD their own scans
-- ---------------------------------------------------------------------------
CREATE POLICY "document_scans_select_own"
  ON public.document_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "document_scans_insert_own"
  ON public.document_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "document_scans_update_own"
  ON public.document_scans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "document_scans_delete_own"
  ON public.document_scans FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- appointments: Users CRUD for their own children
-- ---------------------------------------------------------------------------
CREATE POLICY "appointments_select_own"
  ON public.appointments FOR SELECT
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "appointments_insert_own"
  ON public.appointments FOR INSERT
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "appointments_update_own"
  ON public.appointments FOR UPDATE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  )
  WITH CHECK (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

CREATE POLICY "appointments_delete_own"
  ON public.appointments FOR DELETE
  USING (
    child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- reminders: Users CRUD their own reminders
-- ---------------------------------------------------------------------------
CREATE POLICY "reminders_select_own"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reminders_insert_own"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_update_own"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reminders_delete_own"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================================
-- INDEXES
-- =============================================================================

-- children
CREATE INDEX idx_children_user_id ON public.children(user_id);

-- u_exam_records
CREATE INDEX idx_u_exam_records_child_id ON public.u_exam_records(child_id);
CREATE INDEX idx_u_exam_records_status ON public.u_exam_records(status);

-- vaccination_records
CREATE INDEX idx_vaccination_records_child_id ON public.vaccination_records(child_id);
CREATE INDEX idx_vaccination_records_status ON public.vaccination_records(status);

-- milestone_records
CREATE INDEX idx_milestone_records_child_id ON public.milestone_records(child_id);

-- growth_measurements
CREATE INDEX idx_growth_measurements_child_id ON public.growth_measurements(child_id);
CREATE INDEX idx_growth_measurements_measured_date ON public.growth_measurements(measured_date);

-- ai_insights
CREATE INDEX idx_ai_insights_child_id ON public.ai_insights(child_id);
CREATE INDEX idx_ai_insights_expires_at ON public.ai_insights(expires_at);

-- appointments
CREATE INDEX idx_appointments_child_id ON public.appointments(child_id);
CREATE INDEX idx_appointments_appointment_date ON public.appointments(appointment_date);

-- reminders
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_scheduled_send_at ON public.reminders(scheduled_send_at);


-- =============================================================================
-- TRIGGERS (auto-update updated_at)
-- =============================================================================

CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_children
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_pediatricians
  BEFORE UPDATE ON public.pediatricians
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_u_exam_records
  BEFORE UPDATE ON public.u_exam_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_vaccination_records
  BEFORE UPDATE ON public.vaccination_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_milestone_records
  BEFORE UPDATE ON public.milestone_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_growth_measurements
  BEFORE UPDATE ON public.growth_measurements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_document_scans
  BEFORE UPDATE ON public.document_scans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_appointments
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
