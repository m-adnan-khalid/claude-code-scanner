---
name: parallel-dev
description: Analyze backlog for independent tasks and orchestrate parallel dev agents. Use when multiple features can be built simultaneously without conflicts.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[--analyze|--start|--status|--merge] [task-ids...]"
---

# Parallel Development Orchestrator: $ARGUMENTS

## Purpose
Maximize throughput by running independent dev tasks in parallel across the agent team. Each agent works in an isolated worktree — zero merge conflicts.

## Commands

### `/parallel-dev --analyze`
Scan the backlog and identify which tasks can run simultaneously.

**Steps:**
1. Read all tasks from `.claude/tasks/` and `.claude/project/BACKLOG.md`
2. For each pending/ready task, extract:
   - `depends-on` field (explicit dependencies)
   - `scope` field (backend/frontend/mobile/infra)
   - File paths that will be touched (from task description or impact analysis)
3. Build a **dependency graph** — two tasks conflict if:
   - Task A `depends-on` Task B (or vice versa)
   - Both tasks modify the same files or directories
   - Both tasks modify the same module's API contract (e.g., both change the same API endpoint)
4. Identify **independent groups** — tasks with NO edges between them in the graph
5. Output a parallel execution plan

**Output Format:**
```markdown
## Parallel Execution Plan

### Group 1 (can run NOW — no dependencies)
| Task | Scope | Agent | Files | Est. Complexity |
|------|-------|-------|-------|-----------------|
| TASK-003 | backend: auth | @api-builder | app/features/auth/ | M |
| TASK-005 | frontend: dashboard | @frontend | web/app/dashboard/ | S |
| TASK-007 | mobile: BLE sync | @mobile | lib/features/ble/ | L |

### Group 2 (after Group 1 completes)
| Task | Scope | Agent | Blocked By | Files |
|------|-------|-------|------------|-------|

### Cannot Parallelize (share files/dependencies)
| Task A | Task B | Conflict | Resolution |
|--------|--------|----------|------------|
| TASK-003 | TASK-004 | both modify auth/ | sequential |

### Recommended Execution
- **Parallel slots available:** 3 (backend + frontend + mobile)
- **Estimated time saved:** ~60% vs sequential
- **Risk:** LOW (no shared files)
```

### `/parallel-dev --start [task-ids...]`
Launch parallel dev agents for the specified independent tasks.

**Steps:**
1. Verify all specified tasks are independent (re-check dependency graph)
2. If any conflicts found → STOP and show conflicts, ask user to resolve
3. For each task, spawn a dev agent with `isolation: worktree`:
   - Match agent to scope: backend→@api-builder, frontend→@frontend, mobile→@mobile, infra→@infra
   - Pass task context: requirements, acceptance criteria, file scope
   - Set exit criteria: tests pass, lint clean, no regressions
4. Monitor all agents — report progress as each completes

**Agent Launch Template:**
```
Agent: @{agent-name}
Task: {task-id} — {title}
Scope: {file paths}
Requirements: {from task file}
Exit Criteria: tests pass, lint clean, coverage maintained
Isolation: worktree (separate branch: parallel/{task-id})
```

### `/parallel-dev --status`
Show the status of all running parallel agents.

**Output:**
```markdown
## Parallel Dev Status
| Task | Agent | Branch | Status | Turns | Files Changed |
|------|-------|--------|--------|-------|---------------|
| TASK-003 | @api-builder | parallel/TASK-003 | DEVELOPING (turn 12/30) | 12 | 4 |
| TASK-005 | @frontend | parallel/TASK-005 | COMPLETE | 8 | 3 |
| TASK-007 | @mobile | parallel/TASK-007 | DEV_TESTING (turn 20/30) | 20 | 7 |
```

### `/parallel-dev --merge`
Merge completed parallel branches back to main, one at a time.

**Steps:**
1. List all completed parallel branches
2. Order by: smallest diff first (least risk of conflicts)
3. For each branch:
   a. Merge to main
   b. Run full test suite
   c. If tests fail → revert merge, flag for manual resolution
   d. If tests pass → continue to next branch
4. After all merges: run full integration test suite
5. Clean up worktrees

## Conflict Detection Rules

Two tasks **conflict** if ANY of these are true:
- Explicit `depends-on` relationship
- Both modify files in the same directory (e.g., both touch `app/features/auth/`)
- One modifies an API endpoint, the other consumes it
- Both modify shared config files (package.json, docker-compose, etc.)
- Both modify database schemas/migrations

Two tasks are **independent** if NONE of the above are true AND:
- They work on different modules (backend vs frontend vs mobile)
- OR they work on different features within the same module with no shared files

## Safety Rules
- NEVER run dependent tasks in parallel — sequential only
- ALWAYS use `isolation: worktree` for parallel agents
- ALWAYS merge one branch at a time with test verification
- If merge conflicts occur: STOP and ask user which version to keep
- Maximum parallel agents: 4 (to avoid resource exhaustion)
- Each parallel agent gets its own task record in `.claude/tasks/`

## Definition of Done
- Independent tasks identified, agents launched, no file conflicts, all branches merged cleanly.

## Next Steps
- `/review-pr` for each branch, `/workflow resume`.

## Rollback
- **Abandon parallel branches:** `git branch -D <branch-name>` for each parallel branch
- **Return to sequential:** `/workflow resume TASK-{id}` to continue one task at a time
- **Resolve conflicts:** `git merge --abort` then `/parallel-dev --analyze` to re-plan
