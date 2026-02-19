---
title: Service API
---

# Service API

`IACryService` is the main injectable service for authorization checks and policy management.

## Authorization

### `isGranted(action, principal, resource?, rule?)`

Check if an action is allowed for a principal on a resource.

```typescript
import { IACryService, IS_ALLOWED, IS_ALLOWED_ANY, IS_ALLOWED_IMPLICIT } from 'nestjs-iacry';

const allowed = await service.isGranted('book:update', user, book);
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `action` | `Action \| ActionObject` | - | e.g. `'book:update'` or `{ service: 'book', action: 'update' }` |
| `principal` | `Principal \| PrincipalObject \| Entity` | - | The actor. Can be a string, object, or `@IACryEntity` instance |
| `resource` | `Resource \| ResourceObject \| Entity` | `'*'` | The target. Optional, defaults to wildcard |
| `rule` | `string` | `IS_ALLOWED` | The firewall rule to apply |

**Firewall Rules:**

| Rule | Behavior |
|------|----------|
| `IS_ALLOWED` (default) | At least one `Allow` match AND zero `Deny` matches |
| `IS_ALLOWED_ANY` | At least one `Allow` match (ignores `Deny`) |
| `IS_ALLOWED_IMPLICIT` | Zero `Deny` matches (does not require explicit `Allow`) |

## Policy Management

### `attach(principal, policies)`

Append policies to a principal without removing existing ones.

```typescript
await service.attach(user, [
  { Effect: Effect.ALLOW, Action: 'book:*' },
  { Effect: Effect.DENY, Action: 'book:delete', Principal: 'user:*' },
]);
```

Returns the number of policies attached.

### `reset(principal, policies?)`

Replace all policies for a principal. If no policies are provided, purges all policies.

```typescript
// Replace all policies
await service.reset(user, [{ Effect: Effect.ALLOW, Action: 'book:read' }]);

// Delete all policies
await service.reset(user);
```

### `retrieve(principal)`

Fetch all policies for a principal.

```typescript
const policies = await service.retrieve(user);
// Returns: Array<PolicyInterface>
```

### `grant(action, principal, resource?, effect?, sid?)`

Shorthand to create and attach a single policy.

```typescript
// Allow user to update the book
await service.grant('book:update', user, book);

// Deny with a named Sid
await service.grant('book:delete', user, book, Effect.DENY, 'deny-delete');
```

**Parameters:**

| Parameter | Type | Default |
|-----------|------|---------|
| `action` | `Action \| ActionObject` | - |
| `principal` | `Principal \| Entity` | - |
| `resource` | `Resource \| Entity` | `'*'` |
| `effect` | `Effect` | `Effect.ALLOW` |
| `sid` | `string` | - |

### `upsertBySid(sid, principal, policies)`

Replace policies matching a specific Sid for a principal. Useful for system-managed policy lifecycles.

```typescript
await service.upsertBySid('system:user:books', user, [
  {
    Sid: 'system:user:books',
    Effect: Effect.ALLOW,
    Action: 'book:update|patch|delete',
    Resource: [book.toDynamicIdentifier()],
  },
]);
```

### `retrieveBySid(sid, principal)`

Fetch policies matching a specific Sid.

```typescript
const policies = await service.retrieveBySid('system:user:books', user);
```

## Sid-Based Policy Management Pattern

Sids (Statement IDs) enable system-managed policy lifecycles. For example, automatically granting permissions on resources a user creates:

```typescript
const BOOK_SID = 'system:user:book';
let policies = await service.retrieveBySid(BOOK_SID, user);

if (policies.length > 0) {
  // Add the new book to existing resource list
  policies[0].Resource.push(newBook.toDynamicIdentifier());
} else {
  // Create initial policy
  policies = [{
    Sid: BOOK_SID,
    Effect: Effect.ALLOW,
    Action: 'book:update|patch|delete',
    Resource: [newBook.toDynamicIdentifier()],
  }];
}

await service.upsertBySid(BOOK_SID, user, policies);
```

Next: [Policies](policies.md)
