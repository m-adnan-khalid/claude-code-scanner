---
name: execution-report
description: Generate post-execution analytics report after any prompt, phase, or workflow completion. Tracks token usage, context consumption, agent communication, success scoring, hallucination detection, and regression impact analysis.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[task-id|last|all] [--phase N] [--verbose]"
---

# Execution Report: $ARGUMENTS

Generate a comprehensive post-execution analytics report. This runs automatically after every phase completion and on session Stop, or manually via `/execution-report`.

## Data Collection

### Step 1: Gather Execution Metadata
Read the active task file from `.claude/tasks/TASK-{id}.md` and the changes log `TASK-{id}_changes.log`.

Collect:
- **Session ID:** `${CLAUDE_SESSION_ID}`
- **Task ID:** from task file frontmatter
- **Phase(s) completed:** from task timeline
- **Start/end timestamps:** from timeline entries
- **Agents invoked:** from handoff log

### Step 2: Token & Context Analysis
Run `/context` or estimate from artifacts:

- **Prompt tokens (input):** estimated from files read + conversation history
- **Completion tokens (output):** estimated from files written + responses
- **Total tokens:** input + output
- **Context window usage:** current % of context consumed
- **Peak context usage:** highest % reached during execution
- **Compaction events:** count of `/compact` triggers during execution
- **Context efficiency score:** (useful output tokens / total tokens) * 100

### Step 3: Agent Communication Analysis
Read the Handoff Log from the task record:

- **Agents activated:** list with invocation count
- **Handoff count:** total agent-to-agent transitions
- **Parallel executions:** count of parallel agent invocations
- **Loop iterations:** count per loop type (dev-test, review, qa-bug)
- **Escalations:** count of circuit breaker triggers
- **Agent efficiency:** per-agent (tasks completed / turns used)

| Agent | Invocations | Turns Used | Success | Rework | Efficiency |
|-------|-------------|------------|---------|--------|------------|
| @explorer | N | N | N | N | N% |
| ... | | | | | |

### Step 4: Success Scoring
Calculate a composite success score (0-100):

**Completeness Score (0-40 points):**
- Phase exit criteria all met: +20
- All acceptance criteria VERIFIED: +10
- No skipped phases: +5
- Task status advanced to expected state: +5

**Quality Score (0-30 points):**
- All tests pass: +10
- Coverage maintained or increased: +5
- No lint/type errors: +5
- Code review APPROVED (no critical issues): +5
- Security review clean: +5

**Efficiency Score (0-30 points):**
- Completed within expected turns: +10
- No circuit breaker triggers: +5
- Context stayed under 60%: +5
- Loops resolved within first attempt: +5
- No unnecessary agent invocations: +5

**Score Interpretation:**
- 90-100: EXCELLENT — clean execution
- 70-89: GOOD — minor issues
- 50-69: FAIR — rework or inefficiency detected
- 30-49: POOR — significant issues
- 0-29: FAILED — task incomplete or blocked

### Step 5: Hallucination Detection
Verify all generated artifacts against the actual codebase:

**File Reference Check:**
- Scan all file:line references in agent outputs
- Verify each referenced file exists at that path
- Verify line numbers are within file range
- Flag any references to non-existent files/functions

**API/Function Verification:**
- Check all function names mentioned in generated code exist
- Verify import paths resolve to real modules
- Confirm API endpoints referenced actually exist in routes
- Flag any invented or hallucinated identifiers

**Convention Consistency:**
- Compare generated code patterns against CLAUDE.md conventions
- Check naming against existing codebase patterns
- Verify generated test patterns match existing test files
- Flag any patterns that don't match the project

**Hallucination Score (0-3):**
- 0: CLEAN — all references verified
- 1: MINOR — cosmetic mismatches (wrong line numbers, outdated paths)
- 2: MODERATE — referenced non-existent functions or wrong imports
- 3: SEVERE — generated code based on invented APIs or wrong architecture

### Step 6: Regression & Bug Impact Analysis
Run the test suite and compare against baseline:

```bash
# Run the project's test command (check package.json scripts, Makefile, or CI config)
# Examples: npm test, pytest, go test ./..., cargo test
# Compare test count: before vs after
# Compare coverage: before vs after
```

