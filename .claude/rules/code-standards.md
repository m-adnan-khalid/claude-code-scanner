---
paths: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx", "**/*.py", "**/*.go", "**/*.java", "**/*.rb", "**/*.cs", "**/*.swift", "**/*.kt", "**/*.dart", "**/*.rs", "**/*.cpp", "**/*.c", "**/*.php", "**/*.scala"]
---
# Code Standards — Structure, Naming, SOLID

## Structural Limits
- **Max file length:** 300 lines (split into modules if exceeded)
- **Max function/method:** 40 lines (extract helpers if exceeded)
- **Max parameters:** 4 (use an options/config object beyond 4)
- **Max nesting depth:** 3 levels (extract early returns or helper functions)
- **Max cyclomatic complexity:** 10 per function (split into pipeline/strategy if exceeded)

## Naming Conventions (language-agnostic defaults)
- Functions/methods: `camelCase` (or `snake_case` in Python/Ruby/Go/Rust)
- Classes/types/interfaces: `PascalCase`
- Constants/enums: `UPPER_SNAKE_CASE`
- Files: `kebab-case` or match framework convention
- Booleans: prefix with `is`, `has`, `should`, `can`
- Event names: past tense (`UserCreated`, `OrderShipped`)
- Tests: `describe("Unit")` / `test("should do X when Y")`
- No single-letter variables except `i`, `j`, `k` in loops and `e` for error/event

## SOLID & Architecture Patterns
- **SRP:** One reason to change per class/module — split mixed responsibilities
- **OCP:** Extend via interfaces/strategy, not if/else chains
- **LSP:** Subtypes must honor base contract — no NotImplementedError overrides
- **ISP:** Small focused interfaces — split if implementors stub methods
- **DIP:** Depend on abstractions. Use constructor injection. Never `new ConcreteService()` in business logic.

## No Magic Values
- No magic numbers or strings — define named constants or enums
- Exception: 0, 1, -1, empty string, true/false, HTTP status codes in route handlers

## Constants Location
- Constants MUST be in dedicated files (`constants.*`, `enums/`, `config/`) — never inline in business logic
- Group by domain: `auth.constants.*`, `payment.constants.*`
- Enums and value objects: define in own module, import where needed

## Duplication & Imports
- No duplicate code blocks (3+ lines repeated) — extract to shared function
- Import order: stdlib → external → internal
- Remove unused imports before committing
- No circular dependencies between modules
