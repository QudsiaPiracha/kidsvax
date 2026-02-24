# Active Todos

Current work in progress. Each todo follows TDD: write tests first (RED), implement (GREEN), refactor.

---

## TODO-01: Project Scaffolding & Configuration

**Priority:** P0 (blocker for all other work)
**Estimated scope:** Setup files only, no business logic

### Description
Initialize the Next.js project with TypeScript, Tailwind CSS, Supabase client, next-intl, Claude Agent SDK, Resend, and testing infrastructure. Configure ESLint, Prettier, Jest, and the Tailwind design tokens (colors, fonts) from the spec.

### Acceptance Criteria
- [ ] `npx create-next-app` with App Router, TypeScript strict, Tailwind
- [ ] Tailwind config has custom color palette from spec (warm white, sage green, terracotta, amber, etc.)
- [ ] `@supabase/supabase-js` and `@supabase/ssr` installed and configured
- [ ] `@anthropic-ai/claude-agent-sdk` installed
- [ ] `resend` package installed
- [ ] `next-intl` installed with EN (default) and DE message files
- [ ] Jest + React Testing Library configured and a smoke test passes
- [ ] ESLint + Prettier configured
- [ ] `.env.example` values load correctly via `process.env`
- [ ] Folder structure: `app/`, `lib/`, `components/`, `messages/`, `__tests__/`

### Test Suite

```
__tests__/setup/
├── config.test.ts
├── i18n.test.ts
└── tailwind.test.ts
```

**config.test.ts**
```
- it("should have TypeScript strict mode enabled in tsconfig")
- it("should have all required env vars defined in .env.example")
- it("should export Supabase client from lib/supabase")
- it("should export Anthropic agent helpers from lib/ai")
- it("should export Resend client from lib/email")
```

**i18n.test.ts**
```
- it("should have EN message file with all required keys")
- it("should have DE message file with all required keys")
- it("should have identical key structure in EN and DE files")
- it("should default to EN locale")
```

**tailwind.test.ts**
```
- it("should define custom color 'sage' in tailwind config")
- it("should define custom color 'terracotta' in tailwind config")
- it("should define custom color 'warm-white' in tailwind config")
- it("should define custom color 'warm-amber' in tailwind config")
- it("should use Inter as default sans font")
```

---

## TODO-02: Database Schema & Migrations

**Priority:** P0 (blocker for all data features)
**Depends on:** TODO-01

### Description
Create Supabase migrations for all tables defined in the data model: User (extends auth.users), Child, Pediatrician, UExam, UExamRecord, Screening, Vaccine, VaccineScheduleRule, VaccinationRecord, Milestone, MilestoneRecord, GrowthMeasurement, AIInsight, DocumentScan, Appointment, Reminder. Set up Row Level Security (RLS) on all tables.

### Acceptance Criteria
- [ ] All 16 tables created with correct column types, FKs, and constraints
- [ ] RLS enabled on every table: users can only access their own data
- [ ] Enum types created for all status fields
- [ ] Indexes on frequently queried columns (child_id, user_id, status, scheduled_date)
- [ ] Cascade deletes: deleting a child deletes all related records
- [ ] `created_at` and `updated_at` auto-populated via defaults/triggers

### Test Suite

```
__tests__/db/
├── schema.test.ts
├── rls.test.ts
└── cascade.test.ts
```

**schema.test.ts**
```
- it("should create the children table with all required columns")
- it("should create the pediatricians table with all required columns")
- it("should create the u_exams table with all required columns")
- it("should create the u_exam_records table with correct FK to children and u_exams")
- it("should create the screenings table with correct FK to u_exam_records")
- it("should create the vaccines table with all required columns")
- it("should create the vaccine_schedule_rules table with correct FK to vaccines")
- it("should create the vaccination_records table with correct FKs")
- it("should create the milestones table with correct FK to u_exams")
- it("should create the milestone_records table with correct FKs")
- it("should create the growth_measurements table with correct FKs")
- it("should create the ai_insights table with correct FK to children")
- it("should create the document_scans table with correct FKs")
- it("should create the appointments table with correct FKs")
- it("should create the reminders table with correct FK to users")
- it("should enforce NOT NULL on required fields (child.name, child.date_of_birth)")
- it("should default language to 'en' on user profiles")
- it("should default is_premature to false on children")
```

**rls.test.ts**
```
- it("should allow user to read their own children")
- it("should deny user from reading another user's children")
- it("should allow user to insert a child under their own user_id")
- it("should deny user from inserting a child under another user_id")
- it("should allow user to read vaccination records for their own children")
- it("should deny user from reading vaccination records for another user's children")
- it("should allow user to read/write their own reminders")
- it("should deny user from accessing another user's reminders")
```

