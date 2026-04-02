# Hooks Reference — Complete Registry

> All hooks in the framework: 25 root (active in settings.json) + 19 template (reference implementations).

---

## Root Hooks (25 — registered in settings.json)

These hooks run in the scanner's own environment.

### PreToolUse Hooks

| # | Hook | Matcher | Purpose |
|---|------|---------|---------|
| 1 | `pre-tool-use.js` | `.*` | 5-pass prompt pipeline: specificity, role alignment, domain/GLOSSARY, memory context, risk assessment |
| 2 | `scope-guard.js` | `Edit\|Write` | RBAC enforcement — blocks edits outside role's allowed paths |
| 3 | `version-check.js` | `.*` | Compares FRAMEWORK VERSION in CLAUDE.md vs git HEAD — detects drift |
| 4 | `branch-conflict-check.js` | `Edit\|Write` | Warns if file was modified by other branches in last 24h |
| 5 | `branch-naming-check.js` | `.*` | Validates branch name follows `[role]/[TICKET-ID]/[description]` (once per session) |
| 6 | `git-commit-gate.js` | `Bash(git commit*)` | Conventional Commits format validation + secret scanning on staged files |
| 7 | `git-push-gate.js` | `Bash(git push*)` | Full 10-gate sequence: branch health, task registry, commits, secrets, quality, tests, docs, clearance |
| 8 | `git-merge-gate.js` | `Bash(git merge*)` | Gates 2, 6, 9: task registry, tests, destructive check |

### Inline Safety Guards (PreToolUse)

| # | Guard | Matcher | Purpose |
|---|-------|---------|---------|
| 9 | Force push block | `Bash(git push*--force*)` | Blocks force push, suggests `--force-with-lease` |
| 10 | Hard reset block | `Bash(git reset --hard*)` | Blocks hard reset, suggests `git stash` |
| 11 | `git-checkout-warn.js` | `Bash(git checkout*)` / `Bash(git switch*)` | Warns about active tasks and uncommitted files when switching branches (advisory, never blocks) |

### PostToolUse Hooks

| # | Hook | Matcher | Purpose |
|---|------|---------|---------|
| 12 | `post-tool-use.js` | `.*` | Logs every tool call to branch-scoped audit log |
| 13 | `doc-drift-check.js` | `Edit\|Write` | After editing src/, checks if corresponding docs/ file is stale |
| 14 | `post-write-audit.js` | `Edit\|Write` | Logs writes to AUDIT_LOG.md + auto-detects story outputs for TASK_REGISTRY tracking |
| 15 | `post-edit-format.js` | `Edit\|Write` | Auto-formats edited files (prettier for JS/TS/JSON/CSS, black for Python, gofmt for Go, rustfmt for Rust) |
| 16 | `context-monitor.js` | `.*` | Tracks cumulative token usage, warns at 45%/60%/75% context budget thresholds |
| 17 | `audit-logger.js` | `.*` | Structured audit log per branch + active task brief integration with lockfile |

### SessionStart Hooks

| # | Hook | Purpose |
|---|------|---------|
| 18 | `session-start.js` | Multi-phase context re-injection: role check, hook health, MEMORY.md/TODO.md, task scan, crash detection |
| 19 | `drift-detector.js` | Lightweight drift detection: manifest freshness, agent count, dependency hashes, skill directories |

### Stop Hooks

| # | Hook | Purpose |
|---|------|---------|
| 20 | `stop.js` | Writes "Last Completed" and "Next Step" to MEMORY.md, auto-advances TODO.md, captures loop state |
| 21 | `stop-registry-snapshot.js` | Tracks open story count from TASK_REGISTRY + writes session summary to MEMORY.md |

### PreCompact Hooks

| # | Hook | Purpose |
|---|------|---------|
| 22 | `pre-compact.js` | Archives session transcript summary to `docs/transcripts/session-{timestamp}.md` |
| 23 | `pre-compact-archive.js` | Snapshots MEMORY.md + TODO.md + TASK_REGISTRY.md + active task Loop State to `logs/registry-snapshots/` |

### PostCompact Hook

| # | Hook | Purpose |
|---|------|---------|
| 24 | `post-compact-recovery.js` | Re-injects critical workflow state after compaction: task, loop state, handoff, TASK_REGISTRY + TODO summary |

### StopFailure Hook

| # | Hook | Purpose |
|---|------|---------|
| 25 | `stop-failure-handler.js` | Handles rate limits, auth failures, max tokens — marks task INTERRUPTED, saves recovery manifest |

