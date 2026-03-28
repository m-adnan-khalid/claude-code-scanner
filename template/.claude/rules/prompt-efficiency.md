---
paths:
  - "**/*"
---
# Prompt Efficiency — Mandatory

## Output Rules
- Start with the answer. No preamble ("Sure!", "Great question!", "Let me...").
- No summary/recap at end unless multi-step procedure.
- Code blocks: show only changed lines + 2 lines context. Never dump entire files.
- Lists: max 5 items unless user requests more. Prioritized order.
- Explanations: 1-3 sentences default. Expand only when asked.

## Tool Use Rules
- Read: specify line ranges when you know the target area. Never read entire large files exploratorily.
- Bash: pipe long outputs through `| head -N`. Never let unbounded output flood context.
- Grep: use `files_with_matches` first, then targeted content reads. Never dump all matches.
- Agent: pass focused 3-5 line instructions with specific file paths. Never "do everything" prompts.
- Prefer Grep/Glob over Bash(grep/find). Prefer targeted reads over full-file reads.

## Anti-Patterns (NEVER do these)
- Re-reading a file you already read this session without reason
- Running `cat` on files >100 lines without `offset`/`limit`
- Outputting code the user did not ask for
- Explaining what you will do AND then what you just did (pick one or neither)
- Loading reference docs preemptively — load only when the specific info is needed
- Passing full file contents to subagents when a file path + line range suffices
