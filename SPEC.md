# KidsVax - Das digitale Gelbe Heft & Impfpass

## Overview

KidsVax is a mobile-friendly web application that digitizes the German Gelbes Heft (U-Heft) and Impfpass into a single, clean interface. It auto-generates U-Untersuchungen and STIKO vaccination schedules based on each child's date of birth, sends reminders before due dates, and provides a shareable digital Teilnahmekarte for daycare and school proof.

Parents can photograph their existing paper U-Heft and Impfpass pages, and AI (Anthropic Claude) extracts all data automatically -- no manual entry required.

When growth measurements change significantly, the AI provides personalized dietary guidance, activity suggestions, and questions to ask the pediatrician at the next visit.

Built for the German market. Available in English (default) and German.

## Problem Statement

German parents juggle two separate paper booklets per child:
- The **Gelbes Heft** (U-Heft) for 14 pediatric checkups (U1-U9, U10-U11, J1-J2) plus 6 dental exams (Z1-Z6)
- The **Impfpass** for STIKO-recommended vaccinations

These documents get lost, have no backup, provide no reminders, and are entirely in German -- leaving ~13 million foreign-born residents in Germany unable to read them. No existing app in the German market combines both booklets with developmental milestones and growth tracking in one place. When parents do have the data, they get no actionable guidance -- just raw numbers on a chart.

## Target Users

- **Primary:** Parents/guardians of children aged 0-18 living in Germany
- **Secondary:** Expat parents in Germany who need English language support
- **Future:** Pediatricians and clinic staff (not in current scope -- parents-only portal)

## Market Positioning

KidsVax fills a gap that no existing solution covers:

| Feature | ImpfPassDE | Vacuna | Meine Pad. Praxis | ePA (govt) | **KidsVax** |
|---------|:---------:|:------:|:-----------------:|:----------:|:-----------:|
| Vaccination tracking | Yes | Yes | Yes | Planned | **Yes** |
| U-Heft checkup tracking | No | No | Partial | Planned 2026 | **Yes** |
| Developmental milestones | No | No | No | No | **Yes** |
| Growth charts | No | No | No | No | **Yes** |
| AI photo scan of paper records | No | Photo only | No | No | **Yes (extract + import)** |
| AI-powered guidance | No | No | No | No | **Yes** |
| Multi-child dashboard | Paid | Paid | No | N/A | **Yes** |
| English language | No | No | No | No | **Yes (default)** |
| Reminders | Paid | Yes | Yes | No | **Yes** |
| Digital Teilnahmekarte | No | No | No | No | **Yes** |

---

## Core Features

### 1. Multi-Child Dashboard & Profile Management
The dashboard is the home screen. It shows **all children at a glance** with what's next for each.

#### Dashboard (All Children Overview)
- **Multi-child cards**: Each child displayed as a summary card showing:
  - Name, age, small photo
  - Next upcoming item (U-exam or vaccination, whichever is sooner) with countdown
  - Number of overdue items (if any, shown in terracotta)
  - Quick progress: "8 of 12 vaccinations" / "5 of 9 U-exams"
- Cards are ordered by urgency: children with overdue or imminent items appear first
- Tap a child card to enter that child's detailed view
- "Add child" button always visible at the end of the list
- If only one child: skip the multi-card view, go straight to that child's detail dashboard

#### Child Detail Dashboard
Once a specific child is selected:
1. **Child header**: Name, age (e.g., "Lena, 8 months"), photo, Kinderarzt name
2. **Next up card**: The single most important upcoming item. Shows: what, when it's due, how many days/weeks until due.
3. **Overdue section** (only if items are overdue): Terracotta-tinted list. Factual, not alarming.
4. **Quick stats row**: 3 stats -- vaccinations completed, U-exams completed, Masernschutz compliance
5. **Recent activity**: Last 3 recorded items
6. **AI Insights** (if any): Growth trend alerts, dietary suggestions, doctor visit questions (see Feature 10)

#### Child Profile
- Name, date of birth, gender (for growth curves), optional photo
- Premature flag (Frühgeboren) -- triggers adjusted vaccination schedule
- Allergies and medical notes (free text)
- Assigned Kinderarzt (pediatrician)
- Bundesland (for mandatory vs. recommended U-exam badges)

### 2. Digital Gelbes Heft (U-Untersuchungen)
Mirror the exact structure of the official G-BA Kinderuntersuchungsheft:

#### U-Untersuchungen Schedule
| Exam | Age Window | Tolerance | Key Focus |
|------|-----------|-----------|-----------|
| **U1** | At birth | - | APGAR, reflexes, vitamin K |
| **U2** | Day 3-10 | Day 3-14 | Full physical, metabolic screening (Neugeborenenscreening) |
| **U3** | Week 4-5 | Week 3-8 | Hip ultrasound (Hüftsonographie), hearing screening |
| **U4** | Month 3-4 | Month 2-4.5 | Motor development, first vaccinations due |
| **U5** | Month 6-7 | Month 5-8 | Sitting, grasping, babbling, Beikost intro |
| **U6** | Month 10-12 | Month 9-14 | First steps, first words, pincer grip |
| **U7** | Month 21-24 | Month 20-27 | Walking, 50+ words, two-word sentences |
| **U7a** | Month 34-36 | Month 33-38 | Vision, coordination, multi-word sentences |
| **U8** | Month 46-48 | Month 43-50 | Hearing, speech clarity, drawing, fine motor |
| **U9** | Month 60-64 | Month 58-66 | School readiness, urine test, color vision |
| **U10** | 7-8 years | - | School performance, media use |
| **U11** | 9-10 years | - | Early puberty, substance awareness |
| **J1** | 12-14 years | - | Puberty, mental health, risk behaviors |
| **J2** | 16-17 years | - | Near-adult development |

#### Dental Examinations (Z1-Z6, new from Jan 2026)
| Exam | Age Window |
|------|-----------|
| **Z1** | 6-9 months |
| **Z2** | 10-20 months |
| **Z3** | 21-33 months |
| **Z4** | 34-45 months |
| **Z5** | 46-57 months |
| **Z6** | 58-72 months |

