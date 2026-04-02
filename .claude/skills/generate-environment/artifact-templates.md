# Artifact Templates for Generation

## CLAUDE.md Full Template
```markdown
# Project: {name}
{one-line description}

## Tech Stack
- **Backend:** {language} {version} + {framework} {version} ({api_style})
- **Frontend:** {framework} {version} + {meta_framework} {version} ({rendering_mode})
- **Database:** {database_type} + {orm} ({migration_tool})
- **Cache:** {cache_system}
- **Queue:** {queue_system}
- **Infra:** {containerization} + {orchestration} + {cloud_provider}
- **CI/CD:** {platform} ({config_file})

## Quick Commands
- Install: `{install_command}`
- Build: `{build_command}`
- Dev: `{dev_command}`
- Test all: `{test_command}`
- Test single: `{single_test_command}`
- Lint: `{lint_command}`
- Format: `{format_command}`
- Type check: `{type_check_command}`
- Migrate: `{migration_command}`

## Architecture
- Type: {monolith | modular | microservices}
- Pattern: {MVC | Clean | DDD | Hexagonal | Feature-based}
- Data flow: {request → middleware → controller → service → repository → DB}
- Auth: {mechanism} via {library}

## Code Style
- {ONLY rules differing from linter config}
- Import order: {if custom}
- Error pattern: {convention}

## Git Conventions
- Branch: `{pattern}`
- Commit: `{format}`
- PR: `{requirements}`

## Key Paths
- Entry points: `{path}`
- API routes: `{path}`
- Services: `{path}`
- Models: `{path}`
- Migrations: `{path}`
- Shared/common: `{path}`
- Types: `{path}`
- Frontend components: `{path}`
- Tests: `{path}` (unit), `{path}` (e2e)
- Generated (DO NOT EDIT): `{path}`

## Gotchas
- {non-obvious thing with file:line ref}

## Testing
- Unit: `{framework}` — `{command}` — pattern: `{naming}`
- E2E: `{framework}` — `{command}`
- Coverage: `{command}`

@.claude/rules/domain-terms.md
```

## Rule File Templates

### domain-terms.md
```yaml
---
paths: ["**/*"]
---
# Domain Terms
- {Term}: {Definition as used in THIS codebase}
```

### api.md
```yaml
---
paths: ["src/api/**/*", "src/routes/**/*"]
---
# API Rules
- Endpoint naming: {pattern}
- Request validation: {library} — {pattern}
- Response format: {format}
- Error format: {format}
- Auth: {how to protect endpoints}
```

### testing.md
```yaml
---
paths: ["**/*.test.*", "**/*.spec.*", "tests/**/*"]
---
# Testing Rules
- File naming: {pattern}
- Test naming: {convention}
- Mocks: {library and pattern}
- Integration vs unit: {boundary}
```

### frontend.md
```yaml
---
paths: ["src/components/**/*", "src/pages/**/*", "app/**/*"]
---
# Frontend Rules
- Component pattern: {hooks | Composition API | class-based}
- Styling: {approach}
- State: {when global vs local}
- Data fetching: {pattern}
```

### database.md
```yaml
---
paths: ["src/db/**/*", "migrations/**/*", "src/models/**/*"]
---
# Database Rules
- Migration naming: {convention}
- Query pattern: {repository | active record | query builder}
- ORM: {orm_name} — always use parameterized queries
- Transactions: {how to wrap multi-step operations}
```

### security.md
```yaml
---
paths: ["src/auth/**/*", "src/api/**/*"]
---
# Security Rules
- Validate ALL inputs with {library}
- Never log PII
- Parameterized queries only via {orm}
- Auth on every non-public endpoint
```

### infrastructure.md
```yaml
---
paths: ["Dockerfile*", "docker-compose*", "terraform/**/*", ".github/workflows/**/*", "k8s/**/*"]
---
# Infrastructure Rules
- Docker: {base image policy, multi-stage build pattern}
- CI: {what must pass before merge}
- Env vars: {naming convention}
- Secrets: {management approach}
```

