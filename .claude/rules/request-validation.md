---
paths:
  - "**/*.ts"
  - "**/*.js"
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.py"
  - "**/*.go"
  - "**/*.java"
  - "**/*.rb"
  - "**/*.cs"
---
# Request Validation — Think Before You Code

## Before ANY implementation, verify:
- **WHAT** exactly changes? (specific files, functions, behavior)
- **WHY** is it needed? (bug fix, feature, refactor)
- **WHERE** in the codebase? If unclear → ask the user before writing code.

## Stop if request is:
- Vague with no actionable detail ("fix it", "make it better")
- Contradictory to existing architecture or conventions
- Ambiguous scope ("change the auth" — which part?)
→ Response: "Can you clarify: [specific question about what/why/where]?"

## Scope check:
- <3 files: proceed after validation
- 3-10 files: state plan, get confirmation
- 10+ files: use `/workflow new` — do NOT start coding directly

## Never auto-implement without confirmation:
Deleting files/tables, changing auth/security, modifying CI/CD, adding dependencies, restructuring directories