#### Per Examination, Track:
- **Status**: Upcoming, Completed, Missed
- **Date performed**
- **Performing physician** (name, practice stamp equivalent)
- **Findings summary** (parent-facing notes)
- **Parent observations** (what parents noticed before the visit -- mirrors the Elterninformation pages)
- **Referrals** (Überweisungen) if any
- **Next exam due date** (auto-calculated)

#### Screenings (documented within relevant U-exams)
- Neugeborenenscreening (extended newborn metabolic screening) at U2
- Neugeborenen-Hörscreening (hearing) at U1/U2/U3
- Hüftsonographie (hip ultrasound) at U3
- Mukoviszidose-Screening (cystic fibrosis) at U2
- Pulsoxymetrie-Screening (critical heart defects) at U1/U2

### 3. Digital Impfpass (STIKO Vaccination Schedule)
Pre-loaded with the current STIKO-recommended vaccination schedule:

#### Standard Immunization Schedule
| Vaccine | Short | Doses | Schedule |
|---------|-------|-------|----------|
| Rotavirus | RV | 2-3 | 6 weeks, 2 months, (3-4 months for RotaTeq) |
| Diphtherie, Tetanus, Pertussis, Polio, Hib, Hepatitis B | DTaP-IPV-Hib-HepB | 3 | 2, 4, 11 months |
| Pneumokokken | PCV | 3 | 2, 4, 11-14 months |
| Meningokokken B | MenB | 3 | 2, 4, 12 months |
| Meningokokken C | MenC | 1 | 12 months |
| Masern, Mumps, Röteln | MMR | 2 | 11, 15 months |
| Varizellen (Windpocken) | V | 2 | 11, 15 months |
| Auffrischung Tdap-IPV | Tdap-IPV | 1 | 5-6 years |
| Auffrischung Td-ap | Td-ap | 1 | 9-16 years |
| HPV | HPV | 2 | 9-14 years |
| Meningokokken ACWY | MenACWY | 1 | 12-14 years |

#### Premature Infant Support
Frühgeborene (premature infants) use a 3+1 schedule for the hexavalent vaccine: 2, 3, 4, and 11 months. The app detects the premature flag and adjusts automatically.

#### Per Vaccination, Track:
- **Status**: Scheduled, Administered, Missed, Skipped
- **Scheduled date** (auto-calculated from DOB)
- **Administered date**
- **Vaccine product name and lot number** (Chargennummer)
- **Administering physician**
- **Injection site** (Impfstelle)
- **Skip reason** if applicable
- **Notes**

#### Masernschutzgesetz Compliance
Flag measles vaccination status prominently:
- Children 1+: at least 1 dose required for daycare/school entry
- Children 2+: at least 2 doses required
- Show clear compliance/non-compliance indicator
- Reminder if approaching daycare/school age without required doses

### 4. Digital Teilnahmekarte
The paper U-Heft has a detachable Teilnahmekarte that proves checkup attendance without revealing medical details. KidsVax provides:
- Shareable digital card showing only: child name, DOB, exam names, dates completed, physician stamps
- **No medical findings exposed** -- matches the privacy design of the paper card
- Export as PDF
- QR code for quick verification by daycare/school staff
- Vaccination compliance status for Masernschutzgesetz

### 5. Growth Charts (Perzentilkurven)
Mirror the percentile curves from the back of the Gelbes Heft:
- Body height/length (Körperlänge/-größe) -- separate for boys and girls
- Body weight (Körpergewicht)
- Head circumference (Kopfumfang)
- BMI
- Plot measurements over time against WHO/RKI percentile curves (3rd, 15th, 50th, 85th, 97th)
- Parents can add measurements at each U-exam or independently

### 6. Developmental Milestones (Meilensteine)
Linked to each U-exam age, track whether the child has reached expected milestones:

| Age/Exam | Motor | Language | Social/Cognitive |
|----------|-------|----------|-----------------|
| U3 (4-5w) | Head lifting | Reacts to sounds | Eye contact |
| U4 (3-4m) | Head control, grasping | Cooing, laughing | Social smiling |
| U5 (6-7m) | Sitting with support, rolling | Babbling | Responds to name |
| U6 (10-12m) | Pulling to stand | First words | Stranger anxiety |
| U7 (21-24m) | Walking, running | 50+ words, 2-word sentences | Parallel play |
| U7a (34-36m) | Hopping, climbing | Sentences, names colors | Cooperative play |
| U8 (46-48m) | One-foot hopping, scissors | Clear speech, stories | Counting, rules |
| U9 (60-64m) | Balancing, catching | Grammar, own name writing | School readiness |

Each milestone is a simple checkbox: Yes / Not yet. No medical judgment -- just parent observation tracking.

### 7. Appointment Management (Termine)
- Create, edit, cancel Kinderarzt appointments
- Link appointments to specific U-exams or vaccinations
- Appointment types: U-Untersuchung, Vaccination, Dental (Z-exam), Sick visit, Other
- Store Kinderarzt details (name, Praxis, address, phone)
- Appointment history

### 8. Reminders & Notifications (Erinnerungen)
- Email reminders for upcoming U-exams (2 weeks, 3 days before the recommended date)
- Email reminders for upcoming vaccinations (1 week, 1 day before)
- Appointment reminders (day before, morning of)
- Overdue alerts for missed U-exams or vaccinations
- Tolerance window warnings (e.g., "U6 is due by month 14 -- 2 months remaining")
- Masernschutzgesetz compliance reminders before daycare/school entry age
- Configurable: users choose which reminders they want

### 9. Bundesland-Specific Features
Since U-exam requirements vary by state:
- User selects their Bundesland during onboarding
- **Bayern, Hessen, Baden-Württemberg**: Show "Mandatory" badge on U-exams
- **All other states**: Show "Recommended" with note about monitoring system
- Inform parents about potential Jugendamt follow-up if exams are missed in monitoring states

### 10. AI-Powered Document Scanning (Anthropic Claude Vision)
Parents with existing paper records can photograph them and have all data extracted automatically.

#### Supported Documents
1. **U-Heft pages**: Photograph any U-exam page → AI extracts exam name, date, physician, findings, stamps
2. **Impfpass pages**: Photograph vaccination record pages → AI extracts vaccine names, dates, lot numbers, physician names, doses
3. **Growth measurement pages**: Photograph the Perzentilkurven pages → AI extracts plotted data points (height, weight, head circumference with dates)