**cascade.test.ts**
```
- it("should delete all u_exam_records when a child is deleted")
- it("should delete all vaccination_records when a child is deleted")
- it("should delete all growth_measurements when a child is deleted")
- it("should delete all milestone_records when a child is deleted")
- it("should delete all ai_insights when a child is deleted")
- it("should delete all appointments when a child is deleted")
- it("should delete all screenings when a child is deleted")
```

---

## TODO-03: Seed Reference Data (U-Exams, Vaccines, Milestones)

**Priority:** P0 (blocker for schedule generation)
**Depends on:** TODO-02

### Description
Create seed data for all static reference tables: 14 U-Untersuchungen (U1-U9, U10-U11, J1-J2), 6 dental exams (Z1-Z6), all STIKO vaccines with schedule rules (including premature adjustments), and developmental milestones linked to each U-exam. All data bilingual (EN + DE).

### Acceptance Criteria
- [ ] 20 U-exam entries (U1-U9, U10, U11, J1, J2, Z1-Z6) with correct age windows, tolerance windows, descriptions in EN and DE
- [ ] 11 vaccine entries with full names in EN and DE, protects_against, dose counts, mandatory flag
- [ ] ~30 vaccine schedule rules with recommended ages, min ages, min intervals, premature adjustments
- [ ] ~40 milestone entries linked to U-exams with categories (motor, language, social_cognitive), descriptions in EN and DE
- [ ] Seed script is idempotent (can run multiple times safely)

### Test Suite

```
__tests__/db/
└── seed.test.ts
```

**seed.test.ts**
```
- it("should seed exactly 14 U/J-exam entries (U1-U9, U10, U11, J1, J2)")
- it("should seed exactly 6 Z-exam entries (Z1-Z6)")
- it("should have U3 with recommended_age_months=1 and tolerance 0.75-2")
- it("should have U6 with recommended_age_months between 10-12 and tolerance 9-14")
- it("should have U9 with recommended_age_months between 60-64 and tolerance 58-66")
- it("should seed all 11 STIKO vaccines")
- it("should mark only Masern-containing vaccines as is_mandatory=true")
- it("should have DTaP-IPV-Hib-HepB with 3 doses at months 2, 4, 11")
- it("should have MMR with 2 doses at months 11, 15")
- it("should have premature_age_months for hexavalent vaccine (2, 3, 4, 11)")
- it("should have Rotavirus with min_interval_days between doses")
- it("should seed milestones for U3 through U9")
- it("should have motor, language, and social_cognitive milestones for each exam")
- it("should have all milestone descriptions in both EN and DE")
- it("should have all U-exam descriptions in both EN and DE")
- it("should have all vaccine names in both EN and DE")
- it("should be idempotent -- running seed twice produces no duplicates")
```

---

## TODO-04: Authentication (Email + Magic Link)

**Priority:** P0 (blocker for all user features)
**Depends on:** TODO-01

### Description
Implement email-based authentication using Supabase Auth: signup, login, logout, password reset, and magic link. Create auth pages (login, signup, forgot password), middleware for protected routes, and user profile table that extends auth.users.

### Acceptance Criteria
- [ ] Signup with email + password creates account and user profile row
- [ ] Login with email + password returns session
- [ ] Magic link login sends email and authenticates on click
- [ ] Password reset sends email and allows password change
- [ ] Logout clears session
- [ ] Middleware redirects unauthenticated users to /login
- [ ] Middleware redirects authenticated users from /login to /dashboard
- [ ] User profile stores language preference and bundesland

### Test Suite

```
__tests__/auth/
├── signup.test.ts
├── login.test.ts
├── logout.test.ts
├── middleware.test.ts
└── profile.test.ts
```

**signup.test.ts**
```
- it("should create a new user with valid email and password")
- it("should reject signup with invalid email format")
- it("should reject signup with password shorter than 8 characters")
- it("should reject signup with already registered email")
- it("should create a user profile row with default language 'en'")
- it("should create a user profile row with null bundesland")
```

**login.test.ts**
```
- it("should return session for valid email + password")
- it("should reject login with wrong password")
- it("should reject login with non-existent email")
- it("should send magic link email for valid email")
- it("should authenticate user when magic link token is valid")
- it("should reject expired magic link token")
```

**logout.test.ts**
```
- it("should clear the session on logout")
- it("should redirect to /login after logout")
```