### SubagentStop Hooks

| # | Hook | Purpose |
|---|------|---------|
| 26 | `subagent-tracker.js` | Tracks agent completion/timeouts, auto-increments loop counters, saves checkpoints |
| 27 | `handoff-validator.js` | Validates agent HANDOFF block format (from, to, reason, metrics, NEXT ACTION). Advisory warnings. |

---

## Template Hooks (19 — reference implementations)

These live in `template/.claude/hooks/` and are meant to be copied to target projects during environment generation.

### SessionStart

| Hook | Purpose | Event |
|------|---------|-------|
| `session-start.js` | Context re-injection, role check, crash detection, task recovery | SessionStart |
| `drift-detector.js` | Manifest freshness, agent/skill count validation | SessionStart |

### PreToolUse

| Hook | Purpose | Event |
|------|---------|-------|
| `protect-files.js` | Blocks edits to protected files (.env, lock files, workflows) | PreToolUse |
| `gatekeeper-check.js` | Scans incoming content for secrets, test disables, code smells | PreToolUse |
| `validate-bash.js` | Blocks dangerous bash commands (fork bomb, rm -rf, curl\|bash) | PreToolUse |

### PostToolUse

| Hook | Purpose | Event |
|------|---------|-------|
| `context-monitor.js` | Tracks cumulative tool usage as context proxy, warns at 45%/60%/75% | PostToolUse |
| `audit-logger.js` | Structured audit log per branch + task brief integration | PostToolUse |
| `test-results-parser.js` | Auto-detects test results, regression detection, coverage tracking | PostToolUse |
| `post-edit-format.js` | Auto-formats edited files (prettier, black, gofmt, rustfmt) | PostToolUse |
| `track-file-changes.js` | Logs file state before edit for undo capability | PostToolUse |

### PostToolUseFailure

| Hook | Purpose | Event |
|------|---------|-------|
| `tool-failure-tracker.js` | Tracks consecutive tool failures, escalates after 3 | PostToolUseFailure |

### PreCompact / PostCompact

| Hook | Purpose | Event |
|------|---------|-------|
| `pre-compact-save.js` | Saves critical state before compaction (task, loop, handoff, bugs) | PreCompact |
| `post-compact-recovery.js` | Re-injects workflow state after compaction | PostCompact |

### Stop / StopFailure

| Hook | Purpose | Event |
|------|---------|-------|
| `execution-report.js` | Collects execution metadata for disaster recovery | Stop |
| `prompt-stats.js` | Per-session execution stats, hallucination risk assessment | Stop |
| `stop-persist-state.js` | Persists active task state, loop counters, and handoff context on session end | Stop |
| `stop-failure-handler.js` | Handles session-ending errors, saves recovery manifest | StopFailure |

### SubagentStop

| Hook | Purpose | Event |
|------|---------|-------|
| `subagent-tracker.js` | Tracks agent completion/timeouts, saves checkpoints | SubagentStop |

### Other

| Hook | Purpose | Event |
|------|---------|-------|
| `notify-approval.js` | Cross-platform OS notification when Claude needs approval | Notification |

---

## Hook Exit Codes

| Code | Meaning | Effect |
|------|---------|--------|
| `0` | Proceed | Tool call executes normally |
| `2` | Block | Tool call is prevented, stderr shown as reason |

---

## Hook Lifecycle by Event

```
SESSION START:
  session-start.js → drift-detector.js

BEFORE TOOL CALL:
  pre-tool-use.js → scope-guard.js → version-check.js
  → branch-conflict-check.js → branch-naming-check.js
  → git-commit-gate.js / git-push-gate.js / git-merge-gate.js / git-checkout-warn.js
  → protect-files.js → gatekeeper-check.js → validate-bash.js

AFTER TOOL CALL (success):
  post-tool-use.js → doc-drift-check.js → post-write-audit.js → post-edit-format.js
  → context-monitor.js → audit-logger.js → test-results-parser.js
  → track-file-changes.js

AFTER TOOL CALL (failure):
  tool-failure-tracker.js

BEFORE COMPACTION:
  pre-compact.js → pre-compact-archive.js / pre-compact-save.js

AFTER COMPACTION:
  post-compact-recovery.js

AGENT COMPLETION:
  subagent-tracker.js → handoff-validator.js

SESSION END (success):
  stop.js → stop-registry-snapshot.js → execution-report.js → prompt-stats.js

SESSION END (failure):
  stop-failure-handler.js
```