#### How It Works
1. Parent taps "Scan document" (camera icon) from any relevant screen
2. Camera opens (or file picker for existing photos). Parent photographs the page.
3. Image is sent to **Anthropic Claude API** (claude-sonnet-4-6 with vision) via a secure Next.js API route
4. Claude extracts structured data from the image:
   - For U-Heft: `{ exam: "U6", date: "2025-03-15", physician: "Dr. Müller", findings: "...", screenings: [...] }`
   - For Impfpass: `{ vaccine: "MMR", dose: 1, date: "2025-02-10", product: "Priorix", lot: "ABC123", physician: "Dr. Schmidt" }`
   - For growth data: `{ measurements: [{ date: "...", height_cm: 68, weight_kg: 7.8, head_cm: 43 }] }`
5. Extracted data is shown to the parent for **review and confirmation** before saving. Parent can edit any field.
6. On confirmation, data is written to the database and the schedule/records are updated.

#### Technical Details (Agent SDK)
- **SDK**: `@anthropic-ai/claude-agent-sdk` (Claude Agent SDK)
- **Model**: Claude claude-sonnet-4-6 (vision capability)
- **Agentic flow**: The scan API route creates an agent with tools. The agent:
  1. Receives the image and document type
  2. Extracts structured data from the image (vision)
  3. Uses `read_vaccination_records` / `read_u_exam_records` tools to check what already exists for this child
  4. Identifies new vs. duplicate entries (e.g., "MMR dose 1 already recorded on 2025-02-10, skipping")
  5. Resolves conflicts (e.g., "Existing record says U5 on March 3, scanned page says March 5 -- flagging for parent review")
  6. Returns the deduplicated, conflict-resolved extraction for parent review
- **Image handling**: Images are compressed client-side (max 2MB) before upload. Stored temporarily in Supabase Storage during processing, deleted after extraction is confirmed or cancelled.
- **Error handling**: If extraction confidence is low, agent flags fields for manual review. If image is unreadable, agent asks parent to retake with specific guidance ("The bottom-right corner is cut off").
- **Rate limiting**: Max 10 scans per user per hour to prevent abuse.
- **Cost**: Estimated ~$0.01-0.05 per scan (agent may use multiple tool calls). Budget for API costs in infrastructure.

#### Privacy Considerations
- Images are processed server-side and never stored permanently (deleted after data extraction)
- Anthropic API data retention policies apply (no training on API data)
- Agent tools only access the authenticated user's data (enforced by RLS)
- Parent must confirm all extracted data before it enters the database
- Clear disclosure that AI is used for data extraction

### 11. AI-Powered Growth Insights & Parental Guidance (Anthropic Claude)
When growth data changes, the AI analyzes trends and provides actionable, age-appropriate guidance.

#### Triggers
Growth insights are generated when:
- A new growth measurement is added
- A measurement shows a **percentile crossing** (child moves from one percentile band to another, e.g., from 50th to 25th)
- A measurement shows a **significant trend change** (e.g., weight gain flattening or accelerating)
- Parent explicitly requests insights ("What should I ask the doctor?")

#### What the AI Provides

**1. Growth Trend Summary**
A plain-language interpretation of the child's growth trajectory:
- "Lena's weight has been tracking along the 50th percentile consistently. This is healthy and normal."
- "Max's height dropped from the 75th to the 40th percentile over the last 3 months. This is worth discussing with your pediatrician."

**2. Dietary Suggestions (age-appropriate)**
Based on the child's age, current percentile position, and trend:
- **Underweight trend**: "At 8 months, calorie-dense foods like avocado, full-fat yogurt, and nut butters (if no allergies) can help. Offer Beikost 2-3 times daily alongside breast milk or formula."
- **Overweight trend**: "At 3 years, focus on whole foods, reduce juice and sugary snacks. Active play for at least 60 minutes daily."
- **Normal growth**: "Growth is on track. Continue with a balanced diet appropriate for [age]. No changes needed."
- **Head circumference concerns**: "Head circumference above the 97th percentile should be discussed with your pediatrician. This may be familial or warrant further evaluation."

**3. Activity & Lifestyle Suggestions**
Age-appropriate activity recommendations:
- "At 6 months: tummy time, reaching games, supported sitting practice"
- "At 2 years: running, climbing, ball play, dancing -- aim for 3+ hours of active play daily"
- "At 5 years: swimming lessons, balance bike, playground time -- fine motor activities like drawing and puzzles"

**4. Questions to Ask Your Doctor**
Before each upcoming U-exam or when growth flags are raised, suggest specific questions:
- General: "Ask about introducing allergenic foods", "Ask about fluoride supplementation", "Ask about screen time limits for [age]"
- Growth-triggered: "Lena's weight gain has slowed. Ask Dr. Müller whether this is a concern or normal for her growth pattern."
- Milestone-triggered: "Max hasn't started speaking 2-word sentences yet at 24 months. Ask whether a speech evaluation is recommended."
- Vaccination-triggered: "The next MMR dose is due. Ask about combining it with the varicella vaccine (MMRV) vs. separate shots."

**5. U-Exam Preparation Guide**
Before each U-exam, the AI generates a personalized preparation summary:
- What this exam specifically checks
- Milestones the pediatrician will look for (personalized to any "Not yet" items the parent flagged)
- Specific questions based on the child's data (growth trends, missed milestones, upcoming vaccinations)
- What to bring / what to expect

#### Technical Implementation (Agent SDK)
- **SDK**: `@anthropic-ai/claude-agent-sdk` (Claude Agent SDK)
- **Model**: Claude claude-sonnet-4-6 (text)
- **Agentic flow**: The insights API route creates an agent with tools. The agent:
  1. Uses `read_child_profile` to get age, gender, allergies
  2. Uses `read_growth_data` to get all measurements
  3. Uses `compute_percentile` to calculate current percentile positions and detect crossings
  4. Uses `read_milestones` to check developmental status
  5. Uses `read_u_exam_records` to see what exams are upcoming
  6. Uses `read_vaccination_records` to identify gaps
  7. Reasons over all data together and generates contextual, personalized insights
