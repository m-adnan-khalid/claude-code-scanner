# ADR-0001: Enterprise Role-Based Access Control

## Status
ACCEPTED

## Date
2026-03-29

## Context
Scaling to 100 team members requires structured governance. Without RBAC, any developer can modify any file, invoke any agent, and bypass quality gates. This creates risks: duplicate code (R1), inconsistent standards (R2), CLAUDE.md drift (R3), inconsistent subagent output (R4), doc drift (R5), and uncontrolled access (R6).

## Decision
Implement 10-role RBAC system:
- Roles defined in CLAUDE.md Enterprise Role Registry
- Session role stored in .claude/session.env (CURRENT_ROLE)
- Path scope enforced via PreToolUse hook (scope-guard.js)
- Agent access restricted per role
- Branch naming enforced per role pattern

## Consequences
### Positive
- Consistent output across 100 team members
- Clear ownership boundaries
- Audit trail per role

### Negative
- Additional setup step (setup-workspace) required for each developer
- Role switching requires re-running setup-workspace

### Neutral
- Existing agent tool restrictions remain as secondary guard

## Participants
- Proposed by: Enterprise Audit
- Approved by: CTO + Tech Lead
