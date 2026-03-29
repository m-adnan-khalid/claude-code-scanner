# Error Handling Pattern

## Intent
Consistent error creation, propagation, and response across all layers.

## Structure
1. **Custom error classes** — Extend base Error with code + status
2. **Throw at source** — Service/repository throws typed errors
3. **Catch at boundary** — Middleware/handler catches and formats response
4. **Log with context** — Include requestId, userId, operation

## Example
```
// errors.ts
class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} ${id} not found`, 'NOT_FOUND', 404);
  }
}

// Service throws
async getUser(id) {
  const user = await this.userRepo.findById(id);
  if (!user) throw new NotFoundError('User', id);
  return user;
}

// Middleware catches
app.use((err, req, res, next) => {
  logger.error({ err, requestId: req.id });
  res.status(err.statusCode || 500).json({
    error: { code: err.code || 'INTERNAL', message: err.message }
  });
});
```

## Anti-patterns
- Generic `throw new Error('something went wrong')` without type
- Catching errors and returning null/undefined silently
- Different error shapes from different endpoints
- Logging error in every catch block (log once at boundary)