- **Why agentic matters**: A static prompt would require the API route to pre-assemble all data and send it. The agent decides what data it needs based on what it discovers. If growth is normal, it skips dietary suggestions and focuses on exam prep. If there's a percentile crossing, it digs deeper into the trend before advising.
- **Caching**: Insights are cached in the AIInsight table and only regenerated when new data is added or parent requests refresh. Cache expires after 7 days.
- **Response format**: Structured JSON with sections (trend_summary, dietary_suggestions, activity_suggestions, doctor_questions). Rendered as clean, readable cards in the UI.
- **Disclaimer**: Every AI-generated insight includes: "This is general guidance, not medical advice. Always consult your pediatrician for personalized recommendations." / "Dies ist eine allgemeine Orientierung, keine ärztliche Beratung. Konsultieren Sie immer Ihren Kinderarzt für individuelle Empfehlungen."

#### Smart Reminder Emails (Agent-Generated)
Instead of static template emails, reminder emails are generated by an agent:
- Agent reads the child's full context (completed exams, growth trends, overdue items, upcoming milestones)
- Generates a personalized, natural-language email: "Lena's U6 is due in 2 weeks. At this visit, the pediatrician will check her first steps and first words. Based on your milestone tracking, she's already walking -- great! You might want to ask about her speech development since 'first words' is still marked as 'not yet'."
- Emails sent via **Resend** API
- Scheduled via Supabase Edge Functions (cron) or Vercel Cron Jobs

#### Safety Guardrails
- AI never diagnoses conditions or prescribes treatments
- AI never contradicts standard medical guidance (STIKO, G-BA guidelines)
- AI always recommends consulting the pediatrician for anything concerning
- Dietary suggestions follow German Society for Nutrition (DGE) and WHO guidelines for children
- All output is reviewed against a safety system prompt that prevents harmful advice
- If growth data suggests a serious concern (e.g., crossing 2+ percentile bands downward), the AI recommends an urgent pediatrician visit rather than dietary tips
- Agent tools are read-only for insights generation (no writes). Only the scan agent can write, and only after parent confirmation.

---

## UI/UX Specification

### Design Philosophy

**Warm, trustworthy, and calm.** This is a health app for parents -- not a productivity tool, not a social app. The design should feel like a reassuring, organized companion. Parents should open it and immediately feel in control.

#### Anti-Patterns (What We Will NOT Do)
- No purple/violet AI-generated aesthetic. No gradients-on-everything.
- No glassmorphism, no frosted glass cards, no excessive blur effects.
- No dark mode as default (parents use this in well-lit pediatrician waiting rooms).
- No gamification (badges, streaks, points). This is health, not a game.
- No cluttered dashboards with 10 cards competing for attention.
- No skeleton loaders everywhere. If data loads fast, show it. No loading theater.
- No floating action buttons (FAB). Use clear, labeled actions.
- No bottom sheets for everything. Use proper pages.
- No excessive animations or transitions. Quick and functional.
- No "AI" branding in the UI. Don't label things "AI-powered" or "Smart insights". Just show helpful content naturally.

#### Design Principles
1. **Content-first**: Data is the hero. No decorative illustrations filling space.
2. **Scannable**: A parent in a waiting room with a fussy child should find what they need in 2 seconds.
3. **Calm palette**: Warm whites, soft sage greens, muted earth tones. One accent color for actions and alerts.
4. **Typography-driven**: Clean sans-serif. Clear hierarchy. Generous line spacing. Large touch targets.
5. **Whitespace is a feature**: Let the interface breathe. Fewer elements, more clarity.
6. **Honest UI**: If something is overdue, show it clearly. If everything is fine, show calm. No artificial urgency.
7. **AI is invisible**: Insights and suggestions appear as natural content, not as a chatbot or a special "AI section" with sparkle icons.

#### Color Palette
| Role | Color | Usage |
|------|-------|-------|
| Background | Warm white `#FAFAF8` | Page backgrounds |
| Surface | White `#FFFFFF` | Cards, containers |
| Text primary | Charcoal `#2D2D2D` | Headings, body text |
| Text secondary | Warm gray `#6B6B6B` | Labels, metadata |
| Accent | Sage green `#5B8C5A` | Primary buttons, active states, completed badges |
| Accent hover | Deep sage `#4A7349` | Button hover/press |
| Warning | Warm amber `#D4A030` | Upcoming items, gentle alerts |
| Overdue | Terracotta `#C45C3E` | Overdue items, missed exams |
| Border | Light gray `#E8E8E6` | Card borders, dividers |
| Muted background | Soft cream `#F5F3EF` | Section backgrounds, alternating rows |
| Insight background | Pale sage `#EEF4ED` | AI-generated insight cards |

