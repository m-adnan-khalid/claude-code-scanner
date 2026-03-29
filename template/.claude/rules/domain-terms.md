---
paths:
  - ".claude/project/**"
---

# Domain Terminology Rule

Use exact terms from `/docs/GLOSSARY.md` in all code, docs, and conversations.

## Directives
- Read `/docs/GLOSSARY.md` before naming any entity, variable, class, or file.
- Use the canonical term exactly as defined — never substitute synonyms.
- Do NOT use "command" for Skill, "subagent" for Agent, "middleware" for Hook, "policy" for Rule.
- Do NOT invent new domain terms without adding them to GLOSSARY.md first.
- When reviewing code, flag any term that does not match a GLOSSARY.md entry.
- Variable names, class names, and file names MUST derive from glossary terms.
- If a concept has no glossary entry, propose one before proceeding.

## Anti-patterns
- Using "job" instead of "Task"
- Using "plugin" instead of "Skill"
- Using "guard" instead of "Hook"
- Using "permission" instead of "Role"