**middleware.test.ts**
```
- it("should redirect unauthenticated user from /dashboard to /login")
- it("should redirect unauthenticated user from /api/children to 401")
- it("should allow authenticated user to access /dashboard")
- it("should redirect authenticated user from /login to /dashboard")
- it("should allow unauthenticated user to access /login")
- it("should allow unauthenticated user to access /signup")
```

**profile.test.ts**
```
- it("should return user profile for authenticated user")
- it("should update language preference to 'de'")
- it("should update bundesland to 'Bayern'")
- it("should update display name")
```

---

## TODO-05: Child CRUD & Profile Management

**Priority:** P0 (blocker for all child-specific features)
**Depends on:** TODO-02, TODO-04

### Description
Implement API routes and UI for creating, reading, updating, and deleting children. When a child is created, auto-generate their U-exam schedule and vaccination schedule (TODO-06). Support multiple children per user.

### Acceptance Criteria
- [ ] `POST /api/children` creates child with name, DOB, gender, is_premature
- [ ] `GET /api/children` returns all children for authenticated user
- [ ] `GET /api/children/[id]` returns child with profile data
- [ ] `PUT /api/children/[id]` updates child profile fields
- [ ] `DELETE /api/children/[id]` deletes child and all related records
- [ ] Validation: name required, DOB required and not in the future, gender required
- [ ] Photo upload stores in Supabase Storage and saves URL
- [ ] Child can be linked to a pediatrician

### Test Suite

```
__tests__/api/
└── children.test.ts

__tests__/components/
└── child-form.test.tsx
```

**children.test.ts**
```
- it("POST /api/children should create a child with valid data")
- it("POST /api/children should reject missing name")
- it("POST /api/children should reject missing date_of_birth")
- it("POST /api/children should reject DOB in the future")
- it("POST /api/children should default is_premature to false")
- it("POST /api/children should accept optional allergies and notes")
- it("GET /api/children should return empty array for new user")
- it("GET /api/children should return all children for the user")
- it("GET /api/children should not return another user's children")
- it("GET /api/children/[id] should return child with profile data")
- it("GET /api/children/[id] should return 404 for non-existent child")
- it("GET /api/children/[id] should return 403 for another user's child")
- it("PUT /api/children/[id] should update name")
- it("PUT /api/children/[id] should update allergies")
- it("PUT /api/children/[id] should update is_premature flag")
- it("PUT /api/children/[id] should reject DOB in the future")
- it("DELETE /api/children/[id] should delete child and return 204")
- it("DELETE /api/children/[id] should cascade delete all related records")
- it("DELETE /api/children/[id] should return 403 for another user's child")
```

**child-form.test.tsx**
```
- it("should render name, DOB, and gender fields")
- it("should show validation error when name is empty on submit")
- it("should show validation error when DOB is empty on submit")
- it("should call onSubmit with correct data when form is valid")
- it("should show premature checkbox")
- it("should show optional allergies textarea")
- it("should pre-fill fields when editing an existing child")
```

---

## TODO-06: Schedule Generation Engine

**Priority:** P0 (core business logic)
**Depends on:** TODO-03, TODO-05

### Description
When a child is created (or DOB/premature flag is updated), auto-generate:
1. U-exam records (U1-U9) with calculated scheduled_date based on DOB + recommended_age_months
2. Vaccination records for all STIKO vaccines with calculated scheduled_date based on DOB + recommended_age_months
3. If premature: use premature_age_months for hexavalent vaccine (3+1 schedule)

This is pure business logic -- the most critical module. Dates must use exact month calculation.

### Acceptance Criteria
- [ ] Creating a child generates 9 U-exam records (U1-U9) with correct scheduled_dates
- [ ] Creating a child generates ~20 vaccination records for all STIKO doses
- [ ] Scheduled dates use exact month addition to DOB (not 30-day approximation)
- [ ] Premature flag triggers 3+1 hexavalent schedule (4 doses instead of 3)
- [ ] Non-premature uses standard 2+1 schedule (3 doses)
- [ ] Updating DOB recalculates all scheduled dates
- [ ] Updating is_premature recalculates hexavalent schedule
- [ ] Tolerance windows are stored on each record for display

### Test Suite

```
__tests__/lib/
└── schedule-engine.test.ts
```

