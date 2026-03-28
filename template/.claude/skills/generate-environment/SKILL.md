---
name: generate-environment
description: Generate complete Claude Code environment from scan results. Use after /scan-codebase completes.
user-invocable: true
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
context: fork
effort: high
---

# Generate Environment: $ARGUMENTS

## Prerequisite Check
Before generating, verify `.claude/scan-results.md` exists. If NOT found:
1. Warn: "scan-results.md not found. Run /scan-codebase first."
2. STOP — do NOT generate generic templates without scan data.
3. Exit with instructions to run `/scan-codebase` first.

Read `.claude/scan-results.md` (from /scan-codebase). Replace ALL `{placeholders}` with actual values. If a value wasn't found, OMIT that section — never leave placeholders.

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
- Generate additional rules ONLY if codebase demands them.

### 4. .claude/agents/ (see agents/ directory and domain-agents.md for templates)
**Always generate (SDLC roles — 4):** team-lead, architect, product-owner, qa-lead
**Always generate (core — 6):** explorer, reviewer, security, debugger, tester, code-quality
**Always generate (pre-dev — 4):** ideator, strategist, scaffolder, ux-designer
**Generate if layer exists (dev — 4):** frontend, api-builder, infra, mobile
**Total: 18 agents (14 always + 4 conditional)**

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