### code-standards.md (structure, naming, SOLID — max 50 lines)
```yaml
---
paths: ["{source_file_globs}"]
---
# Code Standards — Structure, Naming, SOLID

## Structural Limits
- Max file length: {max_file_lines} lines | Max function: {max_method_lines} lines
- Max parameters: {max_params} | Max nesting: {max_nesting} levels
- Max cyclomatic complexity: 10 per function

## Naming Conventions
- Functions: {function_naming} | Classes: {class_naming} | Constants: {constant_naming}
- Files: {file_naming} | Booleans: {boolean_prefix} (is, has, should, can)
- Events: past tense ({event_naming}) | Tests: {test_naming_pattern}
- No single-letter variables except i, j, k in loops and e for error/event

## SOLID & Architecture
- SRP: One reason to change per class/module — split mixed responsibilities
- OCP: Extend via {extension_pattern}, not if/else chains
- LSP: Subtypes honor base contract | ISP: Small focused interfaces
- DIP: Business logic depends on abstractions. Use {di_pattern}

## No Magic Values
- Named constants or enums only — no inline magic numbers/strings
- Exception: 0, 1, -1, empty string, true/false, HTTP status codes

## Constants Location
- Constants in dedicated files (`constants.{ext}`, `enums/`, `config/`) — never in business logic
- Group by domain: `auth.constants.{ext}`, `payment.constants.{ext}`

## Imports
- Order: {import_order} (stdlib → external → internal)
- Remove unused imports | No circular dependencies
```

### code-safety.md (type safety, errors, testability, concurrency — max 50 lines)
```yaml
---
paths: ["{source_file_globs}"]
---
# Code Safety — Type Safety, Error Handling, Testability, Concurrency

## Type Safety
- No `any`/`object`/`dynamic` — use specific types or generics
- No unsafe casts unless in thin adapter with comment
- Nullable types explicitly handled | Discriminated unions over loose strings

## Error Handling
- Domain-specific error types — never generic Error/Exception
- Catch specific types — no bare catch/except | Include message + code + cause
- Network/IO MUST have timeouts | Retry only idempotent ops
- Translate infra errors to domain errors at boundary | Never swallow errors

## Testability
- All deps injectable — no new ConcreteService() in business logic
- No static business methods | No direct env/time/filesystem access — inject
- No hardcoded URLs/endpoints — inject via config

## Concurrency & Async
- All async awaited or fire-and-forget with error handler
- No nested callbacks >1 level | Shared state must use synchronization
- Immutable data preferred for concurrent access

## Memory & Resources
- Subscriptions/listeners disposed on cleanup
- Resources closed in finally/defer/using/with
- String concat in loops: use builder | Caches must have TTL
```

### code-platform.md (database, API, i18n, platform — max 50 lines)
```yaml
---
paths: ["{source_file_globs}"]
---
# Code Platform — Database, API, i18n, Platform-Specific

## Database & Persistence
- All queries parameterized — zero string interpolation
- Batch ops for bulk insert/update | Transaction scope minimal
- Migrations backwards-compatible or rollback plan | Indexes on queried fields

## API Design
- HTTP methods semantically correct (GET/POST/PUT/PATCH/DELETE)
- All lists paginated | Status codes accurate (201, 404, 409)
- Input validated at boundary | Response envelope consistent

## Internationalization (i18n)
- No hardcoded user-facing strings — use i18n keys
- Locale-aware formatters for dates/numbers/currency
- Timestamps stored as UTC — local only for display
- Parameterized templates for sentences — no concatenation

## Platform-Specific (applied by scan results)
- Web: semantic HTML, ARIA, keyboard nav, error boundaries, lazy loading
- Mobile: lifecycle mgmt, permissions, background limits, battery efficiency
- Desktop: UI on main thread, heavy work offloaded, window state
- Embedded: bounded allocs, deterministic timing, HAL, minimal ISRs
```

