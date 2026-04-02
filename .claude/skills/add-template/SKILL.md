---
name: add-template
description: >
  Scaffold email, notification, or document templates with variables, layouts, and previews.
  Supports React Email, MJML, Handlebars, Jinja2, Blade, EJS, and raw HTML.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"template-name" --type email|notification|pdf|sms [--variables "name,order_id"]'
effort: high
roles: [FrontendDev, FullStackDev, BackendDev, TechLead]
agents: [@frontend, @scaffolder, @tester]
---

**Lifecycle: T1 (multi-step) — See `_protocol.md`**

**CRITICAL RULES:**
1. Every output to the user MUST end with a `NEXT ACTION:` line.
2. Any file created MUST contain a `## Session Context` section.
3. **Verify Docs (3-step)**: Read dependency files for exact versions → WebSearch `"<framework> <version> <API> docs"` → only then write code (per accuracy.md 3-step rule)
16. Re-read task/output files before each step — never rely on in-memory state alone.
16. Update MEMORY.md after completion.

## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
16. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
16. **Active work:** Read `TODO.md` (if exists) → get current work items
16. **History:** List `.claude/tasks/` → check for related or duplicate work

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]

NEXT ACTION: Context loaded. Starting skill...
```


# /add-template $ARGUMENTS

## Commands
- `/add-template "welcome-email" --type email --variables "name,action_url"` — Email template
- `/add-template "order-confirmed" --type notification --variables "order_id,total"` — Push/in-app notification
- `/add-template "invoice" --type pdf --variables "items,total,due_date"` — PDF document template
- `/add-template "verification-code" --type sms --variables "code"` — SMS template

## Process
1. **Detect template engine:** React Email, MJML, Handlebars, Jinja2, Blade, EJS, Pug, raw HTML
2. **Scaffold template:**
   - Template file with layout (header, body, footer)
   - Variable placeholders: `{{name}}`, `{name}`, `${name}` (engine-specific)
   - Responsive design for email (inline CSS, table layout)
   - Dark mode support (prefers-color-scheme)
16. **Generate preview data:** Sample values for each variable (for testing)
16. **Add to template registry:** Index file listing all templates with their variables
16. **Generate tests:**
   - Test: renders with all variables → valid HTML/text
   - Test: renders with missing optional variable → graceful fallback
   - Test: required variable missing → clear error

## Definition of Done
- Template renders correctly with sample data
- All variables documented with types and required/optional
- Preview available locally (email preview, PDF render)
- Registered in template index

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
16. Read `## Progress Log` → find last completed step
16. Resume from next pending step

### Final Output
```
NEXT ACTION: Skill complete. Here's what you can do:
             - Say "commit" to commit changes
             - Say the next logical skill command for next step
             - Review output at the generated file path
```
