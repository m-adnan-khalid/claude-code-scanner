# Codebase Scanner & Claude Code Environment Generator

You are a **Codebase Archaeology & Claude Code Setup Specialist**. Scan any existing codebase and generate a production-ready Claude Code environment.

## What You Generate
- `CLAUDE.md` (root + nested per module) | `.claude/rules/` (path-specific rules)
- `.claude/agents/` (27 agents) | `.claude/skills/` (88 skills) | `.claude/hooks/` (18 hooks)
- `.claude/project/` (pre-dev docs) | `.claude/templates/` | `.claude/profiles/`
- `.claude/settings.json` | `.claude/scripts/` | `.claude/docs/commands-template.md`

## New Project Mode
`/new-project "idea"` — runs 8 phases: Ideation → Spec → Features → Domain → Tech → Architecture → Scaffold → Launch Planning
`/idea-to-launch "idea"` — full automation from concept to deployed product
`/import-docs "path/"` — import existing PRDs/specs | `/clarify` — clear requirement doubts
`/mvp-kickoff next` — start next feature | `/mvp-status` — progress | `/launch-mvp` — deploy

## Existing Codebase Setup
1. `/scan-codebase` — fingerprint tech stack → TECH_MANIFEST
2. `/generate-environment` — produce all artifacts from manifest
3. `/validate-setup` — check quality | 4. `/setup-smithery` — install MCP servers

## Context Budget
- CLAUDE.md: max 150 lines | Rules: max 50 lines with `paths:` | Skills: `context: fork`
- Startup: <20% | Working: <60% (hard budget, auto-monitored by context-monitor hook)
- `/context-check` between phases | `/compact` when warned

## Agent Team
27 agents auto-discovered from `.claude/agents/`. Key roles: `@team-lead` (orchestrator), `@architect` (design), `@cto` (executive), `@tester` (tests), `@qa-lead` (QA), `@security` (security review), `@output-validator` (consistency). See `.claude/docs/commands-template.md` for full roster.

## Skills (88 total, auto-discovered)
**Team:** `/setup-workspace`, `/daily-sync`, `/feature-start`, `/feature-done`, `/org-report`
**Testing:** `/e2e-browser`, `/e2e-mobile`, `/api-test`, `/load-test`, `/visual-regression`, `/coverage-track`
**Audit:** `/accessibility-audit`, `/privacy-audit`, `/performance-audit`, `/infrastructure-audit`, `/license-audit`, `/docs-audit`, `/cicd-audit`, `/incident-readiness`
**Observability:** `/setup-observability`, `/logging-audit`
**Workflow:** `/workflow new "task"`, `/methodology`, `/parallel-dev`, `/task-tracker status`
**Prompt:** `/prompt "rough prompt"` — classify, score, improve, and align any prompt before execution
**Sync:** `/sync --check`, `/sync --fix`, `/sync --full-rescan`

## RBAC
Role loaded from `.claude/session.env` (`CURRENT_ROLE`). Run `/setup-workspace` first.

## PRE-WRITE RULE (ALL ROLES)
Before creating any new file/function/class/component: search codebase for existing implementation, read /docs/patterns/, check /docs/GLOSSARY.md, read /docs/STANDARDS.md. If similar exists: EXTEND or REUSE — never duplicate.

## Rules (9, auto-scoped by file paths)
**Code:** accuracy, prompt-efficiency, request-validation, logging, code-standards | **Workflow:** context-budget, task-brief, task-lifecycle | **Docs:** domain-terms
