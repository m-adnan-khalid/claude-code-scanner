---
name: cms-manage
description: >
  CMS and content platform management — add content types, manage plugins/extensions,
  theme customization, content migration, and CMS-specific audits. Supports WordPress,
  Strapi, Contentful, Sanity, Ghost, Payload, Directus, KeystoneJS, and Drupal.
user-invocable: true
context: fork
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent
argument-hint: "[add-content-type NAME | add-plugin NAME | migrate FROM TO | audit | theme]"
effort: high
---

# /cms-manage $ARGUMENTS

## Commands
- `/cms-manage add-content-type "BlogPost"` — Define new content type with fields, validation, API
- `/cms-manage add-plugin "seo-optimizer"` — Scaffold CMS plugin/extension with hooks and admin UI
- `/cms-manage migrate wordpress strapi` — Plan content migration between CMS platforms
- `/cms-manage audit` — CMS health: security patches, plugin conflicts, performance, SEO
- `/cms-manage theme` — Customize theme: layouts, templates, styles, responsive design

## Process

### Detect CMS Platform
1. WordPress: `wp-config.php`, `wp-content/`, `functions.php`
2. Strapi: `config/database.js`, `api/` directory, `strapi` in package.json
3. Contentful: `contentful` SDK in dependencies, space/environment config
4. Sanity: `sanity.config.ts`, `schemas/` directory
5. Ghost: `ghost` in package.json, content API patterns
6. Payload: `payload.config.ts`, collections directory
7. Directus: `directus` in dependencies, extensions directory
8. Drupal: `composer.json` with drupal/core, modules/ directory

### Add Content Type
**Headless CMS (Strapi/Payload/Directus/Sanity/Contentful):**
1. Define schema: fields, types, validation rules, relationships
2. Generate content type config file (JSON/TS/YAML per platform)
3. Add API endpoint (auto-generated in most headless CMS)
4. Create seed data for development/testing
5. Update GraphQL/REST schema documentation

**WordPress:**
1. Register custom post type in `functions.php` or plugin
2. Add custom fields (ACF or custom meta boxes)
3. Create archive and single templates
4. Add to REST API and/or GraphQL (WPGraphQL)
5. Register taxonomies if needed

### Add Plugin/Extension
**WordPress:**
1. Scaffold plugin: main file, activation/deactivation hooks, admin page
2. Register hooks: actions, filters, shortcodes
3. Add settings page in admin
4. Follow WordPress coding standards

**Strapi/Payload:**
1. Scaffold extension/plugin module
2. Register lifecycle hooks (beforeCreate, afterUpdate, etc.)
3. Add admin panel customization if needed
4. Register routes and controllers

### Content Migration
1. Export content from source CMS (API dump or DB export)
2. Map content types: source fields → target fields
3. Transform: media URLs, rich text format, relationships
4. Import into target CMS (API or direct DB)
5. Verify: content count, media integrity, relationship preservation
6. Generate migration report: success/failure counts, manual fixes needed

### CMS Audit
1. **Security:** outdated core/plugins, known vulnerabilities, file permissions
2. **Performance:** page load time, database queries per page, caching status
3. **SEO:** meta tags, sitemap, structured data (delegates to `/seo-audit` for deep check)
4. **Content:** orphan content, broken media links, unused content types
5. **Plugins:** conflicts, deprecated plugins, update availability

## Definition of Done
- Content type created with fields, validation, and API access
- Plugin/extension follows platform conventions and passes lint
- Migration verified: all content transferred, relationships intact
- Audit findings addressed (critical fixed, medium documented)
