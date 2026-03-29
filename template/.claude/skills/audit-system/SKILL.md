---
name: audit-system
description: Run a full 7-phase system audit checking files, memory, hooks, sync, subagents, retry/undo, and context risk. CTO/TechLead/Architect only.
context: fork
roles: [CTO, TechLead, Architect]
agents: [@cto, @team-lead, @gatekeeper]
---

# System Audit

Full environment health check. Validates that the Claude Code framework is correctly configured and all components are in sync.

## Access Control
Check `.claude/session.env` for CURRENT_ROLE.
Only allow: CTO, TechLead, Architect.
If other role: "This audit is restricted to CTO/TechLead/Architect roles."

## Process

### Phase 1: File Structure
Verify all required files exist:
- CLAUDE.md (with FRAMEWORK VERSION header)
- .claude/settings.json
- .claude/session.env (or .claude/session.env.template)
- docs/STANDARDS.md, docs/GLOSSARY.md, docs/ARCHITECTURE.md, docs/ONBOARDING.md
- docs/patterns/ (6 pattern files)
- docs/adr/0000-template.md
- .github/CODEOWNERS

### Phase 2: Hook Health
For each hook registered in .claude/settings.json:
1. Verify the JS file exists at the declared path
2. Run `node -c <file>` to check syntax
3. Verify it handles stdin JSON and exits cleanly
Report: registered count, valid count, orphan hooks (files not registered)

### Phase 3: Agent Inventory
1. Count agent files in .claude/agents/
2. Verify each has: frontmatter (name, model, tools), Determinism Contract, File Scope, Access Control
3. Cross-reference agent count with CLAUDE.md

### Phase 4: Skill Inventory
1. Count skill directories in .claude/skills/
2. Verify each has SKILL.md with frontmatter
3. Cross-reference skill count with CLAUDE.md

### Phase 5: RBAC Validation
1. Read .claude/session.env for CURRENT_ROLE
2. Verify scope-guard.js ROLE_PATHS covers all 10 roles
3. Verify branch-naming-check.js validRoles matches
4. Verify CLAUDE.md role sections match scope-guard paths

### Phase 6: Drift Detection
1. Compare CLAUDE.md FRAMEWORK VERSION (local vs git HEAD)
2. Check docs/claude-md-changelog.md has entry for current version
3. Check .github/CODEOWNERS protects CLAUDE.md

### Phase 7: Context Budget
1. Count CLAUDE.md lines (warn if >150, fail if >200)
2. Check rules are each <50 lines
3. Verify skills use `context: fork` for heavy work

## Output Format
```
SYSTEM AUDIT — [timestamp]

Phase 1  File Structure       [PASS/FAIL]  [n/n files]
Phase 2  Hook Health           [PASS/FAIL]  [n registered, n valid]
Phase 3  Agent Inventory       [PASS/FAIL]  [n agents, n complete]
Phase 4  Skill Inventory       [PASS/FAIL]  [n skills, n valid]
Phase 5  RBAC Validation       [PASS/FAIL]  [n roles covered]
Phase 6  Drift Detection       [PASS/FAIL]  [version status]
Phase 7  Context Budget        [PASS/FAIL]  [CLAUDE.md lines, budget %]

OVERALL: [PASS/WARN/FAIL]
Issues: [list if any]
```
