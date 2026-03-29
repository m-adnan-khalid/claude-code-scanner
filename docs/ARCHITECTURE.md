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

## Service Boundaries
- **Scanner Service** — Stateless; reads source files, emits TECH_MANIFEST JSON. No writes to target project.
- **Generator Service** — Consumes TECH_MANIFEST, writes all artifacts to output directory. No network calls.
- **Validator Service** — Read-only verification of generated output. Returns pass/fail with diagnostics.
- **Smithery Service** — Network-dependent; queries MCP registry, installs servers. Isolated from generation.
- **Hook Runtime** — Event-driven; each hook runs in its own subprocess with scoped env vars. No shared state between hooks.

## Tech Stack
- **Runtime:** Node.js (scripts, hooks), Bash (setup, CI glue)
- **Configuration:** JSON (settings.json, package.json), Markdown (CLAUDE.md, rules, agents, skills)
- **Template Engine:** Placeholder substitution (`{placeholder}` replaced from TECH_MANIFEST values)
- **CI/CD:** GitHub Actions (lint, validate, version check)
- **Testing:** Shell-based verification scripts, JSON schema validation
- **MCP Integration:** Smithery registry for tool servers

## Data Flow
1. **Input** — User runs `/scan-codebase` on a target project directory.
2. **Scan** — 6 parallel agents fingerprint the codebase, each writing partial results.
3. **Manifest** — Partial results merge into a single `TECH_MANIFEST` JSON object.
4. **Generate** — Generator reads TECH_MANIFEST, resolves all placeholders, writes artifacts to `/template/`.
5. **Validate** — Validator reads generated files, checks line counts, JSON validity, hook permissions.
6. **Deploy** — Validated artifacts are copied into the target project's `.claude/` directory.

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
