---
name: context-check
description: Check current context usage and enforce the 60% working budget. Use between workflow phases, after heavy operations, or when context feels slow. Recommends compaction if over budget.
user-invocable: true
context: fork
allowed-tools: Read, Bash, Grep, Glob
argument-hint: "[--compact] [--force]"
roles: [CTO, TechLead, Architect, BackendDev, FrontendDev, FullStackDev, QA, DevOps, PM, Designer]
agents: [@team-lead]
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.


# Context Check: $ARGUMENTS

## Step 1: Measure Current Context

**Important:** If running inside a `context: fork` skill (like `/workflow`), `/context` measures the FORK's context, not the parent session. This is still useful — the fork has its own context budget that must be managed.

Run the built-in context command to get actual usage:
```
/context
```

Read the output and extract:
- **Current context %**: the primary metric (of fork or parent, depending on where you are)
- **Largest consumers**: what's taking the most space
- **Conversation history size**: how much is accumulated messages

## Step 2: Evaluate Against Budget

| Threshold | Status | Action Required |
|-----------|--------|----------------|
| Under 20% | STARTUP | Normal — plenty of room |
| 20-40% | GREEN | Good — working comfortably |
| 40-60% | YELLOW | Caution — approaching budget limit |
| 60-75% | ORANGE | OVER BUDGET — compact immediately |
| 75-90% | RED | CRITICAL — compact with focus, clear if possible |
| 90%+ | EMERGENCY | Auto-compaction imminent — state may be lost |

## Step 3: Context Reduction Actions

### If YELLOW (40-60%):
1. Check: are there large file reads in history that are no longer needed?
2. Check: have any non-fork skills been invoked inline?
3. Recommend: `/compact "focus on [current phase] for [task-id]"`

### If ORANGE (60-75%) — MANDATORY ACTION:
1. **Compact NOW**: `/compact "Preserve: task [id] phase [N], loop state, pending decisions. Discard: file contents, exploration results, completed phase details."`
2. After compaction, verify: re-read active task file to restore state
3. Log context pressure event in task record

### If RED (75-90%) — EMERGENCY:
1. **Save state**: Read active task file, note current phase and loop state
2. **Compact aggressively**: `/compact "ONLY preserve: task [id], current phase [N], loop counters, acceptance criteria status. Discard everything else."`
3. **Consider session split**: If a long workflow, start a new session for remaining phases: `claude --continue`
4. **Route remaining work through fork**: Use `context: fork` skills or subagents for all remaining operations

### If EMERGENCY (90%+):
1. Auto-compaction will fire — PreCompact hook preserves critical state
2. After compaction, PostCompact hook re-injects loop state, handoffs, blockers
3. Re-read the active task file immediately to restore full context
4. Consider: `/clear` and start fresh if task can resume from saved state

## Step 4: Context Optimization Recommendations

Check and report on each:

### Conversation History
- **Accumulated file reads**: Large files read but no longer relevant — compact will reclaim this
- **Agent return values**: Each agent invocation in main context adds its full output — use fork agents when possible
- **Tool outputs**: Bash command outputs accumulate — long outputs are especially expensive

### Loaded Resources
- **MCP servers**: Each server loads tool definitions on every request (~200-2k tokens each)
- **Rules without paths**: Rules missing `paths:` frontmatter load unconditionally
- **Unfork'd skills**: Skills without `context: fork` load their full body into parent context

### Optimization Actions
1. **Largest consumer**: Identify what's using the most context and recommend action
2. **Unnecessary loads**: Flag any always-loaded content that could be on-demand
3. **Session hygiene**: Recommend `/clear` if switching to an unrelated task

## Step 5: Log Context Pressure

If context > 60%, append to active task record:
```markdown
## Context Pressure Log
| Timestamp | Context % | Action Taken | Result |
|-----------|-----------|-------------|--------|
| {timestamp} | {N}% | compacted with focus on Phase {N} | reduced to {M}% |
```

## Output Format
```
CONTEXT CHECK RESULT
====================
Current Usage:  {N}%
Status:         {GREEN/YELLOW/ORANGE/RED/EMERGENCY}
Budget (60%):   {WITHIN/OVER by N%}

Top Consumers:
  1. Conversation history: ~{N}%
  2. CLAUDE.md + rules: ~{N}%
  3. Skill/agent metadata: ~{N}%
  4. MCP tools: ~{N}%

Action: {NONE / COMPACT RECOMMENDED / COMPACT REQUIRED / EMERGENCY}
Command: {specific /compact command if needed}
```

## Auto-Invocation
This skill should be called:
1. By `/workflow` between every phase transition
2. By `@team-lead` before assigning heavy work
3. Manually whenever responses feel slow or truncated
4. After any operation that reads many large files

## Definition of Done
- Context usage measured, budget status determined (GREEN/YELLOW/ORANGE/RED), action taken if over budget.

## Next Steps
- `/compact` if over budget, continue work if under.

## Rollback
- N/A (diagnostic only).

### Final Output
```
NEXT ACTION: Done. Review the output above and decide your next step.
```
