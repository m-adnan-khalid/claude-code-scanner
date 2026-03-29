# Agent Error & Timeout Protocol

## What Happens When an Agent Fails

### 1. Agent Hits maxTurns
When an agent reaches its `maxTurns` limit without completing:

**Detection:** Claude Code automatically stops the agent and returns control to the parent.

**Recovery Protocol:**
1. @team-lead reads the agent's partial output
2. Assess: is the task too complex for one agent, or was the agent inefficient?
3. Options:
   - **Split**: Break the task into smaller sub-tasks for multiple agent invocations
   - **Continue**: Re-invoke the same agent with narrowed scope and partial results as context
   - **Escalate**: Flag to user — task may need human decomposition
4. Log the timeout in the task record:
   ```
   | {timestamp} | AGENT_TIMEOUT | @{agent} hit maxTurns ({N}) — {action taken} |
   ```

### 2. Agent Produces Errors
When an agent's tool calls fail (Edit fails, Bash returns non-zero, etc.):

**Detection:** `PostToolUseFailure` hook logs the failure to `reports/tool-failures.log`.

**Recovery Protocol:**
1. If the agent has remaining turns, it should self-recover (retry with different approach)
2. If the agent cannot recover after 3 tool failures in sequence:
   - Output a partial HANDOFF with `status: blocked`
   - Include the error details in `context`
   - @team-lead decides: retry, reassign, or escalate
3. Log in task record:
   ```
   | {timestamp} | TOOL_FAILURE | @{agent} — {tool}: {error summary} |
   ```

### 3. Session Failure (Rate Limit, Auth, Server Error)
When the entire session stops due to external failure:

**Detection:** `StopFailure` hook captures the error type and preserves state.

**Recovery Protocol:**
- **rate_limit**: Wait 60 seconds, resume with `claude --continue`
- **authentication_failed**: Re-authenticate, then resume
- **billing_error**: Check billing, resolve, then resume
- **server_error**: Transient — retry with `claude --continue`
- **max_output_tokens**: Output truncated — resume to continue
- **invalid_request**: May need to `/compact` first to reduce context

**All failures preserve:**
- Task record (loop state, phase, handoff log)
- Changes log (file modifications)
- Execution snapshot (agent counts, metrics)

### 4. Agent Produces Hallucinations
When an agent references non-existent files, functions, or APIs:

**Detection:** Execution report hallucination check (auto or manual).

**Recovery Protocol:**
1. If hallucination_flags in HANDOFF != CLEAN:
   - @team-lead blocks phase advancement
   - Re-invoke agent with explicit instruction: "Verify all references before outputting"
   - If persists after 2 attempts: escalate to user
2. If hallucination score >= 2 in execution report:
   - ALL generated artifacts must be manually reviewed
   - Do not merge PR until score drops to 0-1

### 5. Parallel Agent Conflicts
When @api-builder and @frontend (both with `isolation: worktree`) modify overlapping files:

**See:** `.claude/docs/conflict-resolution-protocol.md`

## Error Logging Locations
| Log | Location | Written By |
|-----|----------|-----------|
| Tool failures | `.claude/reports/tool-failures.log` | `tool-failure-tracker.js` hook |
| Session failures | `.claude/reports/session-failures.log` | `stop-failure-handler.js` hook |
| Task changes | `.claude/tasks/TASK-{id}_changes.log` | `track-file-changes.js` hook |
| Execution snapshots | `.claude/reports/executions/` | `execution-report.js` hook |
| Agent timeouts | `.claude/reports/executions/TASK-{id}_agent_timeout_*.json` | `subagent-tracker.js` hook |
| Hook failures | `.claude/reports/hook-failures.log` | All hooks (self-logging) |
| Gatekeeper blocks | `.claude/reports/gatekeeper/gatekeeper.log` | `gatekeeper-check.js` hook |
| Test regressions | `.claude/reports/test-runs/latest.json` | `test-results-parser.js` hook |

## Circuit Breaker Integration
All error recovery feeds into the circuit breaker:
- 3 consecutive tool failures for same agent -> count as 1 loop iteration
- Agent timeout -> count as 1 loop iteration
- Session failure -> pause loop counter (external issue, not agent issue)
- When loop hits max -> STOP and escalate to user
