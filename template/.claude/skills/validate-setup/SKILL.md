---
name: validate-setup
description: Validate the generated Claude Code environment meets all standards. Use after /generate-environment completes.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[--fix] [--verbose]"
---

# Validate Setup

## Checks
1. **CLAUDE.md** — exists, under 150 lines (recommended under 200), no `{placeholder}` values
2. **Rules** — each under 50 lines, has `paths:` frontmatter for scoped rules
3. **Agents (18 required)** — SDLC roles (team-lead, architect, product-owner, qa-lead), core (explorer, reviewer, security, debugger, tester, code-quality), pre-dev (ideator, strategist, scaffolder, ux-designer), dev (frontend, api-builder, infra, mobile). Each has name/description/tools, read-only agents have `permissionMode: plan` and `disallowedTools`, dev agents have `isolation: worktree`, all have `memory: project`, structured output with HANDOFF block and Limitations section
4. **Skills** — each has name/description, heavy ones have `context: fork`, user-facing have `argument-hint`, dangerous ones have `disable-model-invocation: true`
5. **Settings** — valid JSON, has `permissions.defaultMode`, `permissions.allow`, `permissions.deny`, `env`, all hooks registered
6. **Hooks** — Node.js scripts exist and are valid, all hooks in settings.json point to existing files
7. **Templates** — extracted from real code (not generic)
8. **.gitignore** — includes settings.local.json, tasks/, reports/
9. **Commands work** — parse `Quick Commands` from CLAUDE.md, check dependencies are installed (node_modules, .dart_tool, poetry.lock), smoke-test lint/type-check commands. Skip if deps not installed (WARN, not SKIP)
10. **Context budget** — total always-loaded under 200 lines, run `/context`
11. **Handoff protocol** — workflow skill includes structured HANDOFF format
12. **Loop tracking** — task record schema includes Loop State section

## Run verification script
```bash
node .claude/scripts/verify-setup.js
```

Report results as PASS/FAIL/WARN with specific fix instructions for failures.