**schedule-engine.test.ts**
```
# U-Exam Schedule Generation
- it("should generate 9 u_exam_records for a newborn (U1-U9)")
- it("should calculate U1 scheduled_date as the DOB itself")
- it("should calculate U2 scheduled_date as DOB + 3-10 days")
- it("should calculate U3 scheduled_date as DOB + 4-5 weeks")
- it("should calculate U4 scheduled_date as DOB + 3-4 months")
- it("should calculate U5 scheduled_date as DOB + 6-7 months")
- it("should calculate U6 scheduled_date as DOB + 10-12 months")
- it("should calculate U7 scheduled_date as DOB + 21-24 months")
- it("should calculate U7a scheduled_date as DOB + 34-36 months")
- it("should calculate U8 scheduled_date as DOB + 46-48 months")
- it("should calculate U9 scheduled_date as DOB + 60-64 months")
- it("should set all generated records to status 'scheduled'")
- it("should handle DOB on Feb 29 (leap year) correctly")
- it("should handle DOB at end of month (Jan 31 + 1 month = Feb 28)")

# Vaccination Schedule Generation
- it("should generate Rotavirus records with 2 doses at 6w and 2m")
- it("should generate DTaP-IPV-Hib-HepB with 3 doses at 2, 4, 11 months (standard)")
- it("should generate DTaP-IPV-Hib-HepB with 4 doses at 2, 3, 4, 11 months (premature)")
- it("should generate PCV with 3 doses at 2, 4, 11-14 months")
- it("should generate MenB with 3 doses at 2, 4, 12 months")
- it("should generate MenC with 1 dose at 12 months")
- it("should generate MMR with 2 doses at 11 and 15 months")
- it("should generate Varicella with 2 doses at 11 and 15 months")
- it("should generate Tdap-IPV booster at 5-6 years")
- it("should generate HPV with 2 doses at 9-14 years")
- it("should generate MenACWY with 1 dose at 12-14 years")
- it("should set all generated records to status 'scheduled'")

# Schedule Updates
- it("should recalculate all dates when DOB is updated")
- it("should switch from 2+1 to 3+1 hexavalent when premature flag is set")
- it("should switch from 3+1 to 2+1 hexavalent when premature flag is cleared")
- it("should not overwrite records that are already 'completed' when recalculating")

# Edge Cases
- it("should handle child born today (all future exams scheduled correctly)")
- it("should handle child born 5 years ago (past exams marked as scheduled, not missed)")
- it("should use exact month calculation (not 30-day approximation)")
- it("should calculate month difference correctly for DOB 2025-01-31 + 1 month = 2025-02-28")
```

---

## TODO-07: U-Exam Records API & Status Management

**Priority:** P1
**Depends on:** TODO-06

### Description
API routes for reading and updating U-exam records. Parents can mark exams as completed (with date, physician, notes) or skipped. Support parent observations and referrals.

### Acceptance Criteria
- [ ] `GET /api/children/[id]/u-exams` returns all U-exam records with status, dates, exam details
- [ ] `PUT /api/u-exam-records/[id]` updates status to completed with required fields (date, physician)
- [ ] `PUT /api/u-exam-records/[id]` updates status to skipped
- [ ] Parent observations can be added/updated before the exam
- [ ] Referrals can be recorded
- [ ] Records include Bundesland-specific mandatory/recommended badges

### Test Suite

```
__tests__/api/
└── u-exams.test.ts
```

**u-exams.test.ts**
```
- it("GET should return all U-exam records for a child ordered by scheduled_date")
- it("GET should include U-exam reference data (name, description, category)")
- it("GET should include status badge based on current date vs scheduled_date")
- it("GET should show 'mandatory' badge for Bayern user")
- it("GET should show 'recommended' badge for Berlin user")
- it("PUT should mark exam as completed with date and physician_name")
- it("PUT should reject completing without a date")
- it("PUT should reject completing without a physician_name")
- it("PUT should allow adding findings_notes")
- it("PUT should allow adding parent_observations")
- it("PUT should allow adding referrals")
- it("PUT should mark exam as skipped")
- it("PUT should reject marking a future exam as completed with past date")
- it("PUT should return 403 for another user's child's exam record")
```

---

## TODO-08: Vaccination Records API & Status Management

**Priority:** P1
**Depends on:** TODO-06

### Description
API routes for reading and updating vaccination records. Parents can mark vaccines as administered (with date, physician, product name, lot number, injection site) or skipped. Include Masernschutzgesetz compliance calculation.

### Acceptance Criteria
- [ ] `GET /api/children/[id]/vaccinations` returns all records with status and vaccine details
- [ ] `PUT /api/vaccination-records/[id]` updates status to administered with required fields
- [ ] Masernschutzgesetz compliance calculated: check if measles doses meet age requirements
- [ ] Mandatory flag shown for measles-related vaccines

### Test Suite

```
__tests__/api/
└── vaccinations.test.ts

__tests__/lib/
└── masern-compliance.test.ts
```

