---
name: migrate
description: Database migration management — create, run, rollback, check status. Invokes @database agent for safe schema changes.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[create|run|rollback|status] [migration-name]"
---

# Database Migration: $ARGUMENTS

## Commands
- `/migrate create "add users table"` — create new migration file
- `/migrate run` — run pending migrations
- `/migrate rollback` — rollback last migration
- `/migrate status` — show migration status (applied, pending, failed)

## Process
1. Invoke @database agent to analyze schema change needed
2. Create migration file following project conventions (Alembic/Prisma/Knex/etc.)
3. Verify migration has rollback step
4. Run migration in dev/test environment
5. Verify data integrity after migration
6. Update models/schema files to match

## Safety
- NEVER run against production without explicit approval
- Every migration MUST have a rollback step
- Check backward compatibility before applying
