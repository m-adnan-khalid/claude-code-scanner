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
- **Elixir:** mix.exs, mix.lock
- **Scala:** build.sbt, project/build.properties
- **C/C++:** CMakeLists.txt, Makefile, configure.ac, meson.build, vcpkg.json
- **Clojure:** deps.edn, project.clj, shadow-cljs.edn
- **Haskell:** stack.yaml, cabal.project, *.cabal
- **Zig:** build.zig, build.zig.zon
- **Deno:** deno.json, deno.jsonc, deno.lock, import_map.json
- **Bun:** bunfig.toml, bun.lockb

## Frontend Frameworks (read config to confirm version)
- **React:** package.json → "react", "next", "gatsby", "remix"
- **Vue:** package.json → "vue", "nuxt"
- **Angular:** angular.json, package.json → "@angular/core"
- **Svelte:** svelte.config.js, package.json → "svelte", "@sveltejs/kit"
- **Solid.js:** package.json → "solid-js", "solid-start"
- **Qwik:** package.json → "@builder.io/qwik"
- **Astro:** astro.config.mjs, package.json → "astro"
- **Preact:** package.json → "preact"
- **Htmx:** "htmx.org" in dependencies or <script src="htmx">
- **Alpine.js:** package.json → "alpinejs" or <script src="alpine">
- **Lit:** package.json → "lit"
- **Ember:** ember-cli-build.js, package.json → "ember-cli"

## Backend Frameworks
- **Express:** package.json → "express"
- **NestJS:** package.json → "@nestjs/core", nest-cli.json
- **Fastify:** package.json → "fastify"
- **Hono:** package.json → "hono"
- **Elysia:** package.json → "elysia"
- **H3/Nitro:** package.json → "h3", "nitropack"
- **Koa:** package.json → "koa"
- **Django:** manage.py, settings.py, wsgi.py, asgi.py
- **Flask:** app.py/wsgi.py → "from flask"
- **FastAPI:** Python files → "from fastapi"
- **Starlette:** Python files → "from starlette"
- **Sanic:** Python files → "from sanic"
- **Spring Boot:** pom.xml/build.gradle → "spring-boot"
- **Quarkus:** pom.xml → "quarkus", src/main/resources/application.properties
- **Micronaut:** build.gradle → "io.micronaut"
- **Rails:** config/routes.rb, Rakefile, bin/rails
- **Sinatra:** Ruby files → "require 'sinatra'"
- **Hanami:** config/app.rb, lib/{app}/
- **Laravel:** artisan, config/app.php, routes/web.php
- **Symfony:** symfony.lock, config/bundles.php
- **ASP.NET:** *.csproj → "Microsoft.AspNetCore"
- **Minimal API (.NET):** *.csproj → "Microsoft.AspNetCore", app.MapGet/MapPost patterns
- **Gin:** go.mod → "gin-gonic/gin"
- **Echo:** go.mod → "labstack/echo"
- **Fiber:** go.mod → "gofiber/fiber"
- **Chi:** go.mod → "go-chi/chi"
- **Gorilla Mux:** go.mod → "gorilla/mux"
- **Actix-web:** Cargo.toml → "actix-web"
- **Axum:** Cargo.toml → "axum"
- **Rocket:** Cargo.toml → "rocket"
- **Warp:** Cargo.toml → "warp"
- **Phoenix:** mix.exs → "phoenix", lib/{app}_web/
- **Phoenix LiveView:** mix.exs → "phoenix_live_view"
- **Play Framework:** build.sbt → "play"