**vaccinations.test.ts**
```
- it("GET should return all vaccination records for a child ordered by scheduled_date")
- it("GET should include vaccine reference data (name, protects_against)")
- it("GET should include dose number and total doses")
- it("PUT should mark vaccination as administered with date and physician")
- it("PUT should accept optional product_name, lot_number, injection_site")
- it("PUT should reject administering without a date")
- it("PUT should mark vaccination as skipped with reason")
- it("PUT should return 403 for another user's child's vaccination")
```

**masern-compliance.test.ts**
```
- it("should return non-compliant for child age 1+ with 0 measles doses")
- it("should return compliant for child age 1-2 with 1 measles dose")
- it("should return non-compliant for child age 2+ with only 1 measles dose")
- it("should return compliant for child age 2+ with 2 measles doses")
- it("should return 'not yet required' for child under 1 year")
- it("should check both MMR dose 1 and dose 2 records")
- it("should only count doses with status 'administered'")
```

---

## TODO-09: Multi-Child Dashboard UI

**Priority:** P1
**Depends on:** TODO-05, TODO-07, TODO-08

### Description
Build the dashboard page showing all children as summary cards. Each card shows next upcoming item, overdue count, progress stats. Cards ordered by urgency. Single child skips to detail view. Tapping a card navigates to child detail.

### Acceptance Criteria
- [ ] Shows all children as cards with name, age, photo
- [ ] Each card shows next upcoming item (U-exam or vaccination, whichever sooner)
- [ ] Each card shows countdown to next item
- [ ] Each card shows overdue count in terracotta if > 0
- [ ] Each card shows progress (X of Y vaccinations, X of Y U-exams)
- [ ] Cards ordered by urgency (overdue first, then soonest upcoming)
- [ ] "Add child" button visible
- [ ] Single child → redirects to child detail
- [ ] Empty state when no children

### Test Suite

```
__tests__/components/
├── dashboard.test.tsx
└── child-card.test.tsx
```

**dashboard.test.tsx**
```
- it("should show empty state with 'Add child' button when no children")
- it("should render one card per child")
- it("should redirect to child detail when only one child exists")
- it("should order cards by urgency -- overdue children first")
- it("should show 'Add child' button at end of list")
- it("should navigate to child detail on card tap")
```

**child-card.test.tsx**
```
- it("should display child name and calculated age")
- it("should display age as 'X months' for children under 2 years")
- it("should display age as 'X years' for children 2+")
- it("should display child photo if available")
- it("should display default avatar if no photo")
- it("should show next upcoming item name and date")
- it("should show countdown in days if < 30 days away")
- it("should show countdown in weeks if 30-90 days away")
- it("should show overdue count with terracotta styling when items are overdue")
- it("should not show overdue section when no items are overdue")
- it("should show vaccination progress as 'X of Y'")
- it("should show U-exam progress as 'X of Y'")
- it("should show Masernschutz compliance icon")
```

---

## TODO-10: Child Detail Dashboard UI

**Priority:** P1
**Depends on:** TODO-09

### Description
Build the child detail view: header with name/age/photo, next-up card, overdue section, quick stats, recent activity, and AI insights placeholder.

### Acceptance Criteria
- [ ] Child header with name, calculated age, photo, Kinderarzt name
- [ ] Next-up card showing single most important upcoming item
- [ ] Overdue section (only if items exist) with terracotta styling
- [ ] Quick stats row: vaccinations completed, U-exams completed, Masernschutz
- [ ] Recent activity: last 3 completed items
- [ ] Back navigation to multi-child overview
- [ ] AI insights section (placeholder for TODO-15)

### Test Suite

```
__tests__/components/
└── child-detail.test.tsx
```

**child-detail.test.tsx**
```
- it("should display child name and age in header")
- it("should display Kinderarzt name if assigned")
- it("should show 'No pediatrician assigned' if none")
- it("should show next-up card with most imminent item")
- it("should show next-up as U-exam when it's sooner than vaccination")
- it("should show next-up as vaccination when it's sooner than U-exam")
- it("should show overdue section only when overdue items exist")
- it("should hide overdue section when no items overdue")
- it("should show correct vaccination completed count")
- it("should show correct U-exam completed count")
- it("should show Masernschutz compliant indicator when compliant")
- it("should show Masernschutz non-compliant indicator when not")
- it("should show last 3 recent activity items")
- it("should show empty state for recent activity when nothing completed")
- it("should navigate back to dashboard on back button")
```

---

## TODO-11: Schedule Timeline UI

**Priority:** P1
**Depends on:** TODO-07, TODO-08

### Description
Build the timeline/schedule page showing all U-exams and vaccinations chronologically, grouped by age phase. Support list view (default) and calendar view toggle. Status badges with correct colors.

