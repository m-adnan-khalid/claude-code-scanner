# Task Brief — BRIEF-{slug}

> **Rule:** Complete this fully before any work begins. No placeholders.
> **Location:** `.claude/tasks/BRIEF-{YYYY-MM-DD}_{slug}.md`

---

## Status

```
Status:     PENDING
Created:    {YYYY-MM-DD HH:MM}
Completed:  —
Agent:      {agent name or Claude Code session}
```

---

## 1. Instruction

```
Source:     {User | System | Agent | Slash command}
Received:   {YYYY-MM-DD HH:MM}

Instruction:
{Paste verbatim or paraphrase as closely as possible}
```

---

## 2. Understanding

**Goal:**
{What is the desired end state? What does "done" look like?}

**Expected deliverable:**
{File? Endpoint? Report? Component? Describe the artifact.}

**Assumptions:**
- [ ] {Assumption 1}
- [ ] {Assumption 2}

**Ambiguities identified:**
- [ ] {Any unclear requirements — if none, write "None"}

**Decision:** Proceed | Wait for clarification
> If waiting — surface ambiguity to user before continuing.

---

## 3. Assigned To

```
Primary:     {Who is doing this work}
Sub-tasks:
  - {Subtask A} → {Agent or self}
  - {Subtask B} → {Agent or self}
```

---

## 4. Execution Plan

- [ ] Step 1: {Description}
- [ ] Step 2: {Description}
- [ ] Step 3: {Description}

**Dependencies:**
{e.g. Step 3 requires Step 2 output}

**Verification method:**
{How will you confirm the task is actually complete? Tests? Output check?}

---

## 5. Tools to Be Used

| Tool | Purpose |
|------|---------|
| {Read} | {Inspect existing code} |
| {Edit} | {Modify component} |
| {Bash} | {Run tests} |

---

## 6. Tech Stack & Patterns

```
Language:        {e.g. TypeScript}
Framework:       {e.g. Next.js 15}
Libraries:       {e.g. zod, prisma, tailwind}
Arch pattern:    {e.g. Server component + API route}
File convention: {e.g. kebab-case, co-located tests}
```

---

## 7. Boundaries & Constraints

**In scope:**
- {What this task covers}

**Out of scope:**
- {What this task does NOT cover}

**Hard limits:**
- Do not modify: {files or systems off-limits}
- Max files to read: {prevent context bloat}

**Agent must NOT:**
- [ ] Refactor code outside declared scope
- [ ] Add undeclared features or "nice to haves"
- [ ] Run destructive commands without logging first
- [ ] Guess through ambiguous requirements

---

## 8. Audit Log

> Every action logged in real time. Nothing happens off-record.
> Format: `[TIMESTAMP] [ACTION] [TOOL] [DETAIL] → [RESULT]`

```
{YYYY-MM-DD HH:MM} SESSION_START — Task Brief created
```

---

---

# Completion Report

> Fill ONLY after all work is done. Not before.

---

## Final Status

```
Status:      {DONE | PARTIAL | BLOCKED}
Completed:   {YYYY-MM-DD HH:MM}
```

## What Was Achieved

- [x] Step 1: {What was done and confirmed}
- [ ] Step N: {Not done — see below}

## What Was Not Done

| Item | Reason |
|------|--------|
| {Step or feature} | {Blocked by X / Out of scope / Deferred} |

## Artifacts Produced

| File / Output | Path |
|---------------|------|
| {Component} | `src/components/Example.tsx` |

## Deviations from Plan

| Original Plan | What Actually Happened | Reason |
|---------------|----------------------|--------|
| {None or describe} | | |

## Flags for Future Tasks

- {Anything the next agent or session should know}

## Verification Confirmed

- [ ] Output matches expected deliverable from Section 2
- [ ] All in-scope steps completed or deviation logged
- [ ] Audit log is complete with no gaps
- [ ] No out-of-scope changes were made
- [ ] Artifacts listed with correct paths
