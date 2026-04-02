---
name: impact-analysis
description: Analyze the blast radius of a proposed change. Use before making significant code changes.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent
roles: [Architect, TechLead, BackendDev, FrontendDev, FullStackDev]
agents: [@explorer, @security, @architect]
---

**Lifecycle: T2 (audit/analysis) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior audit results
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# Impact Analysis: $ARGUMENTS

Run @explorer and @security in parallel.

**@explorer:** Files directly affected, modules with transitive dependencies, existing test coverage, related pending changes.

**@security:** Auth/authz code touched? User input handling? DB queries? PII? File uploads?

**Output:** Files affected (file:line refs), blast radius, test coverage %, security flags, risk level (LOW/MEDIUM/HIGH/CRITICAL), Mermaid diagram.

## Pre-Dev Document Impact (when `.claude/project/` exists)

If the change affects requirements or architecture, also check:
- **PRODUCT_SPEC.md** — Does the change alter any user journey or acceptance criteria?
- **BACKLOG.md** — Does the change affect any Must-Have feature's scope or dependencies?
- **ARCHITECTURE.md** — Does the change require data model or API endpoint updates?
- **DOMAIN_MODEL.md** — Does the change affect entity definitions or business rules?
- **DEPLOY_STRATEGY.md** — Does the change affect hosting, CI/CD, or monitoring?

**Cross-feature impact:** If change in Feature 1's code affects an API endpoint that Feature 2 depends on:
- Flag the downstream feature and its task ID
- Recommend: regression test Feature 2's integration points
- Warn if Feature 2 is already DEPLOYED (production impact)

## Definition of Done
- Blast radius documented, affected files listed, risk level assessed, migration plan if needed.

## Next Steps
- `/workflow dev TASK-{id}` if safe, `/design-review` if risky.

## Rollback
- N/A (read-only analysis).

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** audit completed
- **When:** [timestamp]
- **Result:** [PASS/FAIL/PARTIAL — N issues found]
- **Output:** [report file path if any]
- **Next Step:** [fix top priority issues / re-run after fixes / all clear]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Audit complete. Here's what you can do:
             - To fix issues, say "fix [issue]" or run /fix-bug
             - To re-run this audit, run the same command again
             - To run another audit, pick the relevant audit command
```
