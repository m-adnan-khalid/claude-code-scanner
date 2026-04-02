---
paths: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx", "**/*.py", "**/*.go", "**/*.java", "**/*.rb", "**/*.cs", "**/*.swift", "**/*.kt", "**/*.dart", "**/*.rs", "**/*.cpp", "**/*.c", "**/*.php", "**/*.scala"]
---
# Accuracy Enforcement — Mandatory

## Before Writing Code
- Verify every import path exists: Glob for the file before referencing it
- Verify every function/method you call exists: Grep the target module
- Match API signatures exactly: parameter names, types, return types from source
- Check existing tests for usage patterns before inventing new ones

## Before Using External APIs / Frameworks / Libraries (MANDATORY 3-STEP)
**Step 1 — Read version:** Read the project's dependency file (`package.json`, `requirements.txt`, `pubspec.yaml`, `go.mod`, `Cargo.toml`, `build.gradle`, `Podfile`, `pom.xml`, `.csproj`) to get the EXACT installed version.
**Step 2 — Search version-specific docs:** WebSearch `"<library/framework> <exact version> <API/method/class> documentation"`. Never use docs for a different version.
**Step 3 — Write code:** Only after Steps 1-2 may you write code using that API.
- Never assume API signatures, method names, or patterns from training data alone
- Re-verify when using: deprecated, newly added, or version-changed APIs

## Before Stating Facts
- File paths: Glob to confirm existence before citing
- Function names: Grep to confirm before referencing
- Package versions: Read package.json/requirements.txt/go.mod — never guess
- Config values: Read the actual config file, never assume defaults

## When Uncertain
- Say "I need to verify X" — then verify with a tool call
- Never fabricate: file paths, function names, API responses, error messages, config keys
- Never guess framework APIs — WebSearch the official docs instead
- If you cannot verify after checking, state that explicitly

## After Writing Code
- Re-read the modified file to confirm your edit applied correctly
- Verify new imports resolve to real files (Glob check)
- Run lint/typecheck if available before declaring done
