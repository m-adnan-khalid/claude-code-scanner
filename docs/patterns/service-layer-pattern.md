# Service Layer Pattern

## Intent
Encapsulate business logic in a service layer, separate from transport (HTTP/gRPC) and data access.

## Structure
1. **Input:** Validated DTO/params (never raw request objects)
2. **Logic:** Business rules, orchestration, validation
3. **Output:** Domain objects or throw typed errors
4. **Dependencies:** Injected repositories, external services

## Example
```
class OrderService {
  constructor(orderRepo, paymentService, notificationService) { ... }

  async createOrder(dto) {
    const order = Order.create(dto);        // Domain logic
    await this.orderRepo.save(order);       // Persist
    await this.paymentService.charge(order); // External
    await this.notificationService.notify(order); // Side effect
    return order;
  }
}
```

## Anti-patterns
- Accessing request/response objects in service
- Mixing persistence logic with business logic
- God services with 10+ methods (split by subdomain)
- Services calling other services' repositories directly
