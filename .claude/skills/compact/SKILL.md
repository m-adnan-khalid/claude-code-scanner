---
name: compact
description: >
  Context compaction skill. Archives current context state to MEMORY.md and
  logs, then triggers context compaction with a focused summary for the
  current task. Use when context budget exceeds 60% working limit.
user-invocable: true
context: fork
effort: low
agents: []
---

**Lifecycle: T5 (utility) — See `_protocol.md`**

**RULE:** Every output MUST end with `NEXT ACTION:`.

# /compact [focus]

## Purpose
Safely compact context when approaching budget limits. Archives state
before compaction so nothing is lost.

## Usage
```
/compact "focus on STORY-003 backlog population"
/compact "continue with feature implementation"
/compact                (auto-detects current task focus)
```

## Steps

### 1. Pre-Compact Archive
- Snapshot MEMORY.md to logs/registry-snapshots/
- Snapshot TASK_REGISTRY.md to logs/registry-snapshots/
- Log current IN_PROGRESS task to MEMORY.md

### 2. Build Compact Summary
Generate a focused summary containing:
- Current task/story ID and status
- Key decisions made this session
- Files modified this session
- Next step to resume after compaction

### 3. Trigger Compaction
Request context compaction with the focus summary.

### 4. Post-Compact Recovery
After compaction, the session resumes by:
- Reading MEMORY.md for prior state
- Reading TASK_REGISTRY.md for current tasks
- Reading the active task/story file
- Continuing from the last completed step

## When to Use
- Context budget warning at 60% (ORANGE)
- Context budget warning at 75% (RED)
- Between major workflow phases
- Before starting a new large task

## Definition of Done
- [ ] State archived to logs/
- [ ] MEMORY.md updated with session state
- [ ] Context compacted with focused summary
- [ ] Session resumable from archived state
