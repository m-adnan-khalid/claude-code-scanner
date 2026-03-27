---
name: sync
description: Detect drift between the Claude Code environment and the actual codebase. Updates CLAUDE.md, agents, skills, rules, hooks, and settings when roles change, dependencies update, or project structure evolves.
user-invocable: true
context: fork
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, Agent
argument-hint: "[--check|--fix|--full-rescan] [--component agents|skills|rules|hooks|claude-md|all]"
effort: high
---

# Sync: $ARGUMENTS

Detect and resolve drift between the Claude Code environment (`.claude/`) and the actual project codebase.

## Commands
- `/sync` or `/sync --check` — Detect drift only, report what's stale (no changes)
- `/sync --fix` — Detect drift and auto-fix all stale files
- `/sync --fix --component agents` — Fix only agent files
- `/sync --fix --component claude-md` — Fix only CLAUDE.md
- `/sync --full-rescan` — Complete re-scan + regenerate everything (like fresh install)

## When to Run
- After adding/removing dependencies (`npm install`, `pip install`, etc.)
- After adding/removing agents, skills, hooks, or rules manually
- After major refactors that change file structure
- After team role changes (new agent types needed, roles removed)
- Periodically (weekly recommended) to catch gradual drift
- At workflow Phase 1 (Task Intake) — automatic drift check before starting work

---

## Step 1: Read Current Manifest
Read `.claude/manifest.json` if it exists. This tracks what was last generated and from what state.

If manifest doesn't exist, create one from current state (first-time sync).

## Step 2: Detect Drift (8 categories)

### 2a: Agent Drift
Compare `.claude/agents/*.md` against actual state:
- **Added agents:** .md files in agents/ that aren't in manifest
- **Removed agents:** manifest entries with no matching .md file
- **Modified agents:** .md files newer than manifest timestamp
- **CLAUDE.md agent table stale:** agents listed in CLAUDE.md vs actual agent files
- **Workflow agent team stale:** agents in workflow SKILL.md agent table vs actual files
- **commands-template stale:** agent @-mentions in commands doc vs actual files

Check each agent for compliance:
- Has required fields? (name, description, tools, model, maxTurns, effort, memory, HANDOFF, Limitations)
- Read-only agents have permissionMode: plan + disallowedTools?
- Dev agents have isolation: worktree?

### 2b: Skill Drift
Compare `.claude/skills/*/SKILL.md` against actual state:
- **Added skills:** SKILL.md files not in manifest
- **Removed skills:** manifest entries with no matching skill dir
- **Modified skills:** SKILL.md files newer than manifest timestamp
- **Missing frontmatter:** skills without name/description/user-invocable
- **Missing context:fork:** heavy skills (>30 lines) without fork
- **Stale cross-references:** skills referenced in generate-environment but not in skills dir

### 2c: Hook Drift
Compare `.claude/hooks/*.js` against settings.json:
- **Orphan hooks:** .js files not registered in any settings.json hook event
- **Missing hooks:** settings.json references a .js file that doesn't exist
- **New hooks not registered:** .js files added to hooks/ but not in settings.json

### 2d: Rule Drift
Compare `.claude/rules/*.md` against codebase:
- **Rules referencing non-existent paths:** `paths:` globs that match zero files
- **Missing rules for new directories:** new source directories with no matching rule
- **Stale content:** rules mentioning frameworks/patterns no longer in the project

### 2e: CLAUDE.md Drift
Compare root CLAUDE.md against actual project state:
- **Tech stack stale:** versions in CLAUDE.md vs package.json/go.mod/Cargo.toml/etc.
- **Commands stale:** build/test/lint commands in CLAUDE.md vs actual scripts
- **Agent table stale:** agents listed vs actual .claude/agents/ files
- **Key paths stale:** referenced directories/files that no longer exist
- **Line count over limit:** CLAUDE.md exceeds 200 lines

### 2f: Settings Drift
Compare `.claude/settings.json` against hooks and project state:
- **Hook events missing:** supported events without any hooks registered
- **Permission patterns stale:** allow/deny patterns referencing commands that don't exist
- **Missing env vars:** project requires env vars not documented in settings

### 2g: Dependency/Tech Stack Drift
Compare project dependencies against what was scanned:
- Read package.json, go.mod, Cargo.toml, requirements.txt, etc.
- Compare current dependency versions vs what's in CLAUDE.md tech stack
- Detect: new frameworks added, frameworks removed, major version bumps
- Flag: if a new framework means a new agent or rule is needed

### 2h: Project Structure Drift
Compare directory structure against what was scanned:
- New source directories not covered by rules
- Removed directories still referenced in rules/CLAUDE.md
- New test directories not in testing rules
- New config files not in infrastructure rules

### 2i: Pre-Dev Project Document Drift
If `.claude/project/PROJECT.md` exists, check pre-dev document integrity:
- **Status consistency:** PROJECT.md status vs actual phase file existence
  - e.g., status = READY_FOR_DEV but ARCHITECTURE.md missing → DRIFT
- **Template detection:** project files still containing `{placeholder}` values → incomplete phase
- **Cross-document consistency:**
  - BACKLOG.md Must-Have features should map to PRODUCT_SPEC.md user journeys
  - ARCHITECTURE.md entities should cover DOMAIN_MODEL.md entities
  - TECH_STACK.md choices should be compatible with ARCHITECTURE.md directory structure
