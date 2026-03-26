# Master Command Reference Template

Generate this as `.claude/docs/commands.md` with actual values.

## 1. Claude Code CLI
| Command | Purpose |
|---------|---------|
| `claude` | Start new session |
| `claude --continue` | Resume last session |
| `claude --resume "name"` | Resume named session |
| `claude -p "prompt"` | Non-interactive mode |
| `claude --agent name` | Start with agent persona |
| `claude --worktree "name"` | Parallel isolated work |
| `claude --permission-mode plan` | Read-only mode |
| `claude --fast` | Fast output mode |

## 2. Session Commands
`/help`, `/clear`, `/compact`, `/compact "focus"`, `/context`, `/cost`, `/model`, `/fast`, `/rewind`, `/rename "name"`, `/mcp`, `/config`, `/agents`, `Shift+Tab` (permission mode), `Alt+T` (thinking), `Esc` (stop)

## 3. Slash Skills
Workflow: `/workflow new|status|plan|dev|review|qa|deploy`, `--hotfix`, `--spike`
Tracking: `/task-tracker create|status|update|report|dashboard|history|blockers|metrics`
Development: `/add-feature`, `/add-endpoint`, `/add-component`, `/add-page`, `/fix-bug`, `/migrate`, `/onboard`, `/architecture`
Review: `/review-pr`, `/impact-analysis`, `/design-review`, `/qa-plan`
Reports: `/progress-report dev|qa|business|management|executive`, `/metrics velocity|quality|cycle-time|agents|all`, `/standup`, `/execution-report [task-id|last|all] [--phase N]`
Sync: `/sync --check`, `/sync --fix`, `/sync --fix --component agents|skills|rules|hooks|claude-md`, `/sync --full-rescan`
Deploy: `/signoff qa|business|tech`, `/deploy staging|production`, `/rollback deploy|code|phase [task-id]`
Context: `/context-check`
Smithery: `/discover-skills`

## 4. Agent Team (@-mentions)

### SDLC Role Agents
| Agent | Role | Access | Responsibility |
|-------|------|--------|---------------|
| `@team-lead` | Tech Lead | Read/Write | Orchestrates, assigns, tech sign-off |
| `@architect` | Architect | Read-only | Design review, system design |
| `@product-owner` | Product Owner | Read-only | Acceptance criteria, biz sign-off |
| `@qa-lead` | QA Lead | Read-only | QA planning, QA sign-off |

### Core Agents
| Agent | Role | Access | Responsibility |
|-------|------|--------|---------------|
| `@explorer` | Investigator | Read-only | Codebase exploration, impact mapping |
| `@reviewer` | Reviewer | Read-only | Code quality, conventions |
| `@security` | Security | Read-only | Vulnerability review, OWASP |
| `@debugger` | Debugger | Read/Write | Root cause analysis, bug fixes |
| `@tester` | Tester | Read/Write | Automated tests, coverage |

### Dev Agents (generated based on codebase)
| Agent | Role | Access | Responsibility |
|-------|------|--------|---------------|
| `@api-builder` | Backend Dev | Read/Write + worktree | Endpoints, services |
| `@frontend` | Frontend Dev | Read/Write + worktree | Components, pages |
| `@infra` | DevOps | Read/Write | Docker, CI/CD, deployment |

## 5. Project Commands (fill from TECH_MANIFEST)
Dev: `{install}`, `{dev}`, `{build}`
Test: `{test_all}`, `{test_single}`, `{coverage}`, `{e2e}`
Quality: `{lint}`, `{format}`, `{type_check}`, `{audit}`
DB: `{migrate_create}`, `{migrate_run}`, `{migrate_rollback}`, `{seed}`
Infra: `{docker_dev}`, `{staging_deploy}`, `{prod_deploy}`, `{rollback}`, `{health_check}`

## 6. Git Workflow
Branch: `git checkout -b {prefix}/<name>`
Commit: `git commit -m "{format}: description"`
PR: `gh pr create`, `gh pr checks`, `gh pr merge --{strategy}`

## 7. Smithery CLI
`smithery skill search|add`, `smithery mcp search|add|list|remove`, `smithery tool list|find`, `smithery auth login`

## 8. Setup Scripts
`.claude/scripts/verify-setup.js` (cross-platform Node.js)
