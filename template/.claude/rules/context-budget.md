---
paths:
  - "**/*"
---
# Context Budget Enforcement

## Limits
- Root CLAUDE.md: max 150 lines (hard limit 200)
- Module CLAUDE.md: max 80 lines each
- Rules: max 50 lines each, MUST have `paths:` for scoping
- Skills: MUST use `context: fork` for anything over 30 lines
- MCP servers: max 5 active, scoped to agents via `mcpServers:`
- Startup: under 20% context
- Working: under 60% context — THIS IS THE HARD BUDGET

## Runtime Enforcement
- Run `/context-check` between EVERY workflow phase transition
- If context > 60%: STOP and compact before continuing
- If context > 75%: compact aggressively, consider session split
- Compact command: `/compact "focus on [current task/phase]"`
- `/clear` between unrelated tasks — never reuse a bloated session

## What Costs Zero
- Subagent context (separate window)
- `context: fork` skills (isolated)
- Templates, profiles, docs (never auto-loaded)
- Agent bodies (load only in subagent)

## What Accumulates (danger)
- File reads in main context stay in history
- Agent results returned to main context
- Bash outputs (especially long ones)
- Non-forked skill invocations
- Inline code review diffs