### Acceptance Criteria
- [ ] List view grouped by age phase (Newborn, 2-4 months, etc.)
- [ ] Each item shows name, status badge, date
- [ ] Status badges: green (completed), amber (upcoming), terracotta (overdue), gray (scheduled), strikethrough (skipped)
- [ ] Tap item expands to show details and action buttons
- [ ] Child selector dropdown when multiple children
- [ ] Calendar view toggle showing dots on dates

### Test Suite

```
__tests__/components/
├── timeline.test.tsx
└── timeline-item.test.tsx
```

**timeline.test.tsx**
```
- it("should group items by age phase")
- it("should show 'Newborn' group with U1, U2")
- it("should show '2-4 months' group with U3, U4, and first vaccinations")
- it("should order items within groups by scheduled_date")
- it("should show child selector when multiple children exist")
- it("should toggle between list and calendar view")
```

**timeline-item.test.tsx**
```
- it("should render sage green badge for completed items")
- it("should render amber badge for upcoming items due within 30 days")
- it("should render terracotta badge for overdue items")
- it("should render gray badge for future scheduled items")
- it("should render strikethrough for skipped items")
- it("should expand on tap to show details")
- it("should show 'Mark as completed' button for upcoming/overdue items")
- it("should show date administered for completed vaccinations")
- it("should show physician name for completed items")
```

---

## TODO-12: Growth Charts & Measurements

**Priority:** P1
**Depends on:** TODO-05

### Description
API routes for CRUD of growth measurements + UI for interactive percentile charts. Plot height, weight, head circumference, BMI against WHO/RKI percentile curves (3rd, 15th, 50th, 85th, 97th). Support adding measurements linked to U-exams.

### Acceptance Criteria
- [ ] `POST /api/children/[id]/growth` adds a measurement
- [ ] `GET /api/children/[id]/growth` returns all measurements ordered by date
- [ ] Percentile calculation for each measurement against WHO/RKI data
- [ ] Charts render correctly with measurement points and percentile curves
- [ ] Separate curves for boys and girls
- [ ] BMI auto-calculated from height + weight

### Test Suite

```
__tests__/api/
└── growth.test.ts

__tests__/lib/
└── percentile.test.ts

__tests__/components/
└── growth-chart.test.tsx
```

**growth.test.ts**
```
- it("POST should create a measurement with height, weight, head_circumference")
- it("POST should accept optional measured_date (defaults to today)")
- it("POST should reject negative values")
- it("POST should reject measurement for another user's child")
- it("GET should return measurements ordered by measured_date ascending")
- it("PUT should update a measurement")
- it("DELETE should remove a measurement")
```

**percentile.test.ts**
```
- it("should calculate 50th percentile for average height-for-age boy")
- it("should calculate 50th percentile for average height-for-age girl")
- it("should return <3rd percentile for significantly low weight")
- it("should return >97th percentile for significantly high weight")
- it("should calculate BMI from height and weight")
- it("should detect percentile crossing (moved from 50th to 25th)")
- it("should detect significant trend change (weight gain flattening)")
- it("should use correct WHO reference data for age 0-2 years")
- it("should use correct WHO reference data for age 2-18 years")
```

**growth-chart.test.tsx**
```
- it("should render chart with percentile curves (3, 15, 50, 85, 97)")
- it("should plot child's measurements as data points")
- it("should support switching between height, weight, head, BMI")
- it("should show measurement form when 'Add measurement' is clicked")
- it("should use boy reference data for male children")
- it("should use girl reference data for female children")
```

---

## TODO-13: Developmental Milestones

**Priority:** P1
**Depends on:** TODO-03, TODO-05

### Description
API routes and UI for milestone checklists. Parents check off milestones (Yes/Not yet) organized by U-exam age. Simple checkboxes, no medical judgment.

### Acceptance Criteria
- [ ] `GET /api/children/[id]/milestones` returns milestones grouped by U-exam
- [ ] `PUT /api/milestone-records/[id]` toggles achieved status
- [ ] Milestones organized by category: motor, language, social_cognitive
- [ ] UI shows checklists with "Yes" / "Not yet" per milestone
- [ ] Milestone records auto-created when child is created

### Test Suite

```
__tests__/api/
└── milestones.test.ts

__tests__/components/
└── milestone-checklist.test.tsx
```

**milestones.test.ts**
```
- it("GET should return milestones grouped by U-exam")
- it("GET should include category (motor, language, social_cognitive)")
- it("GET should include current achieved status for each milestone")
- it("PUT should toggle achieved from false to true")
- it("PUT should toggle achieved from true to false")
- it("PUT should set observed_date when marking as achieved")
- it("PUT should return 403 for another user's child")
```

