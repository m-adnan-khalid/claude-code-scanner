---
name: setup-workspace
description: Initialize workspace for a specific team role. Sets CURRENT_ROLE in session.env, verifies CLAUDE.md version, runs setup checks.
context: fork
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead, @process-coach]
---

# Setup Workspace

Initialize your workspace with role-based configuration.

## Process

### Step 1: Role Selection
Ask the user: "What is your role?"

Options:
1. **CTO** — Executive oversight, framework governance
2. **Architect** — System design, architecture review
3. **TechLead** — Technical leadership, orchestration
4. **BackendDev** — Backend API, services, database
5. **FrontendDev** — UI components, pages, styles
6. **FullStackDev** — Full stack development
7. **QA** — Testing, quality assurance
8. **DevOps** — Infrastructure, CI/CD, deployment
9. **PM** — Product management, requirements
10. **Designer** — UX/UI design, accessibility

### Step 2: Write Session Environment
Create `.claude/session.env`:
```
CURRENT_ROLE={selected_role}
WORKSPACE_INITIALIZED=true
INITIALIZED_AT={ISO timestamp}
```

### Step 3: Verify CLAUDE.md Version
1. Read `CLAUDE.md` — check for `## FRAMEWORK VERSION:` header
2. Compare with `git show HEAD:CLAUDE.md` version
3. If mismatch: warn user to `git pull`

### Step 4: Run Setup Checks
1. Verify all required docs exist:
   - docs/STANDARDS.md
   - docs/GLOSSARY.md
   - docs/ARCHITECTURE.md
   - docs/ONBOARDING.md
2. Verify hooks are registered in .claude/settings.json
3. Verify agent files exist in .claude/agents/

### Step 5: Output
```
Workspace ready for {ROLE}

Role: {role}
Allowed paths: {paths from CLAUDE.md RBAC}
Available agents: {agents for this role}
Available commands: {commands for this role}

Next steps:
1. Read docs/ONBOARDING.md ({role} section)
2. Run /daily-sync
3. Start work with /feature-start or /workflow new
```
