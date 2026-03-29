---
name: service-contract
description: >
  Microservices contract management — define service boundaries, API contracts between services,
  consumer-driven contract tests, service dependency mapping, and cross-service change impact.
  Works with Pact, Spring Cloud Contract, gRPC proto, OpenAPI, AsyncAPI, and message queues.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[define SERVICE | test | map | validate | breaking-change SERVICE]"
effort: high
roles: [BackendDev, FullStackDev, TechLead, Architect]
agents: [@api-builder, @architect, @tester]
---

# /service-contract $ARGUMENTS

## Commands
- `/service-contract define payments` — Define service boundary, owned entities, exposed API, consumed APIs
- `/service-contract test` — Run consumer-driven contract tests across all services
- `/service-contract map` — Generate service dependency graph (who calls whom, sync/async)
- `/service-contract validate` — Check all contracts are satisfied, no orphan consumers
- `/service-contract breaking-change payments` — Analyze impact of changing a service's API on all consumers

## Process

### Define Service Boundary
1. Identify service's bounded context (from DOMAIN_MODEL.md if exists)
2. List owned entities — what data does this service own?
3. Define exposed API: REST endpoints, gRPC protos, message events published
4. Define consumed APIs: what other services does it call? What events does it subscribe to?
5. Generate contract file:
   - REST: OpenAPI spec per service
   - gRPC: `.proto` files with service definitions
   - Events: AsyncAPI spec for published/consumed events
   - Pact: consumer contract JSON
6. Save to: `contracts/{service-name}/` directory

### Contract Testing
1. Detect contract framework: Pact, Spring Cloud Contract, gRPC health check, custom
2. For each consumer-provider pair:
   - Verify provider satisfies consumer's expected contract
   - Verify consumer handles provider's actual responses
3. For async contracts (message queues):
   - Verify publisher schema matches subscriber expectations
   - Check for schema evolution compatibility (Avro, Protobuf)
4. Output: pass/fail per contract pair, broken contracts highlighted

### Service Dependency Map
1. Scan all services for: HTTP client calls, gRPC stubs, queue publishers/subscribers
2. Build directed graph: Service A → Service B (sync), Service A ~> Service C (async)
3. Detect: circular dependencies, single points of failure, chatty services
4. Generate Mermaid diagram saved to `docs/service-map.md`

### Breaking Change Analysis
1. Diff the service's contract (old vs new)
2. Find all consumers of changed endpoints/events
3. For each consumer: will it break? (removed field, type change, new required param)
4. Output: impact report with affected services, migration steps per consumer

## Cross-Service Workflow Integration
When `/workflow new` affects multiple services:
1. Phase 2 (Impact): `/service-contract breaking-change {service}` auto-runs
2. Phase 5 (Dev): changes coordinated across service repos (order: provider first, consumer second)
3. Phase 8 (CI): contract tests run in addition to unit tests
4. Phase 11 (Deploy): provider deployed first, consumers after contract verified

## Definition of Done
- All service boundaries clearly defined with owned entities
- Contract tests pass for all consumer-provider pairs
- No breaking changes deployed without consumer migration
- Service dependency map current and no circular dependencies