## Nested CLAUDE.md Template (per module)
```markdown
# {Module Name}
{one-line purpose}

## Commands
- Test: `{module_test_cmd}`
- Build: `{module_build_cmd}`

## Patterns
- {module-specific patterns only}

## Dependencies
- Depends on: {internal modules}
- Depended on by: {internal modules}
```

## Profile Templates

### backend.md
```markdown
# Backend Developer Profile
Focus: API development, database, business logic
Agents: @debugger, @api-builder, @tester
Commands: Run API `{api_start_cmd}`, Test `{backend_test_cmd}`, Migrate `{migration_cmd}`
Load: .claude/rules/api.md, .claude/rules/database.md
```

### frontend.md
```markdown
# Frontend Developer Profile
Focus: UI components, styling, user experience
Agents: @frontend, @tester
Commands: Dev `{frontend_dev_cmd}`, Test `{frontend_test_cmd}`, Storybook `{storybook_cmd}`
Load: .claude/rules/frontend.md
```

### devops.md
```markdown
# DevOps Profile
Focus: Infrastructure, CI/CD, deployment
Agents: @infra
Commands: Deploy `{deploy_cmd}`, Logs `{log_cmd}`, Status `{status_cmd}`
Load: .claude/rules/infrastructure.md
```

## Settings.json Template
```json
{
  "permissions": {
    "allow": [
      "Bash({pkg_mgr} test *)", "Bash({pkg_mgr} run *)",
      "Bash({build_cmd})", "Bash({lint_cmd})",
      "Bash(git status)", "Bash(git diff *)", "Bash(git log *)"
    ],
    "deny": [
      "Bash(rm -rf /)", "Bash(sudo *)",
      "Bash(git push --force *)", "Bash(git reset --hard)"
    ]
  },
  "hooks": {
    "SessionStart": [{"matcher": "startup|resume|compact", "hooks": [{"type": "command", "command": "node .claude/hooks/session-start.js"}]}],
    "PreToolUse": [
      {"matcher": "Edit|Write", "hooks": [{"type": "command", "command": "node .claude/hooks/protect-files.js"}]},
      {"matcher": "Bash", "hooks": [{"type": "command", "command": "node .claude/hooks/validate-bash.js"}]}
    ],
    "PostToolUse": [{"matcher": "Edit|Write", "hooks": [{"type": "command", "command": "node .claude/hooks/post-edit-format.js"}]}],
    "Notification": [{"matcher": "permission_prompt", "hooks": [{"type": "command", "command": "node .claude/hooks/notify-approval.js"}]}],
    "Stop": [{"hooks": [{"type": "prompt", "prompt": "Check if task is complete. Tests pass, no lint errors, no type errors. Return {\"ok\": true} or {\"ok\": false, \"reason\": \"what's missing\"}", "model": "haiku"}]}]
  }
}
```

## Hook Script Templates (Cross-Platform Node.js)

All hooks use Node.js for cross-platform compatibility (Windows, macOS, Linux). No bash or jq dependency required.

### protect-files.js
```javascript
#!/usr/bin/env node
// Pre-tool hook: block edits to protected files
let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) process.exit(0);
    const PROTECTED = ['.env', '.env.local', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.github/workflows/'];
    for (const p of PROTECTED) {
      if (file.includes(p)) { process.stderr.write(`BLOCKED: ${file} is protected.\n`); process.exit(2); }
    }
  } catch {}
  process.exit(0);
});
```