## Databases & ORMs
- **Prisma:** prisma/schema.prisma
- **TypeORM:** ormconfig.ts/json, "typeorm" in package.json
- **SQLAlchemy:** "from sqlalchemy" in Python files
- **Sequelize:** "sequelize" in package.json, .sequelizerc
- **Drizzle:** drizzle.config.ts, "drizzle-orm" in package.json
- **Mongoose:** "mongoose" in package.json
- **Kysely:** "kysely" in package.json
- **Knex:** knexfile.js/ts, "knex" in package.json
- **Django ORM:** models.py with `class Meta:`, DATABASES in settings.py
- **ActiveRecord:** db/schema.rb, db/migrate/
- **Entity Framework:** *.csproj → "Microsoft.EntityFrameworkCore", DbContext files
- **GORM:** go.mod → "gorm.io/gorm"
- **Ent:** go.mod → "entgo.io/ent"
- **Diesel:** Cargo.toml → "diesel", diesel.toml
- **SQLx:** Cargo.toml → "sqlx"
- **Ecto:** mix.exs → "ecto", priv/repo/migrations/
- **Migrations:** migrations/, db/migrate/, alembic/, prisma/migrations/, drizzle/

### Database Engines
- **PostgreSQL:** postgresql in connection strings, pg in dependencies, .pgpass
- **MySQL/MariaDB:** mysql in connection strings, mysql2 in dependencies
- **SQLite:** *.sqlite, *.db files, "better-sqlite3" or "sqlite3" in dependencies
- **MongoDB:** "mongodb" or "mongoose" in dependencies, mongod.conf
- **Redis:** "redis" or "ioredis" in dependencies, redis.conf
- **DynamoDB:** "aws-sdk" with DynamoDB, serverless.yml with DynamoDB resources
- **Cassandra:** cassandra.yaml, "cassandra-driver" in dependencies
- **CouchDB/PouchDB:** "pouchdb" or "nano" in dependencies
- **ClickHouse:** "clickhouse" in dependencies, clickhouse-server config
- **TimescaleDB:** PostgreSQL with timescaledb extension
- **Neo4j:** "neo4j-driver" in dependencies, *.cypher files
- **Supabase:** "supabase" or "@supabase/supabase-js" in dependencies, supabase/ directory
- **Firebase/Firestore:** "firebase" or "firebase-admin" in dependencies, firebase.json, .firebaserc
- **PlanetScale:** "database-js" with PlanetScale, .pscale/ directory

## Message Queues & Streaming
- **Apache Kafka:** "kafkajs" or "kafka-node" in package.json, "kafka-python" in requirements, kafka/ configs
- **RabbitMQ:** "amqplib" or "amqp-connection-manager" in package.json, "pika" in Python, rabbitmq.conf
- **Redis Pub/Sub:** "redis" + pub/sub patterns in code, BullMQ, "bull" in package.json
- **AWS SQS/SNS:** "aws-sdk" with SQS/SNS, serverless.yml with SQS/SNS resources
- **Google Pub/Sub:** "@google-cloud/pubsub" in package.json
- **NATS:** "nats" in dependencies, nats-server.conf
- **Apache Pulsar:** "pulsar-client" in dependencies
- **ZeroMQ:** "zeromq" in dependencies

## Search Engines
- **Elasticsearch:** "elasticsearch" or "@elastic/elasticsearch" in dependencies, elasticsearch.yml
- **OpenSearch:** "@opensearch-project/opensearch" in dependencies
- **Meilisearch:** "meilisearch" in dependencies
- **Typesense:** "typesense" in dependencies
- **Algolia:** "algoliasearch" or "instantsearch" in dependencies
- **Solr:** solr/ config directory, "solr-client" in dependencies

## Caching
- **Redis:** "redis" or "ioredis" in dependencies (also used for queues/pub-sub)
- **Memcached:** "memcached" or "memjs" in dependencies
- **Varnish:** default.vcl, varnish config files
- **CDN:** cloudfront, fastly, cloudflare config in infrastructure files

## Authentication & Identity
- **Auth0:** "@auth0" in dependencies, auth0 config files
- **Clerk:** "@clerk" in dependencies
- **NextAuth/Auth.js:** "next-auth" or "@auth/core" in dependencies
- **Passport.js:** "passport" in package.json, passport strategy files
- **Firebase Auth:** "firebase/auth" imports
- **Supabase Auth:** supabase auth patterns in code
- **Keycloak:** keycloak.json, "keycloak-connect" in dependencies
- **OAuth2/OIDC:** "openid-client", "oauth2-server" in dependencies
- **JWT:** "jsonwebtoken" or "jose" in dependencies

