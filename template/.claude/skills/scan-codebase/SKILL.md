---
name: scan-codebase
description: Deep-scan any codebase to fingerprint tech stack, architecture, conventions, and domain knowledge. Use when setting up Claude Code for an existing project.
user-invocable: true
context: fork
allowed-tools: Read, Grep, Glob, Bash, Agent
effort: high
argument-hint: "[path-to-project]"
---

# Scan Codebase: $ARGUMENTS

**Reference files in this skill directory:**
- `tech-markers.md` — complete list of 100+ technology marker files to check
- `deep-scan-instructions.md` — detailed instructions for backend, frontend, architecture, and domain scans

Run 6 scanning agents using the Agent tool. Launch all 6 in a single message for maximum parallelism (Claude Code supports multiple Agent tool calls in one response). Each agent runs in its own subagent context and returns a structured report. If any agent fails (maxTurns or error), continue with the remaining agents — partial scan results are still valuable.

## Agent 1: Technology Fingerprinter
Rapid scan of marker files to identify everything present.

Check for ALL of these (read actual file contents, not just names):

**Languages:** package.json, requirements.txt, go.mod, Cargo.toml, pom.xml, *.csproj, Gemfile, composer.json, pubspec.yaml, mix.exs, build.sbt, CMakeLists.txt

**Frameworks:** Read dependency files for React/Next/Remix, Vue/Nuxt, Angular, Svelte/SvelteKit, Django, Flask, FastAPI, Spring, Rails, Laravel, Express, NestJS, ASP.NET, Gin/Echo/Fiber

**Databases:** prisma/schema.prisma, ormconfig, alembic/, migrations/, mongoose, redis, elasticsearch in dependencies

**API:** openapi.yaml, *.graphql, *.proto, @trpc in package.json

**Testing:** jest.config, vitest.config, cypress.config, playwright.config, pytest.ini, *_test.go, spec/

**Infra:** Dockerfile, docker-compose, *.tf, k8s/, serverless.yml, .github/workflows/, .gitlab-ci.yml

**Monorepo:** nx.json, turbo.json, lerna.json, pnpm-workspace.yaml

For every marker found, READ the file to extract exact versions, scripts, and config.

Output `TECH_MANIFEST` JSON with: project_name, project_type, languages[], frontend{}, backend{}, database{}, infrastructure{}, ci_cd{}, testing{}, monorepo{}, package_manager.

## Agent 2: Directory Structure Scanner
Map full tree up to 4 levels. Classify each directory: source, tests, config, docs, scripts, build output, generated (DO NOT MODIFY), vendor (skip).
Identify: where handlers live, where services live, where models live, where types live, where tests live.

## Agent 3: Backend Deep Scanner
Read actual source files. Identify: runtime version, framework patterns (middleware, DI, routing), API layer (every route, validation, response format, auth), database layer (ORM, migrations, queries, transactions), background jobs, external integrations, logging, error handling.

## Agent 4: Frontend Deep Scanner
Read 3-5 actual components. Identify: framework + meta-framework, rendering mode (CSR/SSR/SSG), routing pattern, state management, component architecture (props, hooks, styling), build/bundle config, TypeScript config, API communication layer.

## Agent 5: Architecture Mapper
Trace a request end-to-end. Map: module boundaries, dependency graph, communication patterns, deployment topology, security architecture (auth flow, authz model), shared code.

## Agent 6: Domain & Convention Extractor
Read 20+ files to establish patterns. Extract: naming conventions (variables, files, directories, endpoints, DB tables), code style beyond linter config, error handling patterns, git conventions (from git log), TODO/FIXME/HACK comments, existing AI config (.cursorrules, CLAUDE.md).

## Output
Combine all 6 reports into a single structured document saved to `.claude/scan-results.md`.
