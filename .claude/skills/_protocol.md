# Skill Lifecycle Protocol

All skills MUST follow this protocol. The tier determines which sections apply.

## Tiers

| Tier | Skills | Required |
|------|--------|----------|
| **T1** Multi-step execution | idea-to-launch, new-project, scaffold, generate-environment, workflow, feature-start, feature-done, mvp-kickoff, launch-mvp, deploy, hotfix, migrate, refactor, fix-bug, add-endpoint, add-component, add-page, add-command, add-scene, add-template, parallel-dev, setup-workspace, setup-smithery, setup-observability, onboard | ALL sections |
| **T2** Audit/analysis | accessibility-audit, cicd-audit, docs-audit, infrastructure-audit, license-audit, performance-audit, privacy-audit, security-audit, firmware-audit, mobile-audit, logging-audit, incident-readiness, design-review, dependency-check, impact-analysis, coverage-track, visual-regression, seo-audit | LOAD, NEXT ACTION, MEMORY UPDATE |
| **T3** Planning/docs | brainstorm, product-spec, feature-map, tech-stack, architecture, deploy-strategy, domain-model, clarify, create-story, qa-plan, methodology, pi-planning, cost-estimate | LOAD, NEXT ACTION, MEMORY UPDATE |
| **T4** Testing | e2e-browser, e2e-mobile, api-test, load-test | LOAD, NEXT ACTION, MEMORY UPDATE |
| **T5** Status/utility | daily-sync, standup, org-report, progress-report, metrics, mvp-status, context-check, task-tracker, changelog, api-docs, api-version, signoff, rollback, review-pr, sync, validate-setup, scan-codebase, manage-i18n, cms-manage, service-contract, feature-flags, execution-report, release-notes | NEXT ACTION only |

---

## SECTION: LOAD CONTEXT (Tiers 1-4)

Add this as the FIRST step before any skill logic runs:

```
## Step 0 — Load Context

Before starting, load full context:

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, user preferences
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items
5. **History:** List `.claude/tasks/` → check for related or duplicate work

Output context summary:
\`\`\`
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
\`\`\`
```

---

## SECTION: SESSION CONTEXT IN OUTPUT FILES (Tier 1 only)

Any file the skill creates (reports, task docs, output files) MUST include:

```markdown
## Session Context

- **Source skill:** `/[skill-name]`
- **File:** `[this file's path]`
- **Role:** [CURRENT_ROLE]
- **Branch:** [current git branch]
- **Started:** [timestamp]
- **Related:** [prior related tasks/prompts if any]
```

This ensures context survives conversation compaction or pause/resume.

---

## SECTION: NEXT ACTION (ALL Tiers)

**CRITICAL: Every output to the user MUST end with a `NEXT ACTION:` line.**

Format:
```
NEXT ACTION: [exactly what the user should do next]
```

### Common patterns:

**After producing a report/output:**
```
NEXT ACTION: Review the report above.
             - To fix issues, say "fix [issue number]"
             - To re-run, say "/[skill-name]"
             - To continue with next task, say "next"
```

**After completing execution:**
```
NEXT ACTION: All done. Here's what you can do:
             - Say "commit" to commit changes
             - Say "/[related-skill]" for the next step
             - Review output at [file path]
```

**When waiting for user input:**
```
NEXT ACTION: [specific question or instruction]
             Then come back and say "[expected response]"
```

**When a step fails:**
```
NEXT ACTION: [what failed and why]
             - Say "retry" to try again
             - Say "skip" to move on
             - Say "abort" to stop
```

---

## SECTION: TASK TRACKING (Tier 1 only)

For multi-step skills, create a task document at `.claude/tasks/task-{timestamp}.md`:

1. Break work into subtasks with checkboxes
2. Before each subtask: mark `- [~]` + `Status: IN_PROGRESS`
3. After each subtask: mark `- [x]` + `Status: DONE`
4. On failure: mark `- [!]` + `Status: FAILED`
5. Track in Progress Log table
6. Update phase: `IN_PROGRESS` → `COMPLETE` / `PARTIAL` / `BLOCKED`

Re-read the task document before each subtask (protects against compaction).

---

## SECTION: CONTEXT RECOVERY (Tier 1 only)

If context is lost (compaction, pause, resume, new session):

1. Find the most recent `.claude/tasks/` file with `Phase: IN_PROGRESS`
2. Read its `## Session Context` → restore skill, role, branch, current step
3. Read `## Progress Log` → find last completed step
4. Resume from next pending step
5. Output:
```
RESUMED: [skill-name] — picking up from step [n+1]/[N]
Context restored from [task file]

NEXT ACTION: Continuing execution. Say "pause" anytime.
```

---

## SECTION: MEMORY UPDATE (Tiers 1-4)

After the skill completes, update MEMORY.md (create if needed):

```markdown
## Last Completed
- **Skill:** /[skill-name]
- **Task:** [summary of what was done]
- **When:** [timestamp]
- **Result:** [COMPLETE | PARTIAL | BLOCKED | report generated]
- **Output:** [file path if any output was written]

## Next Step
- [recommended next action based on what was just completed]
```

Also update `TODO.md` if the completed work was linked to a TODO item.

---

## SECTION: AUDIT LOG (Tiers 1-4)

Append to `.claude/reports/audit/audit-{branch}.log`:

```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result] | [output file if any]
```

---

## How to Apply

Each skill's SKILL.md should add the relevant sections based on its tier.
Reference: "See `_protocol.md` for lifecycle details."

### Tier 1 skill template addition:
```
## Lifecycle
This skill follows the T1 (multi-step) lifecycle protocol.
See `_protocol.md` for: context loading, session context, next action, task tracking, context recovery, memory update.
```

### Tiers 2-4 skill template addition:
```
## Lifecycle
This skill follows the T[2/3/4] lifecycle protocol.
See `_protocol.md` for: context loading, next action, memory update.
```

### Tier 5 skill template addition:
```
## Lifecycle
This skill follows the T5 lifecycle protocol.
Every output ends with a NEXT ACTION line.
```