#### Typography
- **Font**: Inter (or system font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Headings**: 600 weight, tight tracking
- **Body**: 400 weight, 1.6 line height
- **Small/labels**: 500 weight, uppercase for section labels, normal case for metadata
- **Minimum touch target**: 44x44px for all interactive elements
- **Minimum font size**: 14px body, 12px metadata

#### Responsive Behavior
- **Mobile-first design** (375px base width)
- **Breakpoints**: 375px (mobile), 768px (tablet), 1024px (desktop)
- On mobile: single column, full-width cards, bottom navigation
- On tablet/desktop: max-width container (680px), centered content, side navigation
- All features must be fully usable on a phone in portrait orientation
- Touch-friendly: large tap targets, swipe gestures where natural (e.g., swipe between children)

### Information Architecture

#### Onboarding (3 steps, no more)
1. **Welcome**: One sentence value prop + "Get started" / "Jetzt starten" button. Language selector (EN/DE) visible.
2. **Create Account**: Email + password. Magic link option. No social login clutter.
3. **Add Your First Child**: Name + date of birth (required). Photo, Kinderarzt, Bundesland (optional, can add later). Option to scan existing U-Heft/Impfpass pages to import historical data. On save: schedule auto-generates and user sees their child's dashboard.

#### Main Navigation
Simple top-level navigation. No more than 4 items.

**Mobile (bottom bar):**
1. **Overview** -- multi-child dashboard
2. **Schedule** -- U-exams + vaccinations timeline
3. **Growth** -- charts, milestones, AI insights
4. **More** -- settings, children management, export, scan

**Desktop (sidebar):**
Same 4 sections, expanded as sidebar links with sub-items visible.

### Screen Specifications

#### 1. Overview (Dashboard) -- Multi-Child Home
The landing page after login. Shows all children at a glance.

**If multiple children:**
- Vertically stacked summary cards, one per child
- Each card shows: name, age, photo, next upcoming item with countdown, overdue count (if any), progress bar (vaccinations + U-exams)
- Cards ordered by urgency (children with overdue/imminent items first)
- Tap a card → enters that child's detail view
- "Add another child" card at the bottom (subtle, not prominent)

**If one child:**
- Skip multi-card view, go straight to the child's detail dashboard (same as tapping into a child)

**Child Detail Dashboard (after tapping a child):**
- Back arrow to return to multi-child overview
- Child header: name, age, photo, Kinderarzt
- Next up card (single most important upcoming item)
- Overdue section (if any)
- Quick stats row (vaccinations, U-exams, Masernschutz)
- Insights section: growth trend summary, suggested questions for next visit (see Feature 11). Rendered as a subtle pale-sage card. No "AI" label.
- Recent activity (last 3 items)

#### 2. Schedule (Timeline)
A chronological view of all U-exams and vaccinations for the selected child.

**Child selector**: If multiple children, dropdown or horizontal tabs at top to switch between children.

**Layout options (toggle):**
- **List view** (default): Chronological list grouped by age/phase. Each item shows: name, status badge, date (due or completed), tap to expand.
- **Calendar view**: Month grid with dots on dates where items are due/completed.

**Grouping in list view:**
- "Newborn" (0-2 weeks): U1, U2
- "2-4 months": U3, U4, first vaccinations
- "6-12 months": U5, U6, follow-up vaccinations
- "1-2 years": U7, boosters
- "3-5 years": U7a, U8, U9
- "School age" (6-10): U10, U11, school boosters
- "Adolescent" (12-17): J1, J2, HPV, MenACWY

**Status badges:**
- Sage green filled: Completed
- Amber outline: Upcoming / due soon
- Terracotta filled: Missed / overdue
- Gray outline: Scheduled (not yet due)
- Gray with line-through: Skipped

**Tap to expand** shows full details and action buttons (mark as completed, add notes, etc.)

#### 3. U-Exam Detail
When tapping a specific U-exam:

**Before the exam (status: upcoming):**
- What this exam checks (parent-friendly summary)
- Developmental milestones to observe (checklist the parent can fill in before the visit)
- **AI-generated preparation guide**: Personalized questions to ask the doctor based on this child's data (growth trends, milestone status, upcoming vaccinations)
- Button: "Schedule appointment" or "Mark as completed"

**After the exam (status: completed):**
- Date, physician
- Parent notes from the visit
- Milestone checklist (filled in)
- Any referrals noted
- Link to vaccinations given at this visit

#### 4. Vaccination Detail
When tapping a specific vaccination:

**Before vaccination:**
- What this vaccine protects against (one sentence)
- Which dose in the series (e.g., "Dose 2 of 2")
- Due date and tolerance window
- Button: "Mark as administered"

**After vaccination:**
- Date administered, physician
- Product name, lot number (Chargennummer)
- Injection site
- Notes

#### 5. Growth (Charts + Milestones + Insights)
**Three tabs:**

**Percentiles tab:**
- Growth charts: select metric (height, weight, head circumference, BMI)
- Interactive chart showing child's measurements plotted on WHO/RKI percentile curves
- Add new measurement via simple form (date, value)
- After adding a measurement: AI insight card appears below the chart if there's a notable trend (see Feature 11). If growth is normal, no card shown -- calm UI.

**Milestones tab:**
- Grouped by U-exam age. Simple checklists.
- Each milestone is "Yes" or "Not yet"
- Shows which exam they relate to

**Insights tab:**
- AI-generated growth trend summary
- Dietary suggestions (age-appropriate, based on current percentile and trends)
- Activity suggestions (age-appropriate)
- Questions to ask your doctor at the next visit
- Each insight card has the medical disclaimer
- "Refresh insights" button to regenerate with latest data
- Child selector at top if multiple children

#### 6. Document Scanner
Accessible from "More" menu or from any empty exam/vaccination record ("Import from photo").

**Flow:**
1. Select document type: "U-Heft page", "Impfpass page", or "Growth chart page"
2. Camera opens (or file picker). Instructions overlay: "Hold the page flat, ensure all text is visible"
3. Photo captured. Brief processing spinner ("Extracting data...")
4. **Review screen**: Extracted data shown in editable form fields. Fields that the AI was uncertain about are highlighted in amber. Parent reviews, corrects if needed, confirms.
5. Data saved. Parent returned to the updated record.

**Multi-page scanning**: "Scan another page" button after each successful scan. Enables parents to scan their entire U-Heft in one session.

#### 7. Teilnahmekarte (Export/Share)
Accessible from child profile or "More" section.
- Digital card view showing: child name, DOB, completed U-exams with dates, physician names
- Vaccination compliance status (Masernschutz: Yes/No)
- "Export as PDF" button
- "Share QR code" button (generates shareable link valid for 24h)
- **No medical details exposed** -- only attendance and compliance

#### 8. More (Settings)
- **Manage children**: Add, edit, remove children
- **Scan documents**: Access the document scanner
- **Pediatrician**: Add/edit pediatrician details
- **Reminders**: Configure which email reminders are active, timing preferences
- **Bundesland**: Change state selection
- **Language**: EN / DE toggle
- **Export data**: Full data export as PDF or JSON
- **Account**: Email, password, delete account
- **Privacy** (Datenschutz): Privacy policy, data handling info, AI data processing disclosure
- **Legal notice** (Impressum): Required in Germany

### Interaction Patterns

- **Forms**: Inline validation. Clear error messages in red below the field. Success confirmation via brief toast notification (green, top of screen, auto-dismiss 3s).
- **Destructive actions** (delete child, delete account): Confirmation dialog with explicit text input ("Type DELETE to confirm").
- **Loading**: If data loads in <200ms, show nothing. If 200ms-2s, show subtle spinner. Never show skeleton screens for fast operations.
- **AI processing**: Show a simple "Processing..." text with subtle spinner. No animated sparkles or brain icons.
- **Empty states**: Friendly, helpful. E.g., "No children added yet" with a single "Add child" button. Option to "Scan your existing U-Heft to get started quickly". No sad-face illustrations.
- **Offline**: Show last-cached data with a subtle "Offline" indicator bar at top. All read operations work offline. Write operations queue and sync when online. AI features unavailable offline (no indicator needed -- just don't show the buttons).

### Accessibility
- WCAG 2.1 AA compliance
- All color contrasts meet 4.5:1 ratio minimum
- Screen reader labels on all interactive elements (English and German)
- Keyboard navigable (tab order, focus indicators)
- No information conveyed by color alone (always pair with icon or text)
- Reduced motion support (`prefers-reduced-motion` media query)

### Bilingual Support (EN/DE)
- **English is default.** German selectable in onboarding or settings.
- All UI labels, exam descriptions, milestone names, vaccine names available in both languages.
- Medical terms keep German originals in parentheses when in English mode (e.g., "Hip Ultrasound (Hüftsonographie)")
- When in German mode, standard German medical terminology is used
- Date format: DD.MM.YYYY (German standard, used in both languages)
- Number format: International (1,234.56) in EN mode, German (1.234,56) in DE mode
- AI-generated content respects the selected language

---

## Data Model

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | string | Login credential (unique) |
| name | string | Display name |
| language | enum | en, de (default: en) |
| bundesland | string | German state (optional) |
| reminder_preferences | jsonb | Which reminders are active + timing |
| created_at | timestamp | |
| updated_at | timestamp | |

### Child
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| name | string | |
| date_of_birth | date | Core field for all schedule calculations |
| gender | enum | male, female, diverse (for growth percentile curves) |
| is_premature | boolean | Triggers 3+1 vaccination schedule |
| photo_url | string | Optional, stored in Supabase Storage |
| allergies | text | Free text |
| notes | text | Medical notes, Besonderheiten |
| pediatrician_id | UUID | FK to Pediatrician (optional) |
| created_at | timestamp | |
| updated_at | timestamp | |

### Pediatrician (Kinderarzt)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| name | string | Dr. name |
| praxis_name | string | Practice name |
| phone | string | |
| address | text | |
| email | string | Optional |
| created_at | timestamp | |

### UExam (U-Untersuchung)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | "U1", "U2", ..., "J1", "J2", "Z1"-"Z6" |
| full_name_de | string | German name |
| full_name_en | string | English name |
| description_de | text | What is checked (parent-facing, DE) |
| description_en | text | English translation |
| recommended_age_months | float | e.g., 0, 0.3 (day 10), 1, 3.5, etc. |
| tolerance_start_months | float | Earliest allowed |
| tolerance_end_months | float | Latest allowed |
| category | enum | u_exam, j_exam, z_exam |
| sort_order | int | For display ordering |

### UExamRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| child_id | UUID | FK to Child |
| u_exam_id | UUID | FK to UExam |
| status | enum | scheduled, completed, missed, skipped |
| scheduled_date | date | Auto-calculated from DOB |
| completed_date | date | When actually performed |
| physician_name | string | Who performed it |
| findings_notes | text | Parent-facing notes from the visit |
| parent_observations | text | What the parent observed before the visit |
| referrals | text | Any Überweisungen |
| created_at | timestamp | |
| updated_at | timestamp | |

### Screening
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| child_id | UUID | FK to Child |
| u_exam_record_id | UUID | FK to UExamRecord |
| type | enum | newborn_metabolic, hearing, hip_ultrasound, cystic_fibrosis, pulse_oximetry |
| status | enum | pending, completed, abnormal, not_done |
| result_notes | text | Brief result notes |
| completed_date | date | |

### Vaccine
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| short_name | string | e.g., "MMR", "DTaP-IPV-Hib-HepB" |
| full_name_de | string | German name |
| full_name_en | string | English name |
| protects_against_de | text | What it protects against (DE) |
| protects_against_en | text | English translation |
| total_doses | int | Total doses in series |
| is_mandatory | boolean | true only for Masern (measles) |

### VaccineScheduleRule
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| vaccine_id | UUID | FK to Vaccine |
| dose_number | int | Which dose (1, 2, 3...) |
| recommended_age_months | float | Standard schedule age |
| min_age_months | float | Earliest allowed |
| min_interval_days | int | Min days since previous dose |
| premature_age_months | float | Adjusted age for Frühgeborene (null if same) |

### VaccinationRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| child_id | UUID | FK to Child |
| vaccine_id | UUID | FK to Vaccine |
| dose_number | int | Which dose in the series |
| status | enum | scheduled, administered, missed, skipped |
| scheduled_date | date | Auto-calculated from DOB |
| administered_date | date | When given |
| physician_name | string | Administering doctor |
| product_name | string | Vaccine product (e.g., "Infanrix hexa") |
| lot_number | string | Chargennummer |
| injection_site | string | Impfstelle (e.g., "left thigh") |
| skip_reason | text | If skipped |
| notes | text | |
| linked_appointment_id | UUID | FK to Appointment (optional) |
| created_at | timestamp | |
| updated_at | timestamp | |

### Milestone
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| u_exam_id | UUID | FK to UExam (which exam this milestone is assessed at) |
| category | enum | motor, language, social_cognitive |
| description_de | string | German description |
| description_en | string | English description |
| sort_order | int | |

### MilestoneRecord
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| child_id | UUID | FK to Child |
| milestone_id | UUID | FK to Milestone |
| achieved | boolean | Yes / Not yet |
| observed_date | date | When parent observed it |
| notes | text | Optional |

### GrowthMeasurement
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| child_id | UUID | FK to Child |
| measured_date | date | |
| height_cm | float | Body height/length |
| weight_kg | float | Body weight |
| head_circumference_cm | float | Head circumference |
| linked_u_exam_record_id | UUID | FK to UExamRecord (optional) |
| notes | text | |
| created_at | timestamp | |

### AIInsight (cached AI-generated content)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| child_id | UUID | FK to Child |
| type | enum | growth_trend, dietary, activity, doctor_questions, exam_prep |
| content | jsonb | Structured AI response |
| language | enum | en, de |
| triggered_by | string | "measurement_added", "milestone_updated", "exam_upcoming", "manual" |
| valid_until | timestamp | Cache expiry (regenerate after new data or 7 days) |
| created_at | timestamp | |

### DocumentScan
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| child_id | UUID | FK to Child |
| document_type | enum | u_heft_page, impfpass_page, growth_chart |
| image_url | string | Temporary storage URL (deleted after processing) |
| extracted_data | jsonb | Raw AI extraction result |
| status | enum | processing, review, confirmed, failed |
| created_at | timestamp | |

### Appointment (Termin)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| child_id | UUID | FK to Child |
| pediatrician_id | UUID | FK to Pediatrician (optional) |
| date_time | timestamp | |
| type | enum | u_exam, vaccination, dental, sick_visit, other |
| status | enum | scheduled, completed, cancelled |
| linked_u_exam_id | UUID | FK to UExam (optional) |
| notes | text | |
| created_at | timestamp | |
| updated_at | timestamp | |

### Reminder
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| type | enum | u_exam, vaccination, appointment, masern_compliance |
| reference_id | UUID | Polymorphic FK |
| reference_type | string | "u_exam_record", "vaccination_record", "appointment" |
| remind_at | timestamp | When to send |
| channel | enum | email |
| sent | boolean | |
| created_at | timestamp | |

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14+ (App Router) | Full-stack React, SSR, API routes, mobile-friendly PWA |
| Language | TypeScript (strict mode) | Type safety across the stack |
| Database | Supabase (PostgreSQL) | Auth, RLS, real-time, storage, Edge Functions |
| Auth | Supabase Auth (email/password + magic link) | Simple email-based auth |
| AI SDK | `@anthropic-ai/claude-agent-sdk` (Claude Agent SDK) | Agentic AI via `query()` + MCP tools -- agents read DB, reason, write back |
| AI Model | `claude-sonnet-4-6` (API alias, latest Sonnet) | Vision for document scanning, text for insights. $3/MTok in, $15/MTok out |
| Email | Resend (`resend` npm package) | Transactional reminder emails |
| Styling | Tailwind CSS | Utility-first, responsive, custom design system |
| Charts | Recharts or Chart.js | Growth percentile curves |
| PDF Export | @react-pdf/renderer | Teilnahmekarte and record exports |
| i18n | next-intl | English/German internationalization |
| Hosting | Vercel | Edge-optimized, EU region available |
| Data residency | Supabase EU region (Frankfurt) | DSGVO compliance |
| Testing | Jest + React Testing Library | TDD workflow |

### Why Claude Agent SDK (not raw API calls)

The Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) enables **agentic AI** -- instead of static prompt→response calls, agents can use tools, reason over multiple steps, and interact with the database intelligently. This makes KidsVax a **smart system** rather than a wrapper around API calls.

**What this means in practice:**

| Capability | Raw API Call | Agent SDK |
|-----------|-------------|-----------|
| Scan a document | Send image → get JSON back | Agent sees the image, queries the DB for existing records, identifies what's new vs. duplicate, resolves conflicts, writes to DB |
| Growth insights | Send measurements → get text back | Agent reads all measurements + milestones + upcoming exams, cross-references age-appropriate guidelines, generates contextual advice |
| Reminder content | Static template | Agent reads the child's full context (what was completed, what's overdue, growth trends) and writes a personalized email |
| Exam preparation | Send exam name → get generic text | Agent reads this child's milestone status, growth data, vaccination gaps, and generates a personalized preparation guide |
| Schedule adjustment | Hardcoded rules | Agent evaluates the child's actual history (delays, skips, premature status) and computes a catch-up schedule |