- **Feature status sync:** BACKLOG.md feature status vs .claude/tasks/ TASK records
  - Feature marked IN_PROGRESS but TASK record is CLOSED → stale
  - Feature marked PENDING but TASK record exists → sync needed
- **Decision Log currency:** PROJECT.md Decision Log should have entries for completed phases

---

## Step 3: Generate Drift Report

Output drift report to stdout AND save to `.claude/reports/drift-report.md`:

```markdown
# Drift Report — {ISO timestamp}

## Summary
| Category | Status | Drift Items |
|----------|--------|-------------|
| Agents | {OK/STALE} | {count} changes |
| Skills | {OK/STALE} | {count} changes |
| Hooks | {OK/STALE} | {count} changes |
| Rules | {OK/STALE} | {count} changes |
| CLAUDE.md | {OK/STALE} | {count} changes |
| Settings | {OK/STALE} | {count} changes |
| Tech Stack | {OK/STALE} | {count} changes |
| Structure | {OK/STALE} | {count} changes |
| **Overall** | **{IN_SYNC/DRIFT_DETECTED}** | **{total}** |

## Details
### Agents
- [ADDED] new-agent.md found in agents/ but not in manifest
- [REMOVED] old-agent.md in manifest but no file on disk
- [STALE] CLAUDE.md lists 12 agents but 14 agent files exist
- [COMPLIANCE] agent-x.md missing memory: project field

### Skills
- [ADDED] new-skill/SKILL.md found but not in manifest
- [STALE] workflow/SKILL.md modified after last sync
...

### CLAUDE.md
- [STALE] Tech stack: react 18.2.0 in CLAUDE.md but 19.0.0 in package.json
- [STALE] Agent table: 12 agents listed but 14 files exist
- [STALE] Command: "npm test" in CLAUDE.md but "vitest" in package.json scripts
...
```

---

## Step 4: Auto-Fix (when `--fix` flag is present)

### Fix Agent Drift
1. **New agents:** Add to CLAUDE.md agent table, workflow agent team, commands-template
2. **Removed agents:** Remove from CLAUDE.md, workflow, commands-template
3. **Non-compliant agents:** Add missing fields (memory: project, HANDOFF, Limitations)
4. **CLAUDE.md stale:** Regenerate agent table section from actual agent files

### Fix Skill Drift
1. **New skills:** Add to generate-environment skill list, commands-template
2. **Removed skills:** Remove from generate-environment, commands-template
3. **Missing frontmatter:** Add name/description from directory name
4. **Missing fork:** Add `context: fork` to skills >30 lines

### Fix Hook Drift
1. **Orphan hooks:** Register in settings.json under appropriate event (guess from filename)
2. **Missing hooks:** Remove from settings.json OR create placeholder .js
3. **Unregistered hooks:** Add to settings.json with appropriate matcher

### Fix Rule Drift
1. **Dead path rules:** Update `paths:` to match current directory structure
2. **New directories:** Create new rule files for uncovered source dirs
3. **Stale content:** Flag for manual review (can't auto-update domain rules)

### Fix CLAUDE.md
1. **Tech stack:** Read dependency files, update version numbers
2. **Commands:** Read package.json scripts (or equivalent), update Quick Commands section
3. **Agent table:** Regenerate from actual `.claude/agents/*.md` files
4. **Key paths:** Verify each path exists, remove dead paths, add new entry points
5. **@imports:** Verify imported files exist

### Fix Settings
1. **Missing hook registrations:** Add entries for unregistered hooks
2. **Dead permissions:** Remove allow/deny patterns for non-existent commands

---

## Step 5: Update Manifest

After sync (check or fix), update `.claude/manifest.json`:

```json
{
  "last_sync": "ISO timestamp",
  "last_scan": "ISO timestamp of last /scan-codebase",
  "environment_version": "1.0.0",
  "agents": {
    "team-lead.md": { "hash": "sha256...", "modified": "ISO timestamp" },
    "architect.md": { "hash": "sha256...", "modified": "ISO timestamp" }
  },
  "skills": {
    "workflow": { "hash": "sha256...", "modified": "ISO timestamp" }
  },
  "hooks": {
    "session-start.js": { "hash": "sha256...", "registered_in": ["SessionStart"] }
  },
  "rules": {
    "context-budget.md": { "hash": "sha256...", "paths": ["**/*"] }
  },
  "tech_stack": {
    "package.json": { "hash": "sha256...", "modified": "ISO timestamp" },
    "go.mod": null
  },
  "claude_md": {
    "hash": "sha256...",
    "line_count": 62,
    "agents_listed": 12
  },
  "project_structure": {
    "source_dirs": ["src/", "lib/"],
    "test_dirs": ["tests/", "__tests__/"],
    "config_files": ["package.json", "tsconfig.json"]
  }
}
```

---

## Step 6: Output Summary

```
SYNC RESULT
===========
Status:     {IN_SYNC / DRIFT_DETECTED / FIXED}
Categories: {N}/8 in sync
Drift:      {N} items found
Fixed:      {N} items auto-fixed (if --fix)
Manual:     {N} items need manual review

Next: {recommendation}
  - "All synced. No action needed."
  - "Run /sync --fix to auto-repair N items."
  - "N items need manual review — see .claude/reports/drift-report.md"
  - "Major drift detected. Consider /sync --full-rescan."
```