### post-edit-format.js
```javascript
#!/usr/bin/env node
// Post-tool hook: auto-format edited files
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file || !fs.existsSync(file)) process.exit(0);
    const ext = path.extname(file).toLowerCase();
    const formatters = {
      '.ts': 'npx prettier --write', '.tsx': 'npx prettier --write',
      '.js': 'npx prettier --write', '.jsx': 'npx prettier --write',
      '.json': 'npx prettier --write', '.css': 'npx prettier --write',
      '.py': 'black', '.go': 'gofmt -w', '.rs': 'rustfmt',
    };
    const formatter = formatters[ext];
    if (formatter) { try { execSync(`${formatter} "${file}"`, { stdio: 'ignore', timeout: 10000 }); } catch {} }
  } catch {}
  process.exit(0);
});
```

### validate-bash.js
```javascript
#!/usr/bin/env node
// Pre-tool hook: block dangerous bash commands
let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const cmd = (data.tool_input && data.tool_input.command) || '';
    if (!cmd) process.exit(0);
    const DANGEROUS = ['rm -rf /', ':(){ :|:& };:', '> /dev/sda', 'mkfs', 'dd if=', 'curl.*| bash'];
    for (const p of DANGEROUS) {
      if (cmd.includes(p)) { process.stderr.write('BLOCKED: Dangerous command.\n'); process.exit(2); }
    }
  } catch {}
  process.exit(0);
});
```

### session-start.js
```javascript
#!/usr/bin/env node
// Re-inject critical context on session start
const fs = require('fs');
const path = require('path');
console.log('PROJECT: {package_manager} | Test: {test_cmd} | Lint: {lint_cmd} | Build: {build_cmd}');
const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
if (fs.existsSync(tasksDir)) {
  for (const file of fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(tasksDir, file), 'utf-8');
    if (/status:\s*(DEVELOPING|DEV_TESTING)/.test(content)) {
      const title = (content.match(/^title:\s*(.+)$/m) || [])[1];
      if (title) console.log(`ACTIVE TASK: ${title.trim()}`);
      break;
    }
  }
}
```

### notify-approval.js
```javascript
#!/usr/bin/env node
// Cross-platform OS notification when Claude needs user approval
const { execSync } = require('child_process');
const MSG = 'Claude Code needs your approval';
function tryExec(cmd) { try { execSync(cmd, { stdio: 'ignore', timeout: 5000 }); } catch {} }
if (process.platform === 'darwin') {
  tryExec(`osascript -e 'display notification "${MSG}" with title "Claude Code"'`);
} else if (process.platform === 'win32') {
  tryExec(`powershell.exe -NoProfile -Command "Add-Type -A System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${MSG}','Claude Code')"`);
} else {
  tryExec(`notify-send "Claude Code" "${MSG}"`);
}
```

## Auto-Progress Hook (add to settings.json hooks)
Track file changes for active task:
```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {"type": "command", "command": "node .claude/hooks/track-file-changes.js"}
      ]
    }
  ]
}
```

### track-file-changes.js
```javascript
#!/usr/bin/env node
// Post-tool hook: track file changes for active task
const fs = require('fs');
const path = require('path');
let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const file = (data.tool_input && data.tool_input.file_path) || '';
    if (!file) process.exit(0);
    const tasksDir = path.join(process.cwd(), '.claude', 'tasks');
    if (!fs.existsSync(tasksDir)) process.exit(0);
    for (const tf of fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'))) {
      const taskPath = path.join(tasksDir, tf);
      const content = fs.readFileSync(taskPath, 'utf-8');
      if (/status:\s*(DEVELOPING|DEV_TESTING)/.test(content)) {
        const logPath = taskPath.replace(/\.md$/, '_changes.log');
        fs.appendFileSync(logPath, `| ${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')} | file_changed | ${file} |\n`);
        break;
      }
    }
  } catch {}
  process.exit(0);
});
```

## Code Template Extraction Instructions
For each template type (component, endpoint, service, model, test):
1. Read 3-5 existing files of that type
2. Identify the common skeleton (imports, structure, exports)
3. Replace specific names with `{Placeholder}`
4. Preserve exact: import order, export style, prop pattern, error handling
5. Include both code skeleton AND test skeleton
