<!--
UPDATE WHEN:
- Adding new entry points or key files
- Introducing new patterns
- Discovering non-obvious behavior

Helps quickly navigate the codebase when resuming work.
-->

# Code Landmarks

Quick reference to important parts of the codebase.

## Entry Points
| Location | Purpose |
|----------|---------|
| SPEC.md | Full product specification |
| CLAUDE.md | Claude Code project configuration |

## Core Business Logic
| Location | Purpose |
|----------|---------|
| TBD | Vaccination schedule calculator |
| TBD | Reminder scheduling engine |

## Configuration
| Location | Purpose |
|----------|---------|
| .env.example | Environment variable template |

## Key Patterns
| Pattern | Example Location | Notes |
|---------|------------------|-------|
| CDC Schedule Rules | TBD | Pre-loaded vaccine schedule data |
| Age Calculation | TBD | DOB-based due date computation |

## Testing
| Location | Purpose |
|----------|---------|
| TBD | Test files |

## Gotchas & Non-Obvious Behavior
| Location | Issue | Notes |
|----------|-------|-------|
| - | Timezone handling | All dates should be stored in UTC, displayed in local |
| - | Age in months | Use exact month calculation, not 30-day approximation |
