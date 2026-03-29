# Data Model Pattern

## Intent
Consistent database schema design and data access patterns.

## Structure
1. **Table naming** — snake_case, plural (e.g., `user_accounts`)
2. **Primary key** — UUID or auto-increment `id`
3. **Timestamps** — `created_at`, `updated_at` on every table
4. **Soft delete** — `deleted_at` nullable timestamp (preferred over hard delete)
5. **Foreign keys** — Named `{referenced_table_singular}_id` (e.g., `user_id`)
6. **Indexes** — On foreign keys, frequently queried columns, unique constraints

## Example
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
```

## Anti-patterns
- Storing monetary values as floats (use integer cents)
- Missing indexes on foreign keys
- No timestamps on tables
- Hard deleting records (use soft delete)
- Storing JSON blobs for structured relational data