## Payment Processing
- **Stripe:** "stripe" in dependencies, stripe webhook endpoints
- **PayPal:** "@paypal" in dependencies, paypal config
- **Square:** "@square/web-sdk" in dependencies
- **Razorpay:** "razorpay" in dependencies
- **LemonSqueezy:** "@lemonsqueezy" in dependencies

## Email & Notifications
- **SendGrid:** "@sendgrid/mail" in dependencies
- **Resend:** "resend" in dependencies
- **Postmark:** "postmark" in dependencies
- **Nodemailer:** "nodemailer" in dependencies
- **Twilio:** "twilio" in dependencies
- **OneSignal:** "onesignal-node" in dependencies

## File Storage & Media
- **AWS S3:** "aws-sdk" with S3, "@aws-sdk/client-s3" in dependencies
- **Google Cloud Storage:** "@google-cloud/storage" in dependencies
- **Cloudinary:** "cloudinary" in dependencies
- **Uploadthing:** "uploadthing" in dependencies
- **MinIO:** "minio" in dependencies

## Analytics & Monitoring
- **Sentry:** "@sentry" in dependencies, sentry.properties, .sentryclirc
- **DataDog:** "dd-trace" in dependencies, datadog.yaml
- **New Relic:** "newrelic" in dependencies, newrelic.js
- **PostHog:** "posthog" or "posthog-js" in dependencies
- **Mixpanel:** "mixpanel" or "mixpanel-browser" in dependencies
- **Amplitude:** "@amplitude/analytics" in dependencies
- **OpenTelemetry:** "@opentelemetry" in dependencies, "opentelemetry-sdk" in Python
- **Prometheus:** prometheus.yml, /metrics endpoint, "prom-client" in package.json
- **Grafana:** grafana provisioning configs, dashboards/*.json

## Data Engineering & ML
- **Apache Spark:** "pyspark" in Python, spark-submit scripts, SparkSession in code
- **Apache Airflow:** dags/ directory, airflow.cfg, DAG Python files
- **dbt:** dbt_project.yml, models/ with .sql files, profiles.yml
- **Apache Flink:** "flink" in dependencies, flink-conf.yaml
- **Dagster:** dagster.yaml, "dagster" in dependencies
- **Prefect:** "prefect" in dependencies, prefect.yaml
- **Luigi:** "luigi" in Python, luigi.cfg
- **Great Expectations:** great_expectations/ directory, "great-expectations" in dependencies
- **PyTorch:** "torch" in Python requirements/imports
- **TensorFlow:** "tensorflow" in Python requirements/imports
- **scikit-learn:** "sklearn" or "scikit-learn" in Python
- **Hugging Face:** "transformers" in Python requirements
- **LangChain:** "langchain" in Python or JS dependencies
- **LlamaIndex:** "llama-index" in Python dependencies
- **MLflow:** "mlflow" in dependencies, mlflow/ directory
- **Weights & Biases:** "wandb" in Python dependencies
- **Jupyter:** *.ipynb files, jupyter_notebook_config.py
- **Pandas:** "pandas" in Python requirements/imports
- **NumPy:** "numpy" in Python requirements/imports
- **Polars:** "polars" in Python or Rust dependencies

## CMS & Headless CMS
- **Strapi:** strapi-server.js, "strapi" in package.json
- **Contentful:** "@contentful" in dependencies, contentful config
- **Sanity:** sanity.config.ts, "sanity" in package.json
- **WordPress:** wp-config.php, wp-content/, functions.php
- **Ghost:** ghost/ directory, "ghost" in dependencies
- **Payload CMS:** payload.config.ts, "payload" in package.json
- **Directus:** directus.config.*, "@directus/sdk" in dependencies
- **KeystoneJS:** keystone.ts, "@keystone-6" in package.json

## Desktop Applications
- **Electron:** "electron" in package.json, electron-builder.yml, main.js with BrowserWindow
- **Tauri:** tauri.conf.json, Cargo.toml with "tauri", src-tauri/ directory
- **Qt (C++):** *.pro files, CMakeLists.txt with Qt6/Qt5, QApplication in code
- **PyQt/PySide:** "PyQt6" or "PySide6" in Python requirements
- **wxPython:** "wxPython" in Python requirements
- **JavaFX:** build.gradle with "javafx", *.fxml files
- **.NET MAUI:** *.csproj with "Microsoft.Maui", MauiProgram.cs
- **WPF:** *.xaml files, *.csproj with "WPF"
- **WinUI:** *.csproj with "WinUI", *.xaml files

## Game Engines
- **Unity:** Assets/, ProjectSettings/, *.unity, *.cs scripts
- **Unreal:** *.uproject, Source/, Content/, *.cpp with UCLASS
- **Godot:** project.godot, *.gd files, *.tscn scenes
- **Bevy (Rust):** Cargo.toml → "bevy"
- **Phaser:** "phaser" in package.json
- **Three.js:** "three" in package.json
- **PixiJS:** "pixi.js" in package.json

## APIs
- **OpenAPI:** openapi.yaml, swagger.json, openapi.json
- **GraphQL:** *.graphql, "graphql"/"apollo" in dependencies, schema.graphql
- **gRPC:** *.proto, buf.yaml, buf.gen.yaml
- **tRPC:** "@trpc" in package.json
- **REST:** Express/Fastify/NestJS routes, Django urls.py, Rails routes.rb
- **WebSocket:** "ws" or "socket.io" in dependencies, WebSocket handlers
- **Server-Sent Events:** EventSource patterns in code

## Testing
- **Jest:** jest.config.*, "jest" in package.json
- **Vitest:** vitest.config.*, "vitest" in package.json
- **Cypress:** cypress.config.*, cypress/
- **Playwright:** playwright.config.*, "@playwright/test" in package.json
- **Pytest:** pytest.ini, conftest.py, [tool.pytest] in pyproject.toml
- **Go test:** *_test.go files
- **RSpec:** spec/, .rspec
- **JUnit:** src/test/java/, @Test annotations, "junit" in dependencies
- **xUnit (.NET):** *.Tests.csproj, [Fact]/[Theory] attributes
- **Mocha:** .mocharc.*, "mocha" in package.json
- **Testing Library:** "@testing-library" in package.json
- **Storybook:** .storybook/, *.stories.tsx/jsx
- **k6 (load):** *.js with k6 imports, k6 config
- **Locust (load):** locustfile.py, "locust" in Python
- **Detox (mobile):** .detoxrc.js, "detox" in package.json
- **Appium (mobile):** appium config, wdio.conf.js with appium

## Infrastructure
- **Docker:** Dockerfile, docker-compose.yml, .dockerignore
- **Kubernetes:** k8s/, kustomization.yaml, Chart.yaml, *.yaml with apiVersion
- **Helm:** Chart.yaml, templates/, values.yaml
- **Terraform:** *.tf, .terraform/, terraform.tfvars
- **Pulumi:** Pulumi.yaml, Pulumi.*.yaml, __main__.py or index.ts with pulumi
- **CDK (AWS):** cdk.json, lib/*.ts with cdk constructs
- **Ansible:** ansible.cfg, playbooks/, roles/, inventory/
- **Serverless:** serverless.yml, sam-template.yaml
- **Vercel:** vercel.json, .vercel/
- **Netlify:** netlify.toml, _redirects
- **Fly.io:** fly.toml
- **Railway:** railway.json, Procfile
- **Render:** render.yaml
- **CI/CD:** .github/workflows/, .gitlab-ci.yml, Jenkinsfile, .circleci/config.yml, .travis.yml, azure-pipelines.yml, bitbucket-pipelines.yml

## Mobile
- **iOS Native:** *.xcodeproj, *.xcworkspace, Podfile, Package.swift, Info.plist, *.storyboard, *.xib, Assets.xcassets
- **Android Native:** AndroidManifest.xml, build.gradle(.kts) with "com.android.application", res/layout/, proguard-rules.pro
- **React Native:** "react-native" in package.json, metro.config.js, ios/, android/, app.json
- **Flutter:** pubspec.yaml with "flutter" SDK, lib/main.dart, ios/, android/, .metadata
- **Kotlin Multiplatform:** build.gradle.kts with "kotlin-multiplatform", shared/src/commonMain/, shared/src/iosMain/, shared/src/androidMain/
- **Expo:** app.json with "expo", "expo" in package.json, expo-cli
- **Capacitor:** capacitor.config.ts, "capacitor" in package.json
- **Ionic:** ionic.config.json, "ionic" in package.json
- **NativeScript:** nativescript.config.ts, "nativescript" in package.json
- **Fastlane:** fastlane/Fastfile, fastlane/Appfile
- **CocoaPods:** Podfile, Podfile.lock, *.podspec
- **SPM:** Package.swift (Swift Package Manager)
- **Gradle (Android):** build.gradle with android {}, gradle.properties, local.properties

## Monorepo
- **Nx:** nx.json
- **Turborepo:** turbo.json
- **Lerna:** lerna.json
- **pnpm:** pnpm-workspace.yaml
- **Yarn:** "workspaces" in package.json
- **Bazel:** WORKSPACE, BUILD
- **Rush:** rush.json
- **Moon:** .moon/workspace.yml

## TECH_MANIFEST Output Schema
```json
{
  "project_name": "", "project_type": "monorepo|fullstack|backend|frontend|library|cli|mobile|desktop|game|data",
  "languages": [{"name": "", "version": "", "detected_from": ""}],
  "frontend": {"exists": false, "framework": "", "version": "", "ui_library": "", "state_management": "", "routing": "", "styling": "", "bundler": "", "ssr": false, "root_dir": "", "entry_point": "", "dev_command": "", "build_command": "", "test_command": ""},
  "backend": {"exists": false, "framework": "", "version": "", "language": "", "runtime_version": "", "api_style": "REST|GraphQL|gRPC|tRPC|mixed", "root_dir": "", "entry_point": "", "dev_command": "", "build_command": "", "test_command": ""},
  "mobile": {"exists": false, "platform": "ios|android|react-native|flutter|kmp|expo|capacitor", "framework": "", "version": "", "architecture": "MVVM|MVI|BLoC|Clean|TCA", "state_management": "", "navigation": "", "min_sdk": "", "target_sdk": "", "root_dir": "", "ios_dir": "", "android_dir": "", "build_command": "", "test_command": ""},
  "desktop": {"exists": false, "framework": "electron|tauri|qt|maui|wpf", "version": ""},
  "database": {"type": "", "orm": "", "migration_tool": "", "migration_dir": "", "schema_file": ""},
  "messaging": {"type": "", "broker": "kafka|rabbitmq|redis|sqs|nats", "patterns": "pub-sub|queue|stream"},
  "search": {"engine": "elasticsearch|opensearch|meilisearch|typesense|algolia"},
  "auth": {"provider": "", "strategy": "jwt|session|oauth2|saml"},
  "infrastructure": {"containerized": false, "orchestration": "", "iac": "", "cloud": ""},
  "ci_cd": {"platform": "", "config_file": ""},
  "monitoring": {"apm": "", "logging": "", "metrics": "", "tracing": ""},
  "testing": {"unit": "", "integration": "", "e2e": "", "load": "", "coverage_tool": ""},
  "monorepo": {"tool": "", "packages": []},
  "package_manager": ""
}
```
