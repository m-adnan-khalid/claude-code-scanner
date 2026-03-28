---
name: add-component
description: Scaffold a new UI component with template, styles, tests, and optionally a Storybook story.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: '"component name" [--type page|layout|widget|form]'
---

# Add Component: $ARGUMENTS

## Process
1. Read existing components for patterns (naming, structure, styling approach)
2. Invoke @frontend to scaffold: component → styles → test → story
3. Follow project conventions (React/Vue/Svelte/Flutter patterns)
4. Add prop types/interfaces
5. Run lint + tests
