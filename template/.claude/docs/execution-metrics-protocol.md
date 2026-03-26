# Execution Metrics Protocol

Every agent MUST include execution metrics in their HANDOFF block when completing work. This data feeds into the `/execution-report` skill for post-completion analytics.

## Extended HANDOFF Block Format

```
HANDOFF:
  from: @agent-name
  to: @next-agent-or-team-lead
  reason: why this handoff is happening
  artifacts:
    - list of files/docs produced
  context: |
    Summary of what was done and key decisions
  iteration: N/max (if in a loop)
  execution_metrics:
    turns_used: N
    files_read: N
    files_modified: N
    files_created: N
    tests_run: N (pass/fail/skip)
    coverage_delta: "+N%" or "-N%" or "N/A"
    hallucination_flags:
      - "referenced non-existent file X" (if any)
      - "CLEAN" (if none)
    regression_flags:
      - "test X changed from PASS to FAIL" (if any)
      - "CLEAN" (if none)
    confidence: HIGH/MEDIUM/LOW
    notes: |
      Any concerns, assumptions made, or uncertainty
```

## What Each Metric Means

### turns_used
How many agentic turns the agent consumed. Compare against `maxTurns` to assess efficiency.
- Under 50% of maxTurns = efficient
- 50-80% = normal
- Over 80% = approaching limit, may indicate complexity or inefficiency

### files_read / files_modified / files_created
Raw count of file operations. Used to calculate:
- Context consumption estimate (~500 tokens per file read)
- Blast radius (files modified)
- Code generation volume (files created)

### tests_run
Test suite results after this agent's work. Format: `N (pass/fail/skip)`.
- All pass = quality score contribution
- New failures = regression flag

### coverage_delta
Change in test coverage after this agent's work.
- Positive or zero = quality maintained
- Negative = quality decreased (flag for review)

### hallucination_flags
Self-check by the agent for potential hallucinations:
- Referenced a file that doesn't exist
- Called a function that doesn't exist in the codebase
- Used an API pattern that doesn't match the project
- Generated import paths that don't resolve
- **CLEAN** if all references verified

### regression_flags
Self-check by the agent for regressions introduced:
- Tests that passed before but fail after changes
- Lint errors introduced
- Type errors introduced
- Build failures introduced
- **CLEAN** if no regressions

### confidence
Agent's self-assessment of output quality:
- **HIGH**: All references verified, tests pass, patterns match
- **MEDIUM**: Most references verified, minor uncertainty about edge cases
- **LOW**: Significant assumptions made, references not fully verifiable, needs human review

## @team-lead Responsibilities
The @team-lead agent is responsible for:
1. Collecting execution_metrics from every agent handoff
2. Aggregating metrics into the task record's Execution Report section
3. Triggering `/execution-report` after each phase completion
4. Flagging any agent with hallucination_flags != CLEAN or confidence = LOW
5. Blocking phase advancement if regression_flags != CLEAN

## Automatic Collection
The `execution-report.js` Stop hook automatically captures:
- Active task status and metadata
- Agent mention counts from handoff log
- Loop iteration counts from task record
- File change counts from changes log
- Snapshots saved to `.claude/reports/executions/`

## Report Aggregation
The `/execution-report` skill combines:
- Hook-collected snapshots (automatic)
- Agent-reported execution_metrics (from HANDOFF blocks)
- Test suite results (run on demand)
- Coverage reports (run on demand)
- File reference verification (scan on demand)

Into a single scored report with success, hallucination, and regression assessments.
