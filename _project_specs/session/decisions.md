<!--
LOG DECISIONS WHEN:
- Choosing between architectural approaches
- Selecting libraries or tools
- Making security-related choices
- Deviating from standard patterns

This is append-only. Never delete entries.
-->

# Decision Log

Track key architectural and implementation decisions.

## Format
```
## [YYYY-MM-DD] Decision Title

**Decision**: What was decided
**Context**: Why this decision was needed
**Options Considered**: What alternatives existed
**Choice**: Which option was chosen
**Reasoning**: Why this choice was made
**Trade-offs**: What we gave up
**References**: Related code/docs
```

---

## [2026-02-24] Tech Stack Selection

**Decision**: React Native (Expo) + Node.js/Express + Supabase
**Context**: Need cross-platform mobile app with backend for vaccination tracking
**Options Considered**: Flutter, native iOS/Android, Next.js with React Native Web
**Choice**: Expo (React Native) + Express + Supabase
**Reasoning**: Single JS/TS codebase across frontend and backend. Expo simplifies push notifications (critical feature). Supabase provides auth, RLS, real-time, and storage out of the box.
**Trade-offs**: Expo managed workflow limits some native module access; acceptable for MVP scope.
**References**: SPEC.md

## [2026-02-24] Offline-First Architecture

**Decision**: Core schedule viewing works offline
**Context**: Parents need to check vaccination schedules even without internet
**Options Considered**: Online-only, full offline sync, partial offline
**Choice**: Partial offline - schedule data cached locally, sync when connected
**Reasoning**: Vaccination schedules are relatively static data that can be pre-computed and cached. Appointments and records sync when online.
**Trade-offs**: More complex state management, potential sync conflicts
**References**: SPEC.md Non-Functional Requirements
