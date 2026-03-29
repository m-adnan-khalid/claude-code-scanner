# Claude Code Best Practices Reference

## CLAUDE.md
- Max 150 lines root (hard limit 200), 80 per module, 50 per rule
- Use @imports for external content (max 5 hops depth)
- Specific instructions only — never vague
- Don't repeat what linter/formatter config already enforces
- Don't duplicate README or docs content

## Skills
- Frontmatter: name (lowercase, hyphens, max 64 chars), description (third-person, triggers, max 1024 chars)
- `context: fork` for heavy/exploration skills
- `disable-model-invocation: true` for side-effect skills (deploy, send, workflow)
- `argument-hint` for skills that accept arguments
- `user-invocable: true` for user-facing skills
- Under 500 lines including supporting files
- Progressive disclosure: ~100 token description at startup, ~5k full load

## Agents (Role-Based Team)
- 18 agents required: 4 SDLC roles + 6 core + 4 dev (frontend, api-builder, infra, mobile) + 4 pre-dev (ideator, strategist, scaffolder, ux-designer)
- SDLC roles: team-lead, architect, product-owner, qa-lead
- Core: explorer, reviewer, security, debugger, tester, code-quality
- Dev (conditional): frontend, api-builder, infra
- `permissionMode: plan` for read-only agents
- `disallowedTools: Edit, Write` on read-only agents (belt-and-suspenders)
- `memory: project` for cross-session persistence on all agents
- `isolation: worktree` for parallel dev agents (frontend, api-builder)
- `maxTurns` to prevent runaway
- Model: haiku (fast), sonnet (routine), opus (complex)
- Scope MCP servers per agent via `mcpServers:` field, not global
- Every agent MUST have: structured output format, HANDOFF block, Limitations section

## Agent Communication
- Subagents CANNOT spawn other subagents — all coordination via main context or workflow skill
- Use structured HANDOFF blocks for every agent transition
- Track loop iterations in task records (survives compaction)
- Circuit breakers: dev-test max 5, review max 3, QA-bug max 3

## Hooks
- Exit 0 = proceed, exit 2 = block (stderr = reason)
- Matcher is case-sensitive regex
- Use Node.js for cross-platform (no bash/jq dependency)
- `model: "haiku"` for prompt hooks (cost efficiency)
- SessionStart with "compact" matcher to re-inject context
- All hooks in settings.json must point to existing .js files

## Context Window
- Startup: under 20% (CLAUDE.md + memory + skill metadata + MCP tools)
- Working: under 60%
- MCP servers: ~200-2k tokens EACH, always loaded
- Skills: ~100 tokens metadata, ~5k when active
- Agent descriptions: ~100 tokens each at startup
- `/context` to check, `/compact "focus"` to compress, `/clear` between tasks
- Prefer skills over MCP (on-demand vs always-on)

## Settings
- `.claude/settings.json` — project (committed), with `permissions.defaultMode`
- `.claude/settings.local.json` — personal (gitignored)
- `permissions.allow` uses `Bash(command pattern)` format
- `permissions.deny` uses `Bash(command pattern)` format
- Must include `env` section (even if empty)
- All hooks must be registered — orphan hook files are not executed
- No secrets in committed files

## Session Management
- `/clear` between unrelated tasks
- `claude --continue` to resume
- `claude --worktree "name"` for parallel work
- `/compact "focus on X"` for targeted compression
- One major task per session for large features

## Execution Reports
- Every agent MUST include `execution_metrics` in their HANDOFF block
- Metrics: turns_used, files_read/modified/created, tests_run, coverage_delta
- Self-checks: hallucination_flags (verify file refs, function names, conventions)
- Self-checks: regression_flags (test failures, lint/type errors, build status)
- Confidence: HIGH/MEDIUM/LOW self-assessment
- @team-lead aggregates metrics and triggers `/execution-report` per phase
- Stop hook auto-captures snapshot and forces report generation
- Scores: success (0-100), hallucination (0-3), regression (0-3)
- Block advancement if hallucination >= 2 or regression >= 2
- Reports saved to `.claude/reports/executions/`

## Regression Baselines
- **Baseline established:** Pre-Phase 5 — run existing tests and save to `.claude/reports/test-runs/baseline.json`
- **Coverage baseline:** Measured at Phase 5 completion, tracked as `coverage-baseline` in Loop State
- **Auto-detection:** `test-results-parser` hook compares every test run to baseline — flags new failures, coverage drops, removed tests
- **Enforcement:** Do NOT advance Phase 6→7 with regressions. Phase 9 regression = new P1 bug.
- **Update baseline:** After intentional test changes, copy `latest.json` to `baseline.json`

## Disaster Recovery
- **Session failure:** State preserved by `stop-failure-handler` hook. Resume: `claude --continue`
- **Agent timeout:** Checkpoint saved by `subagent-tracker` hook. Counts as +1 loop iteration. Re-invoke with narrower scope.
- **Tool failure x3:** `tool-failure-tracker` escalates after 3 consecutive. Try different approach.
- **Crash detection:** `session-start` hook flags tasks stuck in DEVELOPING >6 hours. Check `.claude/reports/executions/` for recovery snapshots.
- **File undo:** `track-file-changes` logs git hash before each edit. Restore: `git show {hash} > file`
- **Full state reconstruction:** Combine task record + `_changes.log` + execution snapshots + git log
- **Hook failures:** All hooks log to `.claude/reports/hook-failures.log`. Check at session start.

## Prompt Engineering
- Include verification criteria (tests, expected output)
- Plan mode for exploration, normal mode for implementation
- Reference files with `@path/to/file`
- Break large tasks into phases
- Point to existing code as examples
- "Fix root cause, not symptom"
- Structured output format in agent prompts
- Chain-of-thought guidance for complex reasoning (debugger, architect)
- Explicit DO NOT boundaries prevent role bleed
