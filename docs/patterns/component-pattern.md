# UI Component Pattern

## Intent
Standardize frontend component structure for reuse, testability, and consistency.

## Structure
1. **Props interface** — Typed inputs
2. **Component** — Presentation + minimal logic
3. **Hooks** — Complex state/effects extracted to custom hooks
4. **Styles** — Colocated or design-token-based
5. **Tests** — Render + interaction + accessibility

## Example
```
// UserCard.tsx
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card>
      <Avatar src={user.avatar} alt={user.name} />
      <Text>{user.name}</Text>
      <Button onClick={() => onEdit(user.id)}>Edit</Button>
    </Card>
  );
}
```

## Anti-patterns
- Business logic in components (extract to hooks/services)
- Prop drilling more than 2 levels (use context or state management)
- Inline styles in components (use design tokens)
- Components over 150 lines (split into subcomponents)
