---
title: Policies
---

# Policies

## PolicyInterface

Every policy follows this structure:

```typescript
interface PolicyInterface {
  Sid?: string;       // Optional statement identifier (for management)
  Effect: Effect;     // 'Allow' or 'Deny'
  Action: DI;         // What action: e.g. "book:update"
  Resource?: DI;      // On what target: e.g. "book:33"
  Principal?: DI;     // By whom: e.g. "user:1"
}
```

Where `DI` (Dynamic Identifier) can be:
- A string: `'book:update'`
- An object: `{ service: 'book', action: 'update' }` (for Action) or `{ entity: 'book', id: 33 }` (for Resource/Principal)
- An array of the above: `['book:update', 'book:patch']`

## Effect

```typescript
import { Effect } from 'nestjs-iacry';

Effect.ALLOW  // 'Allow'
Effect.DENY   // 'Deny'
```

When both Allow and Deny match (with the default `IS_ALLOWED` rule), **Deny wins**.

## Dynamic Identifiers (DIs)

DIs are the `Action`, `Resource`, and `Principal` fields. They use a `service:action` or `entity:id` format.

### String Format

| Type | Format | Example | Parsed As |
|------|--------|---------|-----------|
| Action | `service:action` | `'book:update'` | `{ service: 'book', action: 'update' }` |
| Resource | `entity:id` | `'book:33'` | `{ entity: 'book', id: '33' }` |
| Principal | `entity:id` | `'user:1'` | `{ entity: 'user', id: '1' }` |

Missing parts default to `*`:

- `'book'` as Action becomes `{ service: 'book', action: '*' }`
- `':33'` as Resource becomes `{ entity: '*', id: '33' }`

## Pattern Matching

DIs support [micromatch](https://github.com/micromatch/micromatch) glob patterns:

### Wildcards

```typescript
{ Action: '*' }              // matches any action
{ Action: 'book:*' }         // matches any action on the book service
{ Principal: 'user:*' }      // matches any user
{ Resource: '*:33' }         // matches any entity with ID 33
```

**Note:** A single `*` is automatically expanded to `**` internally, so `*` matches across path separators.

### Negation

```typescript
{ Action: 'book:!delete' }           // any book action except delete
{ Principal: 'user:!7' }             // any user except ID 7
{ Resource: 'book:!(33|42)' }        // any book except 33 and 42
```

### Pipes (OR)

```typescript
{ Action: 'book:update|patch' }              // update OR patch
{ Action: 'book:!(update|delete)' }          // anything except update and delete
```

### Complex Patterns

```typescript
{ Principal: '*/admin:!33' }    // admin from any namespace except ID 33
{ Action: 'book:@(read|list)' } // exactly read or list (micromatch extglob)
```

See the [micromatch docs](https://github.com/micromatch/micromatch#matching-features) for the full pattern syntax.

## Array DIs

Action, Resource, and Principal can be arrays. Any match in the array counts:

```typescript
{
  Effect: Effect.DENY,
  Action: ['book:update', 'book:patch'],  // deny both update and patch
  Principal: ['user:1', 'user:2'],         // for user 1 and user 2
}
```

## Policy Evaluation

When checking `isGranted(action, principal, resource)`:

1. All policies for the principal are fetched from storage
2. Each policy is matched against the action, resource, and principal
3. Policies are classified as **allow**, **deny**, or **abstain** (no match)
4. The firewall rule determines the result:

| Rule | Allow | Deny | Result |
|------|-------|------|--------|
| `IS_ALLOWED` | 1+ matches | 0 matches | `true` |
| `IS_ALLOWED` | 1+ matches | 1+ matches | `false` |
| `IS_ALLOWED` | 0 matches | any | `false` |
| `IS_ALLOWED_ANY` | 1+ matches | any | `true` |
| `IS_ALLOWED_IMPLICIT` | any | 0 matches | `true` |

Next: [Caching](caching.md)
