# API Standards

> Generated during pre-development planning

## API Style
- **Type:** {REST | GraphQL | gRPC | tRPC | mixed}
- **Base URL:** {/api/v1}
- **Versioning:** {URL path /v1 | Header Accept-Version | Query param}

## REST Conventions

### URL Structure
```
GET    /api/v1/{resources}            # List (paginated)
POST   /api/v1/{resources}            # Create
GET    /api/v1/{resources}/:id        # Get by ID
PUT    /api/v1/{resources}/:id        # Full update
PATCH  /api/v1/{resources}/:id        # Partial update
DELETE /api/v1/{resources}/:id        # Delete

# Nested resources
GET    /api/v1/{parent}/:id/{children}
```

### Naming Rules
- Plural nouns for collections: `/users`, `/orders`, `/products`
- Kebab-case for multi-word: `/order-items`, `/payment-methods`
- No verbs in URLs (use HTTP methods instead)
- No trailing slashes

## Request/Response Format

### Standard Response
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "ISO-8601",
    "request_id": "uuid"
  }
}
```

### Paginated Response
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "next_cursor": "abc123"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ],
    "request_id": "uuid"
  }
}
```

## HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (include Location header) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, version conflict |
| 422 | Unprocessable | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded (include Retry-After) |
| 500 | Internal Server Error | Unexpected server error (never expose internals) |

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request body/params failed validation |
| `AUTHENTICATION_REQUIRED` | No token or expired token |
| `INSUFFICIENT_PERMISSIONS` | Valid token but wrong role/scope |
| `RESOURCE_NOT_FOUND` | Entity with given ID not found |
| `RESOURCE_CONFLICT` | Duplicate or version conflict |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server-side failure |

## Authentication

- **Strategy:** {JWT | Session | API Key | OAuth2}
- **Token location:** {Authorization: Bearer | Cookie | X-API-Key header}
- **Token lifetime:** {access: 15min, refresh: 7d}
- **Refresh flow:** {endpoint and mechanism}

## Rate Limiting

| Tier | Limit | Window | Applies To |
|------|-------|--------|------------|
| Default | {100 req} | {per minute} | All authenticated endpoints |
| Auth | {10 req} | {per minute} | Login, register, password reset |
| Public | {30 req} | {per minute} | Unauthenticated endpoints |
| Webhook | {1000 req} | {per minute} | Incoming webhook endpoints |

**Headers returned:**
- `X-RateLimit-Limit`: max requests
- `X-RateLimit-Remaining`: remaining requests
- `X-RateLimit-Reset`: Unix timestamp of reset
- `Retry-After`: seconds until retry (on 429)

## Pagination

- **Default strategy:** {cursor-based | offset-based}
- **Default page size:** {20}
- **Max page size:** {100}
- **Parameters:** `?page=1&per_page=20` or `?cursor=abc&limit=20`

## Filtering, Sorting, Search

```
GET /api/v1/products?status=active&category=electronics    # Filter
GET /api/v1/products?sort=-created_at,name                 # Sort (- for desc)
GET /api/v1/products?q=wireless+headphones                 # Search
GET /api/v1/products?fields=id,name,price                  # Sparse fields
```

## Idempotency

- All POST/PUT requests SHOULD accept `Idempotency-Key` header
- Server stores result for {24 hours} and replays on duplicate key
- Critical for payment and order creation endpoints

## CORS

```
Access-Control-Allow-Origin: {allowed origins}
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID, Idempotency-Key
Access-Control-Max-Age: 86400
```

## API Documentation

- **Format:** {OpenAPI 3.0 / GraphQL SDL}
- **Location:** {/docs | /api/docs | /graphql}
- **Auto-generated:** {yes/no, from code annotations or schema}
