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
# Code Standards — Auto-Enforced on Every Edit

## Structural Limits
- **Max file length:** 300 lines (split into modules if exceeded)
- **Max function/method:** 40 lines (extract helpers if exceeded)
- **Max parameters:** 4 (use an options/config object beyond 4)
- **Max nesting depth:** 3 levels (extract early returns or helper functions)

## Naming Conventions (language-agnostic defaults)
- Functions/methods: `camelCase` (or `snake_case` in Python/Ruby/Go)
- Classes/types/interfaces: `PascalCase`
- Constants/enums: `UPPER_SNAKE_CASE`
- Files: `kebab-case` or match framework convention
- Booleans: prefix with `is`, `has`, `should`, `can`
- Tests: `describe("Unit")` / `test("should do X when Y")`

## SOLID & Architecture Patterns
- **SRP:** One reason to change per class/module. If a class does auth + business logic + logging → split.
- **OCP:** Extend via interfaces/strategy, not growing if/else chains. New feature = new class, not modified old class.
- **LSP:** Subtypes must honor base contract. Never throw NotImplementedError in an override.
- **ISP:** Small focused interfaces. If implementors stub half the methods → split the interface.
- **DIP:** Depend on abstractions. Business logic imports interfaces, not concrete classes. Use constructor injection.
- **Pattern:** Interface/abstract first → implementation class. Never `new ConcreteService()` in business logic.

## No Magic Values
- No magic numbers or strings — define named constants or enums
- Exception: 0, 1, -1, empty string, true/false, HTTP status codes in route handlers

## Duplication & Imports
- No duplicate code blocks (3+ lines repeated) — extract to shared function
- Import order: stdlib/builtins first, external packages second, internal modules third
- Remove unused imports before committing
