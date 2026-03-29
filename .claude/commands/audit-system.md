---
description: Run a full 7-phase system audit checking files, memory, hooks, sync, subagents, retry/undo, and context risk
---

Run a FULL SYSTEM AUDIT on this workspace. Check all 7 phases:
1. File existence & health (CLAUDE.md, MEMORY.md, TODO.md, AUDIT_LOG.md, RETRY_LOG.md, docs/, hooks, commands)
2. Memory integrity (Last Completed, Next Step, Blockers, line count, stale refs, sync with TODO)
3. Hook registration & firing (PreToolUse, PostToolUse, Stop, PreCompact, AUDIT_LOG cross-check)
4. Cross-layer sync (CODE↔DOCS, TODO↔MEMORY, MEMORY↔GIT, HOOKS↔AUDIT_LOG)
5. Subagent handoff integrity (Input/Output contracts, no direct MEMORY writes)
6. Retry/undo/redo audit (RETRY_LOG, checkpoint commits, undo paths)
7. Context window risk (line counts, combined load)

Output the structured audit report with issue counts per phase and prioritized fix list.
