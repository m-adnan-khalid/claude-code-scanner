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
  - "**/*.swift"
  - "**/*.kt"
  - "**/*.dart"
---
# Accuracy Enforcement — Mandatory

## Before Writing Code
- Verify every import path exists: Glob for the file before referencing it
- Verify every function/method you call exists: Grep the target module
- Match API signatures exactly: parameter names, types, return types from source
- Check existing tests for usage patterns before inventing new ones

## Before Stating Facts
- File paths: Glob to confirm existence before citing
- Function names: Grep to confirm before referencing
- Package versions: Read package.json/requirements.txt/go.mod — never guess
- Config values: Read the actual config file, never assume defaults

## When Uncertain
- Say "I need to verify X" — then verify with a tool call
- Never fabricate: file paths, function names, API responses, error messages, config keys
- If you cannot verify after checking, state that explicitly

## After Writing Code
- Re-read the modified file to confirm your edit applied correctly
- Verify new imports resolve to real files (Glob check)
- Run lint/typecheck if available before declaring done
