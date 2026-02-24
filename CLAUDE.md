# CLAUDE.md

## Skills
Read and follow these skills before writing any code:
- .claude/skills/base/SKILL.md
- .claude/skills/security/SKILL.md
- .claude/skills/project-tooling/SKILL.md
- .claude/skills/session-management/SKILL.md
- .claude/skills/typescript/SKILL.md
- .claude/skills/react-web/SKILL.md
- .claude/skills/supabase/SKILL.md
- .claude/skills/database-schema/SKILL.md
- .claude/skills/agent-teams/SKILL.md

## Project Overview
KidsVax is a mobile-friendly web application that digitizes the German Gelbes Heft (U-Heft) and Impfpass into a single, clean interface for parents. It auto-generates U-Untersuchungen and STIKO vaccination schedules based on each child's DOB, sends email reminders, and provides a shareable digital Teilnahmekarte. Parents can photograph paper records and AI (Anthropic Claude) extracts the data. AI also provides growth insights, dietary guidance, and doctor visit questions. Built for the German market, bilingual (EN default / DE). Parents-only portal (no doctor-side features).

## Tech Stack
- Language: TypeScript
- Framework: Next.js (App Router)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email/password + magic link)
- AI SDK: `@anthropic-ai/claude-agent-sdk` (Claude Agent SDK) -- agentic AI via `query()` + MCP tools
- AI Model: `claude-sonnet-4-6` (API alias, latest Sonnet) -- vision for document scanning, text for insights
- Email: Resend (`resend` npm package) -- transactional reminder emails
- Storage: Supabase Storage
- Styling: Tailwind CSS
- i18n: next-intl (English default, German)
- Testing: Jest + React Testing Library

## Key Commands
```bash
# Verify all CLI tools are working
./scripts/verify-tooling.sh

# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run typecheck

# Pre-commit hooks (run once after clone)
npx husky init

# Database
npm run db:start       # Start local Supabase
npm run db:migrate     # Push migrations

# Development
npm run dev            # Start Next.js dev server
```

## Documentation
- `SPEC.md` - Full product specification
- `docs/` - Technical documentation
- `_project_specs/` - Project specifications and todos

## Atomic Todos
All work is tracked in `_project_specs/todos/`:
- `active.md` - Current work
- `backlog.md` - Future work
- `completed.md` - Done (for reference)

Every todo must have validation criteria and test cases. See base.md skill for format.

## Session Management

### State Tracking
Maintain session state in `_project_specs/session/`:
- `current-state.md` - Live session state (update every 15-20 tool calls)
- `decisions.md` - Key architectural/implementation decisions (append-only)
- `code-landmarks.md` - Important code locations for quick reference
- `archive/` - Past session summaries

### Automatic Updates
Update `current-state.md`:
- After completing any todo item
- Every 15-20 tool calls during active work
- Before any significant context shift
- When encountering blockers

### Decision Logging
Log to `decisions.md` when:
- Choosing between architectural approaches
- Selecting libraries or tools
- Making security-related choices
- Deviating from standard patterns

### Context Compression
When context feels heavy (~50+ tool calls):
1. Summarize completed work in current-state.md
2. Archive verbose exploration notes to archive/
3. Keep only essential context for next steps

### Session Handoff
When ending a session or approaching context limits, update current-state.md with:
- What was completed this session
- Current state of work
- Immediate next steps (numbered, specific)
- Open questions or blockers
- Files to review first when resuming

### Resuming Work
When starting a new session:
1. Read `_project_specs/session/current-state.md`
2. Check `_project_specs/todos/active.md`
3. Review recent entries in `decisions.md` if context needed
4. Continue from "Next Steps" in current-state.md

## Agent Teams (Default Workflow)

This project uses Claude Code Agent Teams as the default development workflow.
Every feature is implemented by a dedicated agent following a strict TDD pipeline.

### Strict Pipeline (per feature)
Spec > Spec Review > Tests > RED Verify > Implement > GREEN Verify > Validate > Code Review > Security Scan > Branch + PR

### Team Roster
- **Team Lead**: Orchestrates, breaks work into features, assigns tasks (NEVER writes code)
- **Quality Agent**: Verifies TDD discipline - RED/GREEN phases, coverage >= 80%
- **Security Agent**: OWASP scanning, secrets detection, dependency audit
- **Code Review Agent**: Multi-engine code reviews (Claude/Codex/Gemini)
- **Merger Agent**: Creates feature branches and PRs via gh CLI
- **Feature Agents**: One per feature, follows strict TDD pipeline

### Commands
- `/spawn-team` - Spawn the agent team (auto-run after init, or run manually)

### Required Environment
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

## Development Methodology: Test-Driven Development (TDD)

All code in this project MUST follow strict TDD. No exceptions.

### The TDD Cycle
1. **RED** - Write a failing test first that describes the desired behavior
2. **GREEN** - Write the minimum code to make the test pass
3. **REFACTOR** - Clean up the code while keeping tests green

