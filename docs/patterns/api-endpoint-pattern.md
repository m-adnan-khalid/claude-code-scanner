# API Endpoint Pattern

## Intent
Standardize all API endpoint implementations to ensure consistency across the team.

## Structure
1. **Route definition** — HTTP method + path + middleware chain
2. **Input validation** — Schema validation before handler
3. **Handler** — Thin controller, delegates to service
4. **Service** — Business logic, returns result or throws
5. **Repository** — Data access, single responsibility
6. **Response** — Consistent shape: `{ data }` or `{ error: { code, message } }`

## Example
```
// Route
router.post('/api/v1/users', validate(createUserSchema), createUser);

// Handler
async function createUser(req, res) {
  const result = await userService.create(req.body);
  res.status(201).json({ data: result });
}

// Service
async create(data) {
  // business logic
  return userRepository.insert(data);
}
```

## Anti-patterns
- Logic in route handlers (should be in service)
- Direct DB access from handlers (should use repository)
- Inconsistent error shapes across endpoints
- Missing input validation
- Hardcoded auth checks instead of middleware
