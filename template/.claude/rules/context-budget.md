---
paths:
  - "**/*"
---
# Context Budget Enforcement

## Hard Limits
- Root CLAUDE.md: max 150 lines (hard 200) | Module CLAUDE.md: max 80 lines
- Rules: max 50 lines each, MUST have `paths:` | Skills: MUST use `context: fork` for >30 lines
- Startup: <20% | Working: <60% — auto-monitored by `context-monitor` hook

## Auto-Monitoring
The `context-monitor` hook warns at ~45% (YELLOW), ~60% (ORANGE), ~75% (RED).
Act on warnings immediately. Run `/context-check` for precise measurement.

## Actions
- **>60%:** `/compact "focus on [current task/phase]"` — compact now
- **>75%:** Compact aggressively, consider session split
- **Between tasks:** `/clear` — never reuse a bloated session
