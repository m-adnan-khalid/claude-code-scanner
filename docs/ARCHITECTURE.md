# System Architecture

**Owner:** Tech Lead + Architect
**Last Updated:** 2026-03-29

## Overview
This is the Codebase Scanner & Claude Code Environment Generator — a framework that scans codebases and generates production-ready Claude Code environments.

## Two-Layer Architecture
1. **Root layer** (`/`) — Scanner tools, framework config, CI hooks, and project-level CLAUDE.md. This is the development environment for the scanner itself.
2. **Template layer** (`/template/`) — Generated output artifacts (agents, hooks, skills, rules, settings) that get copied into target projects. This is what end users receive.

Root owns the pipeline; template owns the product.

## System Components

### Core Pipeline
1. **Scanner** — Fingerprints tech stack, architecture, conventions (6 parallel agents)
2. **Generator** — Produces all Claude Code artifacts from TECH_MANIFEST
3. **Validator** — Checks generated environment quality
4. **Smithery** — Installs matching MCP servers

### Runtime Layer
- **25 Agents** — Role-based subagents with tool restrictions
- **85 Skills** — Workflow automations (slash commands)
- **8 Rules** — Path-scoped coding constraints
- **27 Hooks** — Pre/Post tool-use automation (9 root + 18 template)

### Enterprise Governance
- **RBAC** — 10 roles with path-scoped permissions
- **Audit Log** — Branch-scoped structured logging
- **Drift Detection** — CLAUDE.md version checking
- **QA Gates** — Mandatory before merge

## Architectural Decisions
All decisions recorded in `/docs/adr/`. Create new ADRs with:
- Context: why the decision was needed
- Decision: what was decided
- Consequences: what this enables and constrains

## Diagrams
See individual ADRs for component diagrams.

## Module Boundaries
| Module | Owner | Path | Dependencies |
|--------|-------|------|-------------|
| Scanner | Tech Lead | template/.claude/skills/scan-codebase/ | Agents |
| Generator | Tech Lead | template/.claude/skills/generate-environment/ | Scanner output |
| Agents | Architect | template/.claude/agents/ | Rules, Skills |
| Hooks | Tech Lead | template/.claude/hooks/ | Settings |
| Skills | Tech Lead | template/.claude/skills/ | Agents, Rules |
