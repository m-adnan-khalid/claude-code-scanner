---
name: impact-analysis
description: Analyze the blast radius of a proposed change. Use before making significant code changes.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent
---

# Impact Analysis: $ARGUMENTS

Run @explorer and @security in parallel.

**@explorer:** Files directly affected, modules with transitive dependencies, existing test coverage, related pending changes.

**@security:** Auth/authz code touched? User input handling? DB queries? PII? File uploads?

**Output:** Files affected (file:line refs), blast radius, test coverage %, security flags, risk level (LOW/MEDIUM/HIGH/CRITICAL), Mermaid diagram.