### Rules
- Never write production code without a failing test first
- Each test should test one behavior/scenario
- Run tests after every change to confirm RED or GREEN status
- Aim for >= 80% code coverage
- Tests are documentation: name them clearly (e.g., `it("should calculate next vaccine due date from DOB")`)

### What to Test
- **Unit tests**: Business logic, utilities, schedule calculations, data transformations
- **Integration tests**: API endpoints, database queries, Supabase RLS policies
- **Component tests**: React components with React Testing Library
- **Edge cases**: Null/undefined inputs, boundary dates, timezone handling

### What NOT to Test
- Third-party library internals
- Simple pass-through wrappers with no logic
- Static configuration objects

## Project-Specific Patterns

### German Health System
- Vaccination schedule follows **STIKO recommendations** (not CDC/WHO)
- U-Untersuchungen follow the official **G-BA Kinderuntersuchungsheft** structure
- Each U-exam has a recommended age AND a tolerance window -- both must be tracked
- Masernschutzgesetz: measles vaccination is legally mandatory for daycare/school entry
- Bundesland determines whether U-exams are mandatory (Bayern, Hessen, BaWü) or monitored
- Premature infants (Frühgeborene) use a 3+1 hexavalent schedule instead of 2+1
- Dental exams Z1-Z6 are new from Jan 2026

### Architecture
- Use Next.js App Router with Server Components by default, Client Components only when needed
- API routes go in `app/api/` using Next.js Route Handlers
- Email reminders via Supabase Edge Functions + Resend
- All data hosted in EU (Supabase Frankfurt region)
- Bilingual: all user-facing strings must exist in EN and DE (use next-intl). English is default.
- Date format: DD.MM.YYYY (German standard, both languages)
- Parents-only portal. No doctor-side features in current scope.

### AI Rules (Anthropic Claude Agent SDK)
- **Primary AI**: Anthropic Claude is the only AI provider. No OpenAI, no Gemini.
- **SDK**: Use `@anthropic-ai/claude-agent-sdk` (Claude Agent SDK). Use `query()` to run agents, `tool()` + `createSdkMcpServer()` to define tools. NOT raw Anthropic API calls.
- **Model**: `claude-sonnet-4-6` (API alias) for both vision (document scanning) and text (insights generation). Use `claude-haiku-4-5` for lightweight tasks (e.g., translation) if needed.
- **Agentic architecture**: Each AI feature creates a `query()` call with an in-process MCP server providing tools:
  - **Scan agent**: vision + DB read/write tools. Extracts data from photos, deduplicates against existing records, resolves conflicts.
  - **Insights agent**: DB read tools + compute_percentile tool. Reads child's full context, reasons over it, generates personalized guidance.
  - **Reminder agent**: DB read tools. Reads child context, generates personalized email content (not static templates).
- **Server-side only**: All `query()` calls go through Next.js API routes. ANTHROPIC_API_KEY in env, never exposed to client.
- **Permission mode**: Use `permissionMode: "bypassPermissions"` in server-side agents (they only access our own MCP tools, not filesystem).
- **No PII to API**: Send only anonymized data (age, gender, measurements). Never send child names, parent emails, or identifiable info.
- **Scanned images**: Processed and deleted after extraction. Never stored permanently.
- **AI insights are cached**: Store in AIInsight table with expiry. Regenerate only when new data is added or cache expires (7 days).
- **Safety**: AI never diagnoses, never prescribes, never contradicts STIKO/G-BA guidelines. Always recommends consulting pediatrician.
- **Disclaimer**: Every AI-generated insight must include "General guidance, not medical advice" disclaimer.
- **Invisible AI**: Don't label UI elements as "AI-powered" or use sparkle/brain icons. Show helpful content naturally.
- **Graceful degradation**: If Anthropic API is down, core app works fully. AI features show "temporarily unavailable".
- **Stateless agents**: Each API route creates a fresh `query()` call. No persistent sessions. All state lives in Supabase.
- **Cost control**: Use `maxTurns` and `maxBudgetUsd` options on `query()` to cap agent costs per request.

### Data Rules
- Child age calculations are always based on date_of_birth using exact month calculation (not 30-day approximation)
- All dates stored in UTC, displayed in Europe/Berlin timezone
- DSGVO/GDPR compliant: explicit consent, data minimization, right to deletion
- Row Level Security on all Supabase tables
- No tracking cookies, no analytics, no third-party data sharing
- Multi-child support is core: dashboard always shows all children with urgency ordering

### UI Rules
- Mobile-first responsive design (375px base)
- Clean, warm aesthetic: warm whites (#FAFAF8), sage green accent (#5B8C5A), no purple/violet
- No glassmorphism, no gradients, no gamification, no "AI" branding
- Content-first: data is the hero, generous whitespace
- Minimum touch target 44x44px, minimum font 14px body
- Forms use inline validation, destructive actions require confirmation
- Empty states are helpful, not decorative
- Multi-child dashboard: summary cards per child, ordered by urgency, tap to enter child detail