**How agents are built** (using Claude Agent SDK):

```typescript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// Define tools using the SDK's tool() helper + Zod schemas
const readChildProfile = tool(
  "read_child_profile",
  "Get a child's full profile including DOB, gender, allergies, premature status",
  { child_id: z.string().uuid() },
  async ({ child_id }) => {
    const child = await supabase.from("children").select("*").eq("id", child_id).single();
    return { content: [{ type: "text", text: JSON.stringify(child.data) }] };
  }
);

// Create an in-process MCP server with all tools
const healthDataServer = createSdkMcpServer({
  name: "kidsvax-health-data",
  tools: [readChildProfile, readGrowthData, readVaccinationRecords, /* ... */]
});

// Run the agent via query()
const result = query({
  prompt: "Analyze this child's growth data and generate insights",
  options: {
    model: "claude-sonnet-4-6",
    mcpServers: { "health-data": healthDataServer },
    permissionMode: "bypassPermissions",
    maxTurns: 10,
    systemPrompt: "You are a pediatric health assistant..."
  }
});

for await (const message of result) {
  if (message.type === "result") {
    return message.result; // Final agent output
  }
}
```

**MCP tools available** (defined via `tool()` + `createSdkMcpServer()`):
- `read_child_profile` -- get child's full data
- `read_growth_data` -- get all measurements + percentile positions
- `read_vaccination_records` -- get vaccination history
- `read_u_exam_records` -- get U-exam history
- `read_milestones` -- get milestone status
- `write_vaccination_record` -- create/update a vaccination record (scan agent only)
- `write_u_exam_record` -- create/update a U-exam record (scan agent only)
- `write_growth_measurement` -- add a growth measurement (scan agent only)
- `compute_percentile` -- calculate where a measurement falls on WHO/RKI curves
- `get_stiko_schedule` -- get the recommended vaccination schedule for an age
- `get_u_exam_schedule` -- get the recommended U-exam schedule for an age