**milestone-checklist.test.tsx**
```
- it("should render milestones grouped by U-exam name")
- it("should show category labels (Motor, Language, Social)")
- it("should render checkbox for each milestone")
- it("should show checked state for achieved milestones")
- it("should show unchecked state for not-yet milestones")
- it("should call API on checkbox toggle")
- it("should show milestone description in current language")
```

---

## TODO-14: AI Document Scanning

**Priority:** P1
**Depends on:** TODO-07, TODO-08

### Description
Implement the document scanner using Claude Agent SDK. Parent photographs a U-Heft or Impfpass page, the agent extracts structured data, deduplicates against existing records, and presents results for parent review and confirmation.

### Acceptance Criteria
- [ ] `POST /api/scan` accepts image + document_type, returns extracted data
- [ ] `POST /api/scan/confirm` writes confirmed data to database
- [ ] Agent uses MCP tools to read existing records and deduplicate
- [ ] Extraction returns structured JSON matching our schema
- [ ] Uncertain fields flagged for manual review
- [ ] Images deleted after processing
- [ ] Rate limited: 10 scans per user per hour

### Test Suite

```
__tests__/api/
└── scan.test.ts

__tests__/lib/
└── scan-agent.test.ts

__tests__/components/
└── document-scanner.test.tsx
```

**scan.test.ts**
```
- it("POST /api/scan should accept base64 image and document_type")
- it("POST /api/scan should reject image larger than 2MB")
- it("POST /api/scan should reject invalid document_type")
- it("POST /api/scan should return structured extraction result")
- it("POST /api/scan should return 429 after 10 scans in one hour")
- it("POST /api/scan/confirm should write vaccination records to database")
- it("POST /api/scan/confirm should write u_exam records to database")
- it("POST /api/scan/confirm should skip duplicate records")
- it("POST /api/scan/confirm should flag conflicting records for review")
```

**scan-agent.test.ts**
```
- it("should create MCP server with read/write tools")
- it("should call query() with claude-sonnet-4-6 model")
- it("should include vision content in the prompt")
- it("should use bypassPermissions mode")
- it("should set maxTurns to prevent runaway agents")
- it("should return structured extraction matching VaccinationRecord schema")
- it("should return structured extraction matching UExamRecord schema")
- it("should deduplicate against existing records using read tools")
- it("should flag low-confidence fields")
```

**document-scanner.test.tsx**
```
- it("should render document type selector (U-Heft, Impfpass, Growth chart)")
- it("should open camera/file picker on scan button")
- it("should show processing spinner during extraction")
- it("should display extracted data in editable form fields")
- it("should highlight uncertain fields in amber")
- it("should call confirm endpoint on 'Save' button")
- it("should show 'Scan another page' button after successful scan")
- it("should show error message when image is unreadable")
```

---

## TODO-15: AI Growth Insights & Parental Guidance

**Priority:** P1
**Depends on:** TODO-12, TODO-13

### Description
Implement the AI insights agent using Claude Agent SDK. When growth data changes or parent requests, the agent reads the child's full context (measurements, milestones, exams) and generates personalized dietary suggestions, activity tips, and doctor questions. Includes smart reminder email generation.

### Acceptance Criteria
- [ ] `GET /api/children/[id]/insights` returns cached insights
- [ ] `POST /api/children/[id]/insights/refresh` regenerates insights
- [ ] Agent uses MCP tools to read child data and compute percentiles
- [ ] Insights include: growth trend summary, dietary suggestions, activity tips, doctor questions
- [ ] Insights cached in AIInsight table with 7-day expiry
- [ ] Insights regenerated when new measurement is added
- [ ] Medical disclaimer included in every insight
- [ ] No PII sent to Anthropic API

### Test Suite

```
__tests__/api/
└── insights.test.ts

__tests__/lib/
└── insights-agent.test.ts

__tests__/components/
└── insights-card.test.tsx
```

**insights.test.ts**
```
- it("GET should return cached insights if valid")
- it("GET should return empty array if no insights generated yet")
- it("POST refresh should generate new insights")
- it("POST refresh should invalidate old cached insights")
- it("GET should return insights in the user's preferred language")
- it("POST refresh should return 403 for another user's child")
```

