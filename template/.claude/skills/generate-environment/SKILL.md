---
name: generate-environment
description: Generate complete Claude Code environment from scan results. Use after /scan-codebase completes.
user-invocable: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
context: fork
effort: high
roles: [CTO, TechLead, Architect, DevOps]
agents: [@team-lead, @architect, @scaffolder]
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


# Generate Environment: $ARGUMENTS

## Prerequisite Check
Before generating, verify these files exist:
1. `.claude/scan-results.md` — if NOT found: STOP, run `/scan-codebase` first.
2. `.claude/project/TECH_MANIFEST.json` — if NOT found: WARN, generation will use scan-results.md only (less precise).

Read `.claude/scan-results.md` AND `.claude/project/TECH_MANIFEST.json` (from /scan-codebase). Use TECH_MANIFEST.json as the primary source for exact versions, framework names, and dependency lists. Use scan-results.md for patterns, conventions, and architecture details. Replace ALL `{placeholders}` with actual values. If a value wasn't found, OMIT that section — never leave placeholders.

**Post-Generation Placeholder Gate:** After generating all files, run `grep -r '{[a-z_]*}' .claude/` to verify zero remaining placeholders. If ANY found, fix them before proceeding.

## Customization Preservation (Smart Mode)

When regenerating an EXISTING environment (`.claude/` already exists):

**Default behavior (no flags):** Smart merge — add new files, skip existing customized files.
**`--force` flag:** Overwrite everything (destructive, use for full reset).
**`--preserve-custom` flag:** Explicitly protect files the user has modified.

### Smart merge logic:
1. Before generation, snapshot ALL existing `.claude/` file hashes to `.claude/reports/pre-regen-snapshot.json`
2. For each file to generate:
   - If file does NOT exist → CREATE (new file from template)
   - If file exists AND hash matches manifest → OVERWRITE (unmodified, safe to update)
   - If file exists AND hash DIFFERS from manifest → SKIP + WARN (user customized this file)
3. After generation, output a diff report:
   - `ADDED: N new files`
   - `UPDATED: N unmodified files refreshed`
   - `PRESERVED: N custom files kept (user-modified)`
   - `SKIPPED: N files unchanged`
4. Update manifest.json with new hashes for added/updated files only

### Preserved paths (NEVER overwritten, any mode):
- `.claude/project/` — task registry, stories, tasks, pre-dev docs
- `.claude/tasks/` — active task files
- `.claude/reports/` — audit logs, drift reports
- `settings.local.json` — user's local settings
- `MEMORY.md`, `TODO.md`, `AUDIT_LOG.md` — session state

### Force mode (--force):
Overwrites ALL template files (agents, skills, hooks, rules, settings.json, CLAUDE.md).
Preserved paths above are still protected.

**Post-Generation Placeholder Gate:** After generating all files, run `grep -r '{[a-z_]*}' .claude/` to verify zero remaining placeholders. If ANY are found, fix them immediately before proceeding to validation. This is a hard gate — generation is not complete until zero placeholders remain.

**Post-Generation Syntax Gate:** After generating hook scripts, run `node -c` on each `.js` file in `.claude/hooks/` to verify JavaScript syntax. If ANY fail, fix immediately.

**Reference files in this skill directory:**
- `artifact-templates.md` — full CLAUDE.md template, rule templates, settings.json, hook scripts, profiles, code template extraction instructions
- `additional-skills.md` — all skill SKILL.md templates to generate
- `domain-agents.md` — frontend, api-builder, infra agent templates

## Generate These Files (in order):

### 1. Root CLAUDE.md (max 150 lines)
```
# Project: {name}
## Tech Stack (exact versions from scan)
## Quick Commands (every build/test/lint/dev/migrate command)
## Architecture (3-5 lines: type, pattern, data flow, auth, API style)
## Code Style (ONLY rules differing from linter defaults)
## Git Conventions (branch pattern, commit format, PR requirements)
## Key Paths (entry points, handlers, services, models, tests, config, generated DO NOT EDIT)
## Gotchas (non-obvious things with file:line refs)
## Testing (framework, commands, patterns)
@.claude/rules/domain-terms.md
```

### 2. Nested CLAUDE.md (per module, max 80 lines each)
Only for monorepo packages or distinct modules.

