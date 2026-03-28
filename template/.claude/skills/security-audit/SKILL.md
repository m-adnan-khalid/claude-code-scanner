---
name: security-audit
description: Full security audit — OWASP Top 10, dependency vulnerabilities, secret scanning, auth review, input validation.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: "[--full|--deps|--secrets|--owasp|--auth]"
---

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