**insights-agent.test.ts**
```
- it("should create MCP server with read-only tools (no write tools)")
- it("should call query() with claude-sonnet-4-6 model")
- it("should include system prompt with pediatric guidelines context")
- it("should send only anonymized data (age, gender, measurements -- no name)")
- it("should set maxTurns and maxBudgetUsd for cost control")
- it("should return structured JSON with trend_summary section")
- it("should return structured JSON with dietary_suggestions section")
- it("should return structured JSON with activity_suggestions section")
- it("should return structured JSON with doctor_questions section")
- it("should include medical disclaimer in output")
- it("should recommend urgent visit when 2+ percentile bands crossed downward")
- it("should generate age-appropriate dietary advice")
- it("should generate age-appropriate activity advice")
```

**insights-card.test.tsx**
```
- it("should render growth trend summary")
- it("should render dietary suggestions as a list")
- it("should render activity suggestions as a list")
- it("should render doctor questions as a list")
- it("should show medical disclaimer text")
- it("should show 'Refresh' button")
- it("should show loading state during refresh")
- it("should not show 'AI' branding or sparkle icons")
- it("should use pale sage background color")
```

---

## TODO-16: Email Reminders

**Priority:** P1
**Depends on:** TODO-06, TODO-15

### Description
Implement email reminders via Resend. Agent-generated personalized email content (not static templates). Scheduled via Vercel Cron Jobs. Configurable per user.

### Acceptance Criteria
- [ ] Cron job runs daily to check for upcoming items
- [ ] U-exam reminders sent 2 weeks and 3 days before due date
- [ ] Vaccination reminders sent 1 week and 1 day before due date
- [ ] Overdue alerts sent for missed items
- [ ] Masernschutzgesetz compliance reminders before daycare/school age
- [ ] Emails personalized by AI agent (reads child context, writes natural language)
- [ ] Emails sent via Resend API
- [ ] Users can configure which reminders are active
- [ ] Reminder records tracked to prevent duplicate sends

### Test Suite

```
__tests__/lib/
├── reminder-scheduler.test.ts
└── reminder-email.test.ts

__tests__/api/
└── reminders.test.ts
```

**reminder-scheduler.test.ts**
```
- it("should identify U-exams due within 14 days and not yet reminded")
- it("should identify vaccinations due within 7 days and not yet reminded")
- it("should identify overdue items not yet alerted")
- it("should not schedule reminder for items already reminded")
- it("should not schedule reminder for completed items")
- it("should respect user's reminder preferences (disabled reminders skipped)")
- it("should identify Masernschutz non-compliant children approaching age 1 or 2")
```

**reminder-email.test.ts**
```
- it("should generate personalized email content via AI agent")
- it("should include child name and upcoming item in email")
- it("should include relevant context (milestone status, growth trends)")
- it("should send email via Resend API")
- it("should mark reminder as sent after successful delivery")
- it("should handle Resend API failure gracefully")
- it("should generate email in user's preferred language")
```

**reminders.test.ts**
```
- it("GET /api/reminders should return user's reminder preferences")
- it("PUT /api/reminders should update reminder preferences")
- it("PUT /api/reminders should allow disabling U-exam reminders")
- it("PUT /api/reminders should allow disabling vaccination reminders")
```

---

## TODO-17: Internationalization (EN/DE)

**Priority:** P1
**Depends on:** TODO-01

### Description
Set up next-intl with complete message files for English (default) and German. All UI labels, exam descriptions, milestone names, vaccine names, status labels, error messages in both languages. Language toggle in settings.

### Acceptance Criteria
- [ ] All UI strings externalized to message files
- [ ] EN and DE message files have identical key structure
- [ ] Medical terms show German original in parentheses in EN mode
- [ ] Date format DD.MM.YYYY in both languages
- [ ] Number format: international in EN, German in DE
- [ ] Language toggle works and persists to user profile
- [ ] AI-generated content respects selected language

### Test Suite

```
__tests__/i18n/
├── messages.test.ts
└── formatting.test.ts
```

**messages.test.ts**
```
- it("should have all navigation labels in EN and DE")
- it("should have all status labels in EN and DE")
- it("should have all form labels in EN and DE")
- it("should have all error messages in EN and DE")
- it("should have all U-exam names in EN and DE")
- it("should have all vaccine names in EN and DE")
- it("should have all milestone descriptions in EN and DE")
- it("should have medical disclaimer in EN and DE")
- it("EN and DE files should have identical key structure")
```

**formatting.test.ts**
```
- it("should format date as DD.MM.YYYY in EN locale")
- it("should format date as DD.MM.YYYY in DE locale")
- it("should format number as 1,234.56 in EN locale")
- it("should format number as 1.234,56 in DE locale")
- it("should show German medical terms in parentheses in EN mode")
- it("should calculate and display child age in correct language")
```

---
