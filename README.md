# KidsVax - Das digitale Gelbe Heft & Impfpass

A mobile-friendly web application that digitizes the German **Gelbes Heft** (U-Heft) and **Impfpass** into a single, clean interface for parents. Built for the German market, available in English (default) and German.

## What It Does

German parents juggle two separate paper booklets per child — the Gelbes Heft for pediatric checkups and the Impfpass for vaccinations. These documents get lost, have no backup, provide no reminders, and are entirely in German.

KidsVax solves this by:

- **Auto-generating schedules** — U-exam (U1–U11, J1–J2) and STIKO vaccination schedules from each child's date of birth
- **AI document scanning** — Photograph paper records and Claude Vision extracts all data automatically
- **Growth tracking** — Height, weight, head circumference with WHO percentile curves
- **Developmental milestones** — Motor, language, and social/cognitive milestone checklists
- **Email reminders** — Notifications before exams and vaccinations are due
- **Masernschutzgesetz compliance** — Tracks mandatory measles vaccination status for daycare/school
- **Multi-child dashboard** — All children at a glance, ordered by urgency
- **AI-powered insights** — Personalized dietary guidance, activity suggestions, and doctor visit questions
- **Bilingual** — Full English and German support via next-intl

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL, Frankfurt region) |
| Auth | Supabase Auth (email/password + magic link) |
| AI | Anthropic Claude Agent SDK (`claude-sonnet-4-6`) |
| Email | Resend |
| Styling | Tailwind CSS |
| i18n | next-intl (EN default / DE) |
| Validation | Zod |
| Testing | Jest + React Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vercel CLI](https://vercel.com/docs/cli) (for deployment)

### Installation

```bash
git clone https://github.com/QudsiaPiracha/kidsvax.git
cd kidsvax
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Fill in your `.env` with:

```env
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Server-side only
DATABASE_URL=                     # Direct Postgres connection
ANTHROPIC_API_KEY=               # For AI features (document scanning, insights)
RESEND_API_KEY=                  # For email reminders
```

### Database Setup

```bash
supabase start          # Start local Supabase
supabase db push        # Apply migrations (16 tables, RLS, indexes)
```

### Development

```bash
npm run dev             # Start Next.js dev server at http://localhost:3000
```

### Testing

```bash
npm test                # Run all 441 tests
npm run test:coverage   # With coverage report
npm run test:watch      # Watch mode
```

### Linting & Type Checking

```bash
npm run lint            # ESLint
npm run typecheck       # TypeScript strict checks
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth pages (login, signup, forgot-password)
│   ├── (protected)/               # Authenticated pages (dashboard, child detail)
│   ├── api/                       # 15 API route handlers
│   └── page.tsx                   # Landing page
├── components/
│   ├── Dashboard/                 # Multi-child overview
│   ├── ChildCard/                 # Summary card per child
│   ├── ChildDetail/               # Detailed child view
│   ├── ChildForm/                 # Child profile form
│   └── Timeline/                  # Schedule timeline
├── lib/
│   ├── agents/                    # AI agent configs (scan, insights)
│   ├── services/                  # Domain services (children, growth, vaccinations...)
│   ├── validations/               # Zod schemas
│   ├── schedule-engine.ts         # U-exam & vaccination schedule generation
│   ├── masern-compliance.ts       # Measles law compliance
│   ├── percentile.ts              # WHO growth percentile calculations
│   └── reminder-scheduler.ts      # Email reminder scheduling
└── middleware.ts                  # Auth route protection

supabase/
├── migrations/
│   └── 00001_initial_schema.sql   # 16 tables, RLS policies, indexes
└── seed.sql                       # Reference data (20 U-exams, 11 vaccines, 33 milestones)

messages/
├── en.json                        # English translations
└── de.json                        # German translations
```

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/children` | List / create children |
| GET/PUT/DELETE | `/api/children/[id]` | Manage child profile |
| GET/POST | `/api/children/[id]/u-exams` | U-exam records |
| GET/POST | `/api/children/[id]/vaccinations` | Vaccination records |
| GET/POST | `/api/children/[id]/growth` | Growth measurements |
| GET/POST | `/api/children/[id]/milestones` | Developmental milestones |
| GET | `/api/children/[id]/insights` | AI growth insights |
| POST | `/api/children/[id]/insights/refresh` | Regenerate insights |
| POST | `/api/scan` | AI document scanning |
| POST | `/api/scan/confirm` | Confirm scanned data |
| GET/PUT | `/api/reminders` | Reminder preferences |

## Key Features in Detail

### Schedule Engine
Pure function that generates the complete U-exam and vaccination schedule from a child's date of birth. Supports premature infants (3+1 hexavalent schedule instead of 2+1). Uses exact month calculation, not 30-day approximation.

### AI Document Scanning
Parents photograph their paper U-Heft or Impfpass. Claude Vision extracts structured data (dates, vaccines, findings), deduplicates against existing records, and lets parents confirm before saving.

### Growth Percentiles
WHO reference data for height, weight, and BMI. Detects percentile crossings (e.g., dropping from 75th to 25th) and triggers AI insights for dietary or activity guidance.

### Masernschutzgesetz Compliance
Tracks whether a child meets Germany's mandatory measles vaccination requirements for daycare and school entry. Returns `compliant`, `non_compliant`, or `not_yet_required`.

## German Health System Context

- **U-Untersuchungen**: 14 pediatric checkups (U1–U9, U10–U11, J1–J2) + 6 dental exams (Z1–Z6) per the G-BA Kinderuntersuchungsheft
- **STIKO vaccination schedule**: Official immunization recommendations from the Robert Koch Institute
- **Masernschutzgesetz**: Measles vaccination is legally mandatory for daycare/school entry
- **Bundesland rules**: Some states (Bayern, Hessen, BaWu) make U-exams mandatory; others monitor participation

## Design

- **Mobile-first** responsive design (375px base)
- **Warm aesthetic**: warm whites (`#FAFAF8`), sage green (`#5B8C5A`), terracotta (`#C45C3E`)
- **Content-first**: data is the hero, generous whitespace, no gamification
- **DSGVO/GDPR compliant**: EU data hosting, no tracking, no third-party data sharing

## Deployment

The project is configured for deployment on [Vercel](https://vercel.com) with Supabase as the database backend.

```bash
vercel              # Deploy to preview
vercel --prod       # Deploy to production
```

## License

Private project.
