---
name: add-template
description: >
  Scaffold email, notification, or document templates with variables, layouts, and previews.
  Supports React Email, MJML, Handlebars, Jinja2, Blade, EJS, and raw HTML.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"template-name" --type email|notification|pdf|sms [--variables "name,order_id"]'
effort: high
roles: [FrontendDev, FullStackDev, BackendDev, TechLead]
agents: [@frontend, @scaffolder, @tester]
---

# /add-template $ARGUMENTS

## Commands
- `/add-template "welcome-email" --type email --variables "name,action_url"` — Email template
- `/add-template "order-confirmed" --type notification --variables "order_id,total"` — Push/in-app notification
- `/add-template "invoice" --type pdf --variables "items,total,due_date"` — PDF document template
- `/add-template "verification-code" --type sms --variables "code"` — SMS template

## Process
1. **Detect template engine:** React Email, MJML, Handlebars, Jinja2, Blade, EJS, Pug, raw HTML
2. **Scaffold template:**
   - Template file with layout (header, body, footer)
   - Variable placeholders: `{{name}}`, `{name}`, `${name}` (engine-specific)
   - Responsive design for email (inline CSS, table layout)
   - Dark mode support (prefers-color-scheme)
3. **Generate preview data:** Sample values for each variable (for testing)
4. **Add to template registry:** Index file listing all templates with their variables
5. **Generate tests:**
   - Test: renders with all variables → valid HTML/text
   - Test: renders with missing optional variable → graceful fallback
   - Test: required variable missing → clear error

## Definition of Done
- Template renders correctly with sample data
- All variables documented with types and required/optional
- Preview available locally (email preview, PDF render)
- Registered in template index