Agents are **stateless per request** -- each API route creates a fresh `query()` call with the relevant MCP server. No persistent agent sessions. All state lives in Supabase.

---

## API Routes (Next.js App Router)

### Auth (handled by Supabase client)
- Supabase Auth handles signup, login, logout, password reset, magic link

### Children
- `GET /api/children` -- List user's children (used by multi-child dashboard)
- `POST /api/children` -- Add child (triggers schedule generation)
- `GET /api/children/[id]` -- Get child with all related data
- `PUT /api/children/[id]` -- Update child
- `DELETE /api/children/[id]` -- Remove child and all related records

### U-Exams
- `GET /api/children/[id]/u-exams` -- Get all U-exam records for child
- `PUT /api/u-exam-records/[id]` -- Update U-exam record (mark completed, add notes)
- `GET /api/u-exams` -- List all U-exam definitions (reference data)

### Vaccinations
- `GET /api/children/[id]/vaccinations` -- Get all vaccination records for child
- `PUT /api/vaccination-records/[id]` -- Update vaccination record
- `GET /api/vaccines` -- List all vaccine definitions (reference data)

### Growth
- `GET /api/children/[id]/growth` -- Get all measurements
- `POST /api/children/[id]/growth` -- Add measurement (triggers AI insight generation if notable change)
- `PUT /api/growth/[id]` -- Update measurement
- `DELETE /api/growth/[id]` -- Remove measurement

