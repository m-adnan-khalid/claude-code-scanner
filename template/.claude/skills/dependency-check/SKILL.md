---
name: dependency-check
description: Check for outdated, vulnerable, or unused dependencies. Supports npm, pip, poetry, cargo, go, flutter.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[--outdated|--vulnerabilities|--unused|--licenses]"
---

# Dependency Check: $ARGUMENTS

## Process
1. Detect package manager (npm, pip, poetry, cargo, go, pub)
2. Run appropriate audit commands:
   - `npm audit` / `npm outdated`
   - `pip-audit` / `pip list --outdated`
   - `poetry show --outdated` / `safety check`
   - `cargo audit` / `cargo outdated`
   - `flutter pub outdated`
3. Check for unused dependencies (depcheck, deptry, etc.)
4. Check license compliance
5. Output report with update recommendations and risk assessment

## Definition of Done
- All deps scanned, vulnerabilities listed with severity, outdated packages flagged, upgrade path clear.

## Next Steps
- `/fix-bug` for critical vulnerabilities, `/refactor` for major upgrades.

## Rollback
- N/A (read-only check).
