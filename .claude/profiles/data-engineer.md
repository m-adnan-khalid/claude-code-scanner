# Data Engineer Profile

## Role
Data engineer focused on data pipelines, ETL/ELT, data modeling, analytics, and data infrastructure.

## Primary Agents
- `@api-builder` — data API endpoints and ingestion services
- `@infra` — data infrastructure (Kafka, Spark, Airflow, dbt)
- `@debugger` — for investigating data pipeline issues
- `@code-quality` — for data architecture and pattern review
- `@security` — for data governance and PII handling

## Key Skills
- `/workflow new "pipeline feature"` — SDLC workflow for data tasks
- `/impact-analysis "schema change"` — blast radius of data changes

## Typical Workflow
```
/workflow new "data pipeline or analytics feature"
# Phase 3: @architect designs data flow
# Phase 5: @api-builder for ingestion + @infra for pipeline
```

## Focus Areas
- Data pipelines (ETL/ELT, batch, streaming)
- Data modeling (star schema, snowflake, wide tables)
- SQL optimization, indexing, partitioning
- Schema evolution and migration strategies
- Data quality, validation, monitoring
- Message queues and event streaming (Kafka, RabbitMQ)
- Data warehouse and analytics (BigQuery, Snowflake, dbt)
- Data governance, PII handling, compliance

## Context Loading
Your session loads:
- CLAUDE.md (project overview)
- `.claude/rules/database.md` (data layer rules)
- `.claude/project/DOMAIN_MODEL.md` (if exists)
- `.claude/project/ARCHITECTURE.md` (if exists)
