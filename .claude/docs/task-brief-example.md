# Task Brief — EXAMPLE (Read-Only Reference)

> Copy `.claude/templates/task-brief.md` for real work. This is a filled example.

---

## Status

```
Status:     DONE
Created:    2026-03-29 09:15
Completed:  2026-03-29 10:42
Agent:      Claude Code / session-abc123
```

---

## 1. Instruction

```
Source:    User
Received:  2026-03-29 09:15

Instruction:
"Add email validation to the signup form. It should show an inline error
 message if the email is invalid when the user clicks Submit."
```

---

## 2. Understanding

**Goal:**
Signup form should validate email format client-side on submit and show an inline
error beneath the email field if validation fails.

**Expected deliverable:**
Modified `SignupForm.tsx` with validation logic and inline error state.

**Assumptions:**
- [x] Validation is client-side only (no server round-trip)
- [x] Error message: "Please enter a valid email address"
- [x] Using existing form field component — no new UI needed

**Ambiguities identified:**
- [x] None — scope is clear

**Decision:** Proceed

---

## 3. Assigned To

```
Primary:     Claude Code (self)
Sub-tasks:   None — single-file change
```

---

## 4. Execution Plan

- [x] Step 1: Read `src/components/SignupForm.tsx` — understand structure
- [x] Step 2: Add `isValidEmail()` regex function
- [x] Step 3: Wire validation to submit handler — set error state on failure
- [x] Step 4: Render inline error below email input
- [x] Step 5: Run `pnpm test` — confirm no regressions
- [x] Step 6: Verify behavior matches requirement

**Dependencies:** Step 3 requires Step 1 complete.
**Verification:** `pnpm test` passes. Error shows with bad email, clears with valid.

---

## 5. Tools to Be Used

| Tool | Purpose |
|------|---------|
| Read | Inspect SignupForm.tsx before editing |
| Edit | Apply validation changes |
| Bash | Run `pnpm test` |

---

## 6. Tech Stack & Patterns

```
Language:        TypeScript
Framework:       Next.js 15, App Router
Libraries:       React 19, Tailwind CSS
Arch pattern:    Client component with local useState
File convention: PascalCase components
```

---

## 7. Boundaries & Constraints

**In scope:**
- Email field validation in `SignupForm.tsx`
- Inline error message display

**Out of scope:**
- Server-side validation
- Other form fields (name, password)
- Any other component

**Hard limits:**
- Do not modify anything outside `src/components/SignupForm.tsx`
- Max files to read: 2 (component + its test)

**Agent must NOT:**
- [x] Refactor unrelated form logic
- [x] Add password validation (not asked)
- [x] Modify design system components

---

## 8. Audit Log

```
2026-03-29 09:15 SESSION_START  —          Task Brief created                      → ok
2026-03-29 09:16 READ_FILE      Read       src/components/SignupForm.tsx            → 87 lines, uses useState, no validation
2026-03-29 09:18 READ_FILE      Read       tests/SignupForm.test.tsx               → 3 tests, all passing
2026-03-29 09:20 EDIT_FILE      Edit       SignupForm.tsx — added isValidEmail()   → ok
2026-03-29 09:22 EDIT_FILE      Edit       SignupForm.tsx — wired to handleSubmit  → ok
2026-03-29 09:25 EDIT_FILE      Edit       SignupForm.tsx — added error <p>        → ok
2026-03-29 09:28 BASH_CMD       Bash       pnpm test                              → 3 passed, 0 failed
2026-03-29 09:30 VERIFY         —          Described expected browser behavior     → matches requirement
2026-03-29 09:31 SESSION_CLOSE  —          Completion Report appended             → ok
```

---

---

# Completion Report

## Final Status

```
Status:    DONE
Completed: 2026-03-29 09:31
```

## What Was Achieved

- [x] Step 1: Read SignupForm.tsx — understood structure
- [x] Step 2: Added `isValidEmail()` with RFC-compliant regex
- [x] Step 3: Validation fires on submit, sets `emailError` state
- [x] Step 4: Inline error renders below email field in red
- [x] Step 5: All 3 existing tests pass
- [x] Step 6: Behavior confirmed — matches requirement

## What Was Not Done

| Item | Reason |
|------|--------|
| Server-side validation | Explicitly out of scope |

## Artifacts Produced

| File / Output | Path |
|---------------|------|
| Modified signup form | `src/components/SignupForm.tsx` |

## Deviations from Plan

| Original Plan | What Actually Happened | Reason |
|---------------|----------------------|--------|
| None | No deviations | — |

## Flags for Future Tasks

- Test suite doesn't cover validation edge cases — recommend adding tests

## Verification Confirmed

- [x] Output matches expected deliverable from Section 2
- [x] All in-scope steps completed
- [x] Audit log complete with no gaps
- [x] No out-of-scope changes made
- [x] Artifacts listed with correct paths
