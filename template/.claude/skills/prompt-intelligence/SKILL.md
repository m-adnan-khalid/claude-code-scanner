---
name: prompt-intelligence
description: Improves any user prompt before execution. Scores Clarity, Scope, Alignment, Context, Safety on 1-10 scale. Prompts scoring <8 get improved with diff shown. Requires user approval (A=use improved/B=use original/C=edit/D=cancel).
invocation: automatic
---

## Prompt Intelligence Pipeline

TASK-FIRST: Check TASK_REGISTRY for existing task. If none, create TASK for "prompt improvement — [timestamp]".

### Scoring Dimensions (1-10 each)

| Dimension | What It Measures |
|-----------|-----------------|
| Clarity | Is the intent unambiguous? Are terms precise? |
| Scope | Is the boundary well-defined? Not too broad or narrow? |
| Alignment | Does it match the user's CURRENT_ROLE and permitted paths? |
| Context | Does it reference relevant MEMORY, GLOSSARY, and STANDARDS? |
| Safety | Does it avoid destructive actions, secret exposure, scope violations? |

### Pipeline

1. **Score** — Rate each dimension 1-10. Total <40/50 triggers improvement.
2. **Improve** — Rewrite weak dimensions. Inject GLOSSARY terms, STANDARDS rules, MEMORY context.
3. **Show diff** — Display original vs improved with inline diff markers.
4. **Wait for approval:**
   - **A** = Use improved prompt
   - **B** = Use original prompt
   - **C** = Edit prompt manually
   - **D** = Cancel (log cancellation to AUDIT_LOG)

### Scoring Thresholds

- **40-50/50**: Strong prompt — pass through with no changes
- **30-39/50**: Moderate — suggest improvements, show diff
- **<30/50**: Weak — strongly recommend improvement, highlight risks

### Logging

- Log every prompt processed to AUDIT_LOG with: timestamp, original score, improved score (if applicable), user choice (A/B/C/D), final prompt used.
- Cancelled prompts (D) logged with reason if provided.

### Integration

- Runs automatically on every mutating tool call via pre-tool-use hook.
- Manual invocation via `/prompt` for deep improvement on any prompt.
- Destructive actions (delete, drop, force-push) are auto-flagged regardless of score.
- Role violations detected and blocked before scoring.