**Regression Checks:**
- **Test suite result:** PASS/FAIL (count passing/failing/skipped)
- **New test failures:** list of tests that passed before but fail now
- **Coverage delta:** before% -> after% (flag if decreased)
- **Lint check:** PASS/FAIL (new lint errors introduced?)
- **Type check:** PASS/FAIL (new type errors introduced?)
- **Build check:** PASS/FAIL (build still succeeds?)

**Bug Impact Assessment:**
- Files modified in this execution: list from changes log
- Existing tests covering those files: list
- Tests that changed from PASS to FAIL: list (these are regressions)
- Files modified but lacking test coverage: list (risk areas)

**Impact Score (0-3):**
- 0: CLEAN — no regressions, coverage maintained
- 1: LOW — coverage decreased slightly but no new failures
- 2: MEDIUM — new test failures introduced
- 3: HIGH — build broken or critical regressions

## Output: Execution Report

Save to `.claude/reports/executions/TASK-{id}_phase-{N}_{timestamp}.md`:

```markdown
# Execution Report: TASK-{id} Phase {N}

## Summary
| Metric | Value |
|--------|-------|
| Task | TASK-{id}: {title} |
| Phase | {N}: {phase_name} |
| Duration | {elapsed} |
| Success Score | {score}/100 ({rating}) |
| Hallucination Score | {0-3} ({level}) |
| Regression Impact | {0-3} ({level}) |

## Token & Context Usage
| Metric | Value |
|--------|-------|
| Estimated Input Tokens | {N} |
| Estimated Output Tokens | {N} |
| Total Tokens | {N} |
| Peak Context Usage | {N}% |
| Compaction Events | {N} |
| Context Efficiency | {N}% |

## Agent Communication
| Agent | Invocations | Turns | Success | Rework | Efficiency |
|-------|-------------|-------|---------|--------|------------|
| ... | | | | | |

**Handoff Count:** {N}
**Parallel Executions:** {N}
**Loop Iterations:** dev-test {N}/5, review {N}/3, qa-bug {N}/3
**Escalations:** {N}

## Success Breakdown
| Category | Score | Detail |
|----------|-------|--------|
| Completeness | {N}/40 | {detail} |
| Quality | {N}/30 | {detail} |
| Efficiency | {N}/30 | {detail} |
| **Total** | **{N}/100** | **{rating}** |

## Hallucination Check
| Check | Result | Flags |
|-------|--------|-------|
| File references | {N} verified / {N} total | {list of bad refs} |
| Function/API names | {N} verified / {N} total | {list of invented} |
| Convention match | {N} consistent / {N} checked | {list of mismatches} |
| **Score** | **{0-3}** | **{level}** |

## Regression & Bug Impact
| Check | Result |
|-------|--------|
| Test suite | {PASS/FAIL} ({passing}/{total}) |
| New failures | {count} — {list} |
| Coverage delta | {before}% -> {after}% ({+/-N}%) |
| Lint check | {PASS/FAIL} |
| Type check | {PASS/FAIL} |
| Build check | {PASS/FAIL} |
| Uncovered modified files | {list} |
| **Impact Score** | **{0-3}** ({level}) |

## Recommendations
- {Actionable recommendation based on findings}
- {e.g., "Add tests for src/api/handler.ts — modified but uncovered"}
- {e.g., "Reduce context usage — 72% peak, consider splitting task"}
```

## Auto-Generation Trigger
This report is automatically generated:
1. After each workflow phase completion (appended to task record)
2. On session Stop (summary report)
3. On `/execution-report` manual invocation
4. On workflow completion (final cumulative report)

## Cumulative Report (on workflow completion)
When the full workflow completes (Phase 12), generate a cumulative report at:
`.claude/reports/executions/TASK-{id}_final.md`

Includes:
- Per-phase scores stacked
- Total token usage across all phases
- Agent utilization heatmap
- Phase bottleneck analysis (which phase took most turns/time)
- Overall success score (weighted average of phase scores)
- Full hallucination audit
- Full regression audit
- Lessons learned (what should be different next time)