### 3. .claude/rules/ (max 50 lines each, with paths: frontmatter)
- `domain-terms.md` — business glossary (paths: **/*)
- `api.md` — endpoint conventions (paths: src/api/**)
- `testing.md` — test patterns (paths: **/*.test.*, tests/**)
- `database.md` — migration/query rules (paths: src/db/**, migrations/**)
- `frontend.md` — component patterns (paths: src/components/**, app/**)
- `security.md` — input validation, auth, PII rules (paths: src/auth/**, src/api/**)
- `infrastructure.md` — Docker, CI, IaC rules (paths: Dockerfile*, .github/workflows/**)
- `code-standards.md` — structure, naming, SOLID, constants, imports (paths: all source files)
- `code-safety.md` — type safety, error handling, testability, concurrency, resources (paths: all source files)
- `code-platform.md` — database, API design, i18n, platform-specific patterns (paths: all source files)
- `logging.md` — structured logging, levels, PII masking, correlation IDs (paths: all source files)
- `accuracy.md` — verify imports, API signatures, external framework docs before coding (paths: all source files)
- `request-validation.md` — scope-check, clarify before implementing (paths: all source files)
- `prompt-efficiency.md` — output rules, tool use rules, anti-patterns (paths: all)
- `context-budget.md` — CLAUDE.md/rule line limits, startup/working context (paths: all)
- `task-brief.md` — task file structure and lifecycle (paths: .claude/tasks/**)
- `task-lifecycle.md` — phase progression and status transitions (paths: .claude/tasks/**)
- Generate additional rules ONLY if codebase demands them.

### 4. .claude/agents/ (see agents/ directory and domain-agents.md for templates)
**Always generate (SDLC roles — 4):** team-lead, architect, product-owner, qa-lead
**Always generate (core — 6):** explorer, reviewer, security, debugger, tester, code-quality
**Always generate (pre-dev — 4):** ideator, strategist, scaffolder, ux-designer
**Always generate (governance — 5):** cto, gatekeeper, output-validator, process-coach, docs-writer
**Always generate (data — 2):** database, qa-automation
**Always generate (operations — 3):** observability-engineer, incident-responder, performance-engineer
**Always generate (specialist — 2):** analyst, version-manager
**Generate if layer exists (dev — 4):** frontend, api-builder, infra, mobile
**Total: 30 agents (26 always + 4 conditional)**

All agents MUST include:
- `memory: project` for cross-session persistence
- `disallowedTools` on read-only agents (Edit, Write, Bash)
- `permissionMode: plan` on read-only agents
- `isolation: worktree` on parallel dev agents (frontend, api-builder)
- Structured output format section
- HANDOFF block in output format
- Limitations section with explicit DO NOT rules
- Model: haiku (fast checks), sonnet (routine), opus (complex reasoning)
- Set `maxTurns`, `effort`, `tools` per agent
- Scope `mcpServers:` per agent

### 5. .claude/skills/ (see skills/ directory for templates)
**Always generate (SDLC — 13):** workflow, task-tracker, progress-report, metrics, execution-report, context-check, sync, impact-analysis, rollback, validate-setup, generate-environment, scan-codebase, setup-smithery
**Always generate (pre-dev — 11):** brainstorm, product-spec, feature-map, domain-model, tech-stack, architecture, scaffold, deploy-strategy, new-project, idea-to-launch, import-docs
**Always generate (MVP — 4):** mvp-kickoff, mvp-status, launch-mvp, clarify
**Always generate (post-launch — 2):** release-notes, cost-estimate
**Generate based on stack:** add-feature, add-endpoint, add-component, add-page, fix-bug, review-pr, qa-plan, signoff, deploy, migrate, onboard, standup, design-review, discover-skills
- Heavy skills: `context: fork`
- Side-effect skills: `disable-model-invocation: true`

### 6. .claude/settings.json
Permissions (allow trusted commands, deny dangerous), hooks (SessionStart, PreToolUse, PostToolUse, Notification, Stop), env vars.

### 7. .claude/settings.local.json (gitignored)
Machine-specific env vars template.

### 8. .claude/hooks/ (cross-platform Node.js scripts)
- protect-files.js — block edits to .env, lock files, CI configs (PreToolUse)
- post-edit-format.js — auto-format after edits (PostToolUse)
- validate-bash.js — block dangerous commands (PreToolUse)
- session-start.js — re-inject context on startup/resume/compact (SessionStart)
- track-file-changes.js — log file modifications to task changes log (PostToolUse)
- notify-approval.js — OS notification when approval needed (Notification)
- execution-report.js — capture execution snapshot on Stop (Stop)
- tool-failure-tracker.js — log tool failures for debugging (PostToolUseFailure)
- stop-failure-handler.js — handle rate limits, auth failures, preserve state (StopFailure)
- pre-compact-save.js — save critical workflow state before compaction hits (PreCompact)
- post-compact-recovery.js — re-inject loop state, handoffs, blockers after compaction (PostCompact)

### 9. .claude/templates/ (extracted from REAL code, not invented)
Read 3-5 existing files of each type, extract common skeleton.
- component.md, api-endpoint.md, service.md, model.md, test.md, hook.md
- Only generate templates for patterns that actually exist in the codebase.

### 10. .claude/profiles/
- backend.md, frontend.md, devops.md (only those relevant to the project)

### 11. .claude/docs/commands.md
Master command reference: Claude CLI, session commands, /slash skills, @agent mentions, build/test/lint commands, git workflow, Smithery CLI.

### 12. .gitignore additions
```
.claude/settings.local.json
.claude/agent-memory-local/
.claude/tasks/
.claude/reports/
```

## Validation After Generation
- Count CLAUDE.md lines (must be under 150)
- Validate settings.json with `JSON.parse()` or `node -e`
- Check hook .js scripts exist
- Test that build/test/lint commands actually work
- Verify no placeholder `{...}` values remain

## Update Manifest
After generation, create/update `.claude/manifest.json`:
- Set `last_sync` and `last_scan` to current ISO timestamp
- Hash every generated file (agents, skills, hooks, rules, CLAUDE.md)
- Record tech stack dependency file hashes (package.json, etc.)
- Record project structure (source dirs, test dirs, config files)
- Record CLAUDE.md line count and agent count
This manifest enables `/sync` to detect drift in future sessions.

## Definition of Done
- [ ] All files generated (CLAUDE.md, agents, skills, rules, hooks, settings, templates, profiles, docs)
- [ ] No `{placeholder}` text remains in any generated file
- [ ] `manifest.json` created/updated with file hashes and timestamps
- [ ] CLAUDE.md under 150 lines (hard limit 200)
- [ ] `settings.json` is valid JSON
- [ ] All hook scripts exist and are syntactically valid
- [ ] `.gitignore` updated with Claude Code entries
All criteria must pass before this phase is complete.

## Next Steps
- **Continue pipeline:** `/validate-setup` — verify the generated environment meets all standards
- **Iterate:** `/generate-environment --force` — regenerate all files from scan results
- **Skip ahead:** `/new-project --resume` — jump to next incomplete phase

## Rollback
- **Redo this phase:** `/generate-environment --force` to regenerate all files
- **Revert output:** Delete generated `.claude/` files and re-run from scan results

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
