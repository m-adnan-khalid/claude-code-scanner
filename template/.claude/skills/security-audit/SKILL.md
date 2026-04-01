---
name: security-audit
description: Full security audit — OWASP Top 10, dependency vulnerabilities, secret scanning, auth review, input validation.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[--full|--deps|--secrets|--owasp|--auth]"
roles: [CTO, TechLead, Architect, DevOps]
agents: [@security, @code-quality, @gatekeeper]
---

**Lifecycle: T2 (audit/analysis) — See `_protocol.md`**

**RULES:** Every output MUST end with `NEXT ACTION:`. Update MEMORY.md after completion.

## Step 0 — Load Context

1. **Session:** Read `.claude/session.env` → get CURRENT_ROLE
2. **Memory:** Read `MEMORY.md` (if exists) → get last completed task, prior audit results
3. **Git state:** Run `git status`, `git branch` → get branch, uncommitted changes
4. **Active work:** Read `TODO.md` (if exists) → get current work items

Output:
```
CONTEXT: [CURRENT_ROLE] on [branch] | last: [last task] | git: [clean/dirty]
```


# Security Audit: $ARGUMENTS

## Process
1. Invoke @security agent for comprehensive review
2. Check categories:
   - **OWASP Top 10**: injection, broken auth, XSS, CSRF, etc.
   - **Dependencies**: `npm audit` / `pip-audit` / `cargo audit` for known CVEs
   - **Secrets**: scan for hardcoded API keys, passwords, tokens in code
   - **Auth/AuthZ**: review authentication flow, permission checks, token handling
   - **Input validation**: check all user inputs are sanitized
   - **HTTPS/TLS**: verify secure communication
   - **Error handling**: no stack traces leaked to users
3. Output severity-ranked findings with fix guidance

## Output
| # | Severity | Category | Finding | File:Line | Fix |

## Definition of Done
- OWASP Top 10 checked, dependencies scanned, secrets scanned, findings categorized by severity.

## Next Steps
- `/fix-bug` for critical findings, `/workflow resume` for clean audit.
- `/api-test` — verify auth flows, injection resistance, error handling with real HTTP requests
- `/e2e-browser` — verify XSS prevention, CSRF protection in real browser

## Rollback
- N/A (read-only audit).

## Post-Completion

### Update Memory
Update MEMORY.md (create if needed):
- **Skill:** /[this skill name]
- **Task:** audit completed
- **When:** [timestamp]
- **Result:** [PASS/FAIL/PARTIAL — N issues found]
- **Output:** [report file path if any]
- **Next Step:** [fix top priority issues / re-run after fixes / all clear]

### Audit Log
Append to `.claude/reports/audit/audit-{branch}.log`:
```
[timestamp] | [ROLE] | [branch] | [SKILL_NAME] | [summary] | [result]
```

### Final Output
```
NEXT ACTION: Audit complete. Here's what you can do:
             - To fix issues, say "fix [issue]" or run /fix-bug
             - To re-run this audit, run the same command again
             - To run another audit, pick the relevant audit command
```
