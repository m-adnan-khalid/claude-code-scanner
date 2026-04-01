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

### code-standards.md
```yaml
---
paths: ["**/*.ts", "**/*.js", "**/*.tsx", "**/*.jsx", "**/*.py", "**/*.go", "**/*.java", "**/*.rb", "**/*.cs", "**/*.swift", "**/*.kt", "**/*.dart"]
---
# Code Standards — Auto-Enforced on Every Edit

## Structural Limits
- Max file length: {max_file_lines} lines (split into modules if exceeded)
- Max function/method: {max_method_lines} lines (extract helpers if exceeded)
- Max parameters: {max_params} (use an options/config object beyond limit)
- Max nesting depth: {max_nesting} levels (extract early returns or helpers)

## Naming Conventions
- Functions/methods: {function_naming} (e.g., camelCase, snake_case)
- Classes/types: {class_naming} (e.g., PascalCase)
- Constants/enums: {constant_naming} (e.g., UPPER_SNAKE_CASE)
- Files: {file_naming} (e.g., kebab-case, PascalCase for components)
- Booleans: {boolean_prefix} (e.g., is, has, should, can)
- Tests: {test_naming_pattern} (e.g., "should do X when Y")

## SOLID & Architecture Patterns
- SRP: One reason to change per class/module — split mixed responsibilities
- OCP: Extend via {extension_pattern} (e.g., interfaces/strategy), not if/else chains
- LSP: Subtypes must honor base contract — no NotImplementedError overrides
- ISP: Small focused interfaces — split if implementors stub methods
- DIP: Business logic depends on abstractions. Use {di_pattern} (e.g., constructor injection)
- Pattern: {architecture_pattern} (e.g., interface → implementation, repository pattern)

## No Magic Values
- Define named constants or enums — no inline magic numbers/strings
- Exception: 0, 1, -1, empty string, true/false, HTTP status codes in handlers

## Imports
- Order: {import_order} (e.g., stdlib → external → internal)
- Remove unused imports before committing
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
