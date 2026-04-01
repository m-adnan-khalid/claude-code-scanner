---
name: org-report
description: Organization health report for CTO/Tech Lead — aggregates branch logs, blocked items, doc drift, subagent violations, and framework version compliance.
context: fork
roles: [CTO, TechLead, Architect]
agents: [@cto, @team-lead, @gatekeeper]
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.


# Org Report

Executive organization health dashboard. Restricted to CTO and Tech Lead roles.

## Access Control
Check `.claude/session.env` for CURRENT_ROLE.
Only allow: CTO, TechLead, Architect.
If other role: "This report is restricted to CTO/TechLead/Architect roles."

## Process

### Step 1: Branch Activity
```bash
git branch -a --sort=-committerdate | head -20
git log --all --oneline --since="7 days ago" --format="%an | %s" | head -30
```
Count active branches per contributor/role.

### Step 2: Blocked Items
1. Read `.claude/reports/audit/` logs — extract blocked/failed items
2. Read TODO.md — extract items marked as blocked
3. Read .claude/tasks/ — find tasks in BLOCKED status

### Step 3: Doc Drift Analysis
For each src/ file changed in last 7 days:
1. Check if corresponding docs/ file exists and is current
2. Report stale docs

### Step 4: Subagent Violations
1. Read `.claude/reports/audit/audit-{branch}.log` — filter for SCOPE_VIOLATION, VALIDATION_FAIL entries
2. Count violations per agent in last 7 days

### Step 5: Framework Version Compliance
1. Read CLAUDE.md version from HEAD
2. Check if any branches have different CLAUDE.md versions

### Step 6: Output
```
Org Health Report — {date}

Active Branches: {count}
  {role}: {count per role}

Blocked Items: {count}
  {list of blocked items with owner}

Doc Drift: {count} stale docs
  {list of stale doc files}

Subagent Violations (7d): {count}
  {agent}: {count} violations

Framework Version: {version}
  Compliance: {pct}% of branches on latest

RISK MATRIX:
  R1 Duplicate Code:     {status}
  R2 Coding Standards:   {status}
  R3 CLAUDE.md Drift:    {status}
  R4 Subagent Output:    {status}
  R5 Doc Sync:           {status}
  R6 Role Access:        {status}

Action Items:
1. {highest priority action}
2. {next priority}
3. {next priority}
```

### Final Output
```
NEXT ACTION: Done. Review the output above and decide your next step.
```