### Milestones
- `GET /api/children/[id]/milestones` -- Get milestone records grouped by U-exam
- `PUT /api/milestone-records/[id]` -- Toggle achieved status

### AI Features
- `POST /api/scan` -- Upload document image, extract data via Claude Vision. Returns structured extraction for review.
- `POST /api/scan/confirm` -- Confirm extracted data, write to database
- `GET /api/children/[id]/insights` -- Get cached AI insights (growth trends, dietary suggestions, doctor questions)
- `POST /api/children/[id]/insights/refresh` -- Regenerate insights with latest data
- `GET /api/children/[id]/exam-prep/[examId]` -- Get AI-generated exam preparation guide

### Appointments
- `GET /api/appointments` -- List appointments (filterable by child)
- `POST /api/appointments` -- Create appointment
- `PUT /api/appointments/[id]` -- Update
- `DELETE /api/appointments/[id]` -- Cancel

### Export
- `GET /api/children/[id]/teilnahmekarte` -- Generate Teilnahmekarte PDF
- `GET /api/children/[id]/export` -- Full data export (PDF or JSON)
- `POST /api/children/[id]/share` -- Generate temporary share link with QR

### Pediatricians
- `GET /api/pediatricians` -- List user's saved pediatricians
- `POST /api/pediatricians` -- Add
- `PUT /api/pediatricians/[id]` -- Update
- `DELETE /api/pediatricians/[id]` -- Remove

---

## MVP Scope (Phase 1)

1. Email-based authentication (signup, login, password reset, magic link)
2. Add/manage multiple children (name, DOB, gender, premature flag)
3. **Multi-child dashboard** with per-child summary cards, urgency ordering, next-up items
4. Child detail dashboard with upcoming items, overdue alerts, quick stats
5. Auto-generated U-Untersuchungen schedule (U1-U9, with tolerance windows)
6. Auto-generated STIKO vaccination schedule (all standard childhood vaccines)
7. Mark U-exams and vaccinations as completed/skipped with details
8. Timeline view of all exams and vaccinations
9. Masernschutzgesetz compliance indicator
10. Email reminders for upcoming U-exams and vaccinations
11. **AI document scanning**: Photograph U-Heft and Impfpass pages, extract data via Claude Vision
12. **AI growth insights**: Dietary suggestions, activity tips, and doctor questions when growth data changes
13. Growth charts with percentile curves
14. Developmental milestone checklists
15. Bilingual interface (English default + German)
16. Mobile-responsive design
17. Bundesland selection (mandatory vs. recommended U-exam badges)

## Phase 2
- **AI exam preparation guides**: Personalized pre-visit summaries with questions to ask
- Digital Teilnahmekarte with PDF export and QR code sharing
- Appointment management
- Pediatrician contact storage
- Dental exam tracking (Z1-Z6)
- Screening documentation (newborn metabolic, hearing, hip, etc.)
- Offline support (PWA with service worker caching)

## Phase 3
- J1, J2, U10, U11 exam support
- Catch-up vaccination schedules for delayed vaccinations
- Multiple guardians per child (family sharing)
- Full data export as JSON (FHIR R4 compatible for future ePA interoperability)
- Push notifications (Web Push API)

## Phase 4 (Future)
- DiGA certification pathway (BfArM Fast-Track for health insurer reimbursement)
- ePA / Telematikinfrastruktur integration
- Pediatrician portal (doctor-side features)
- Insurance company B2B partnerships
- Additional languages (Turkish, Arabic, Ukrainian -- largest immigrant communities)

---

## Non-Functional Requirements

### Security & Privacy
- All data encrypted at rest (Supabase default) and in transit (TLS 1.3)
- DSGVO/GDPR compliant: explicit consent, data minimization, right to deletion
- Data hosted in EU (Supabase Frankfurt region / Vercel EU)
- No tracking, no analytics cookies, no third-party data sharing
- Clear privacy policy (Datenschutzerklärung) in EN and DE
- Impressum page (legally required in Germany)
- Row Level Security (RLS) on all tables: users can only access their own data
- Account deletion fully removes all user data within 30 days
- **AI privacy**: No PII sent to Anthropic API. Only anonymized health data (age, gender, measurements). Images processed and deleted. Disclosure in privacy policy.
- Anthropic API key stored server-side only, never exposed to client

### Performance
- Largest Contentful Paint (LCP) < 2.5s on 3G mobile
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Time to Interactive < 3s on mobile
- Lighthouse score > 90 for Performance, Accessibility, Best Practices
- AI scan processing < 5s average response time
- AI insights generation < 3s average response time

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support with proper ARIA labels (EN and DE)
- Keyboard navigation
- Minimum contrast ratio 4.5:1
- Respects `prefers-reduced-motion` and `prefers-color-scheme`
- No information conveyed by color alone

### Reliability
- 99.9% uptime target
- Graceful degradation when Supabase is unreachable
- Graceful degradation when Anthropic API is unreachable (AI features show "temporarily unavailable", core app works fully)
- Data validation on both client and server
- Automated backups via Supabase

### Legal
- Impressum (mandatory for German websites)
- Datenschutzerklärung (privacy policy) covering AI data processing
- Cookie consent banner (minimal -- no tracking cookies, inform of essential cookies only)
- Terms of Service
- AI disclaimer on all generated content: "General guidance, not medical advice"
- DPIA (Data Protection Impact Assessment) completed before launch
