---
name: daily-sync
description: Daily team sync — pull latest, verify CLAUDE.md version, show team activity, show your next step, show PRs in your scope.
context: fork
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @process-coach]
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.


# Daily Sync

Start-of-day sync for all team members.

## Process

### Step 1: Git Pull
```bash
git pull origin main
```
Report any conflicts.

### Step 2: CLAUDE.md Version Check
1. Read local `CLAUDE.md` — extract `## FRAMEWORK VERSION:`
2. Read `git show HEAD:CLAUDE.md` — extract version
3. If mismatch: "CLAUDE.md OUT OF SYNC — run: git pull origin main"
4. If match: "CLAUDE.md version verified: {version}"

### Step 3: Recent Team Activity
```bash
git log --oneline --since="24 hours ago" -- docs/
git log --oneline --since="24 hours ago" --all
```
Show docs changes and recent commits across all branches.

### Step 4: Your Next Step
1. Read MEMORY.md — extract "Next Step" section
2. Read TODO.md — find first unchecked item
3. Show: "Your next task: {task}"

### Step 5: PRs in Your Scope
Read CURRENT_ROLE from .claude/session.env, then:
- Show open PRs touching files in your role's allowed paths
- Show PRs awaiting your review

### Step 6: Output
```
Daily Sync Complete — {date}

CLAUDE.md: v{version} (in sync)
Recent activity: {N} commits in last 24h
Your next step: {task}
Open PRs in your scope: {count}

{list of PRs if any}

Ready to work. Run /feature-start or /workflow new to begin.
```

### Final Output
```
NEXT ACTION: Done. Review the output above and decide your next step.
```
