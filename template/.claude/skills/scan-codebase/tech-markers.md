# Technology Marker Reference

## Package Managers & Languages
- **JavaScript/TypeScript:** package.json, yarn.lock, pnpm-lock.yaml, package-lock.json, bun.lockb, .npmrc, .nvmrc, .node-version
- **Python:** requirements.txt, Pipfile, pyproject.toml, setup.py, setup.cfg, poetry.lock, conda.yml, tox.ini
- **Go:** go.mod, go.sum
- **Rust:** Cargo.toml, Cargo.lock
- **Java/Kotlin:** pom.xml, build.gradle, build.gradle.kts, settings.gradle, gradlew, .mvn/
- **C#/.NET:** *.csproj, *.sln, Directory.Build.props, nuget.config, global.json
- **Ruby:** Gemfile, Gemfile.lock, .ruby-version
- **PHP:** composer.json, composer.lock, artisan
- **Dart/Flutter:** pubspec.yaml
- **Swift:** Package.swift, *.xcodeproj, Podfile
- **Elixir:** mix.exs
- **Scala:** build.sbt
- **C/C++:** CMakeLists.txt, Makefile, configure.ac, meson.build, vcpkg.json

## Frameworks (read config to confirm version)
- **React:** package.json → "react", "next", "gatsby", "remix"
- **Vue:** package.json → "vue", "nuxt"
- **Angular:** angular.json, package.json → "@angular/core"
- **Svelte:** svelte.config.js, package.json → "svelte", "@sveltejs/kit"
- **Django:** manage.py, settings.py, wsgi.py, asgi.py
- **Flask:** app.py/wsgi.py → "from flask"
- **FastAPI:** Python files → "from fastapi"
- **Spring Boot:** pom.xml/build.gradle → "spring-boot"
- **Rails:** config/routes.rb, Rakefile, bin/rails
- **Laravel:** artisan, config/app.php, routes/web.php
- **Express:** package.json → "express"
- **NestJS:** package.json → "@nestjs/core", nest-cli.json
- **ASP.NET:** *.csproj → "Microsoft.AspNetCore"
- **Gin/Echo/Fiber:** go.mod → "gin-gonic", "labstack/echo", "gofiber"

## Databases & ORMs
- **Prisma:** prisma/schema.prisma
- **TypeORM:** ormconfig.ts/json, "typeorm" in package.json
- **SQLAlchemy:** "from sqlalchemy" in Python files
- **Sequelize:** "sequelize" in package.json, .sequelizerc
- **Drizzle:** drizzle.config.ts, "drizzle-orm" in package.json
- **Mongoose:** "mongoose" in package.json
- **Migrations:** migrations/, db/migrate/, alembic/, prisma/migrations/

## APIs
- **OpenAPI:** openapi.yaml, swagger.json
- **GraphQL:** *.graphql, "graphql"/"apollo" in dependencies
- **gRPC:** *.proto, buf.yaml
- **tRPC:** "@trpc" in package.json

## Testing
- **Jest:** jest.config.*, "jest" in package.json
- **Vitest:** vitest.config.*, "vitest" in package.json
- **Cypress:** cypress.config.*, cypress/
- **Playwright:** playwright.config.*, "@playwright/test" in package.json
- **Pytest:** pytest.ini, conftest.py, [tool.pytest] in pyproject.toml
- **Go test:** *_test.go files
- **RSpec:** spec/, .rspec

## Infrastructure
- **Docker:** Dockerfile, docker-compose.yml, .dockerignore
- **Kubernetes:** k8s/, kustomization.yaml, Chart.yaml
- **Terraform:** *.tf, .terraform/
- **Serverless:** serverless.yml, sam-template.yaml
- **CI/CD:** .github/workflows/, .gitlab-ci.yml, Jenkinsfile, .circleci/config.yml

## Monorepo
- **Nx:** nx.json
- **Turborepo:** turbo.json
- **Lerna:** lerna.json
- **pnpm:** pnpm-workspace.yaml
- **Yarn:** "workspaces" in package.json
- **Bazel:** WORKSPACE, BUILD

## TECH_MANIFEST Output Schema
```json
{
  "project_name": "", "project_type": "monorepo|fullstack|backend|frontend|library|cli|mobile",
  "languages": [{"name": "", "version": "", "detected_from": ""}],
  "frontend": {"exists": false, "framework": "", "version": "", "ui_library": "", "state_management": "", "routing": "", "styling": "", "bundler": "", "ssr": false, "root_dir": "", "entry_point": "", "dev_command": "", "build_command": "", "test_command": ""},
  "backend": {"exists": false, "framework": "", "version": "", "language": "", "runtime_version": "", "api_style": "REST|GraphQL|gRPC|tRPC|mixed", "root_dir": "", "entry_point": "", "dev_command": "", "build_command": "", "test_command": ""},
  "database": {"type": "", "orm": "", "migration_tool": "", "migration_dir": "", "schema_file": ""},
  "infrastructure": {"containerized": false, "orchestration": "", "iac": "", "cloud": ""},
  "ci_cd": {"platform": "", "config_file": ""},
  "testing": {"unit": "", "integration": "", "e2e": "", "coverage_tool": ""},
  "monorepo": {"tool": "", "packages": []},
  "package_manager": ""
}
```
