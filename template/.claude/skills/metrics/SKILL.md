---
name: metrics
description: Calculate aggregate task metrics — velocity, quality, cycle-time, agent performance. Use when asking about team performance or bottlenecks.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash
argument-hint: "[velocity|quality|cycle-time|agents|blockers|all] [--period 7d|30d|90d]"
---

# Metrics: $ARGUMENTS

Read all `.claude/tasks/*.md` and calculate:

- **velocity** — tasks/week, throughput trend, WIP count
- **quality** — test pass rate, coverage trend, bug escape rate, deploy success rate, rollback frequency
- **cycle-time** — avg per phase, bottleneck detection, time in BLOCKED, review iteration count
- **agents** — tasks handled, avg duration, success rate, rework rate per agent
- **blockers** — total in period, avg resolution time, most common categories
- **all** — everything above combined
