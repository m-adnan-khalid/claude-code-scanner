---
name: setup-smithery
description: Install Smithery skills and MCP servers matching the project tech stack. Use after /generate-environment.
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Bash, Grep
context: fork
roles: [TechLead, DevOps, CTO]
agents: [@team-lead, @infra]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. Re-read task/output files before each step — never rely on in-memory state alone.
4. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# Setup Smithery: $ARGUMENTS

Read `.claude/scan-results.md` for tech stack. Install matching skills and MCP servers.

## Always Install
```bash
smithery skill add anthropics/skill-creator --agent claude-code
smithery skill add anthropics/frontend-design --agent claude-code
smithery skill add anthropics/webapp-testing --agent claude-code
smithery skill add anthropics/mcp-builder --agent claude-code
smithery skill add anthropics/pdf --agent claude-code
```

## Conditional on Tech Stack
- React/Expo → `smithery skill search "react"`, Expo skills
- shadcn/ui → shadcn skill
- Playwright → anthropics/webapp-testing
- Security code → Trail of Bits security skills
- Docker/K8s → `smithery skill search "docker kubernetes"`
- GitHub Actions → `smithery skill search "github actions"`

## MCP Servers (scope to agents, max 5)
- GitHub → @api-builder, @infra
- PostgreSQL/MongoDB → @api-builder
- Playwright → @frontend
- AWS/GCP → @infra
- Slack/Sentry → global (if used)

## After Install
Run `/context-check` to verify under 60%. Remove low-priority items if over budget.

## Definition of Done
- Matching MCP servers installed, scoped to relevant agents, `/context-check` confirms budget OK.

## Next Steps
- `/validate-setup` to verify, `/workflow new` to start.

## Rollback
- **Remove MCP servers:** Edit `.claude/settings.json` — remove entries from `mcpServers`
- **Verify removal:** `/validate-setup` to confirm clean state
- **Re-install selectively:** `/setup-smithery --only "server-name"` to add specific servers

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** [summary of what was done]
- **When:** [timestamp]
- **Result:** [COMPLETE | PARTIAL | BLOCKED]
- **Output:** [file path if any]
- **Next Step:** [recommended next action]

### Update TODO
If this work was linked to a TODO item, mark it done. If follow-up needed, add new TODO.

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Context Recovery
If context is lost (compaction, pause, resume):
1. Find most recent `.claude/tasks/` file with `Phase: IN_PROGRESS`
2. Read `## Session Context` → restore state
3. Read `## Progress Log` → find last completed step
4. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
