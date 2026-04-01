---
name: slack-summary
description: Generates concise Slack-ready summaries of workspace status, story progress, and blockers. Max 280 chars for status, 500 chars for detailed update.
invocation: manual
---

## Slack Summary Generator

TASK-FIRST: Create subtask for Slack summary generation under the parent story in TASK_REGISTRY.

### Output Formats

#### Status Update (max 280 chars)
```
[emoji] [one-liner status] | Blockers: [count or "none"] | Next: [action]
```

#### Detailed Update (max 500 chars)
```
[emoji] *[Project/Feature Name]*
Status: [current state]
Progress: [X/Y tasks done] ([percentage]%)
Blockers: [list or "none"]
Next action: [what happens next]
Owner: @[assignee]
```

### Status Emojis

| Status | Emoji |
|--------|-------|
| On track | :white_check_mark: |
| At risk | :warning: |
| Blocked | :red_circle: |
| Complete | :tada: |
| In review | :eyes: |
| In progress | :construction: |

### Process

1. **Gather** — Read TASK_REGISTRY, MEMORY.md, and recent AUDIT_LOG entries.
2. **Summarize** — Extract current status, progress metrics, blockers, and next actions.
3. **Format** — Apply Slack markdown formatting (*bold*, `code`, bullet lists).
4. **Trim** — Enforce character limits (280 for status, 500 for detailed).
5. **Output** — Display formatted summary ready for Slack paste.

### Usage

```
/slack-summary              # Status update (280 chars)
/slack-summary --detailed   # Detailed update (500 chars)
/slack-summary --blockers   # Blockers-only summary
```

### Logging

- Log each summary generation to AUDIT_LOG: timestamp, summary type, character count.
