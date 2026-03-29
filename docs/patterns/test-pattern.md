# Test Pattern

## Intent
Consistent test structure across the team using AAA (Arrange-Act-Assert) pattern.

## Structure
1. **Describe block** — Module/function under test
2. **It/test block** — Single behavior: `should [behavior] when [condition]`
3. **Arrange** — Set up data, mocks, state
4. **Act** — Call the function/method under test
5. **Assert** — Verify expected outcome

## Example
```
describe('OrderService.createOrder', () => {
  it('should create order when valid data provided', async () => {
    // Arrange
    const dto = { productId: '123', quantity: 2 };
    mockRepo.save.mockResolvedValue({ id: 'order-1', ...dto });

    // Act
    const result = await orderService.createOrder(dto);

    // Assert
    expect(result.id).toBe('order-1');
    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('should throw ValidationError when quantity is zero', async () => {
    const dto = { productId: '123', quantity: 0 };
    await expect(orderService.createOrder(dto)).rejects.toThrow(ValidationError);
  });
});
```

## Required Test Cases
- Happy path (success)
- Validation errors (bad input)
- Auth/authz errors (unauthorized/forbidden)
- Not found (missing resource)
- Edge cases (empty, null, boundary values)

## Anti-patterns
- Testing implementation details instead of behavior
- Shared mutable state between tests
- No assertions (test runs but verifies nothing)
- Overly complex setup (extract to fixtures/factories)
