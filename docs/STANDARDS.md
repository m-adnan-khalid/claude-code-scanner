# Coding Standards

All team members MUST read this before writing any code. Match exactly. Do not deviate.

## 1. Naming
- **Files:** kebab-case for all files (e.g., `user-service.ts`, `auth-middleware.py`)
- **Classes:** PascalCase (e.g., `UserService`, `AuthMiddleware`)
- **Functions/Methods:** camelCase (JS/TS) or snake_case (Python/Go/Rust)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Interfaces/Types:** PascalCase with `I` prefix optional (e.g., `UserDTO`, `IUserService`)
- **Database:** snake_case for tables and columns (e.g., `user_accounts`, `created_at`)
- **API Routes:** kebab-case plural nouns (e.g., `/api/v1/user-accounts`)
- **Environment Variables:** UPPER_SNAKE_CASE (e.g., `DATABASE_URL`)
- **Check GLOSSARY.md** before naming any entity, route, event, or variable. Use exact terms. Never synonym.

## File Structure
- One export per file for major modules (services, controllers, models)
- Group by feature/domain, not by type (e.g., `users/service.ts` not `services/user-service.ts`)
- Index files for barrel exports only — no logic in index files
- Tests colocated: `module.test.ts` next to `module.ts` OR in parallel `tests/` tree

## 2. Imports
1. Standard library / runtime imports
2. Third-party packages (alphabetical)
3. Internal absolute imports (alphabetical)
4. Internal relative imports (closest first)
5. Type-only imports last
- Blank line between each group

## 3. Error Handling
- Use custom error classes extending base Error (e.g., `NotFoundError`, `ValidationError`)
- Never swallow errors silently — log then rethrow or handle explicitly
- API errors return consistent shape: `{ error: { code, message, details? } }`
- Use try/catch at service boundaries, not around every line
- Never use error codes as strings — define enum/constants

## 4. Logging
- See /docs/STANDARDS-logging.md or `.claude/rules/logging.md` for full logging standards
- Structured JSON in production, human-readable in development
- Include: timestamp, level, message, service, requestId
- Never log PII, secrets, tokens, passwords

## 5. Testing
- File naming: `[module].test.ts` or `test_[module].py`
- Structure: Arrange / Act / Assert (AAA pattern)
- One assertion concept per test (multiple asserts OK if testing same concept)
- Test naming: `should [expected behavior] when [condition]`
- Required coverage: happy path, validation errors, auth errors, edge cases, not-found

## 6. Comments
- No comments for self-documenting code
- Comments explain WHY, not WHAT
- JSDoc/docstrings for public APIs only
- TODO format: `// TODO(username): description — TICKET-ID`

## 7. Commits
- Format: `type(scope): description`
- Types: feat, fix, refactor, test, docs, chore, ci, perf
- Scope: module or feature name
- Description: imperative mood, lowercase, no period
- Body: explain WHY, not WHAT (the diff shows what)
- Example: `feat(auth): add JWT refresh token rotation`

## Before Writing Code
- Read /docs/patterns/ for the relevant pattern
- Read /docs/GLOSSARY.md for correct terminology
- Read /docs/ARCHITECTURE.md for structural context
- Match existing code style in the file/module you're editing
