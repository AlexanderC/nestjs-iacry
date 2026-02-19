---
title: Decorators
---

# Decorators

nestjs-iacry provides decorators for both entity models and controller methods.

## @IACryEntity

Marks a class as an IAC entity, enabling automatic extraction of `entity:id` identifiers for use as principals and resources.

```typescript
import { IACryEntity } from 'nestjs-iacry';

// Uses class name lowercased ("user") and "id" field
@IACryEntity()
class User {
  id: string;
}

// Custom entity name
@IACryEntity({ name: 'admin' })
class AdminUser {
  id: number;
}

// Dynamic name from an instance field
@IACryEntity({ nameField: 'role' })
class User {
  id: string;
  role: string; // e.g. "admin" - enables "admin:123" identifiers
}

// Custom ID field
@IACryEntity({ idField: 'pk' })
class Book {
  pk: number;
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | Class name (lowercased) | Static entity name |
| `nameField` | `string` | - | Instance field to read entity name from |
| `idField` | `string` | `'id'` | Instance field to read entity ID from |

### Helper Functions

```typescript
import { isEntity, toDynamicIdentifier, toPlainDynamicIdentifier } from 'nestjs-iacry';

isEntity(user);                    // true if @IACryEntity decorated
toDynamicIdentifier(user);        // { entity: 'user', id: '1' }
toPlainDynamicIdentifier(user);   // 'user:1'
```

## @IACryAction

Sets the action metadata for the route. If called without arguments, derives the action from the controller and method names.

```typescript
import { IACryAction } from 'nestjs-iacry';

@Controller('books')
class BookController {
  @IACryAction()           // auto-derives "book:update" from BookController.update
  update() {}

  @IACryAction('book:delete')  // explicit action
  remove() {}
}
```

### Template Variables

Action strings can reference request properties:

```typescript
@IACryAction('{params.service}:{params.action}')
```

## @IACryResource

Sets the resource metadata. Supports template variables from the request.

```typescript
import { IACryResource } from 'nestjs-iacry';

@IACryResource('book:{params.id}')     // resolves {params.id} from req.params.id
@IACryResource('book:42')              // static resource
```

### Template Variables

Templates use `{path}` syntax and resolve against the request object:

- `{params.id}` - `req.params.id`
- `{query.type}` - `req.query.type`
- `{body.bookId}` - `req.body.bookId`
- `{user}` - `req.user` (if decorated with `@IACryEntity`, converts to `entity:id`)

## @IACryPrincipal

Sets the principal metadata. Defaults to extracting from `req.user`.

```typescript
import { IACryPrincipal } from 'nestjs-iacry';

@IACryPrincipal()                      // uses req.user (must be @IACryEntity decorated)
@IACryPrincipal('user:{params.userId}') // from request params
```

## @IACryFirewall

Shorthand that combines `@IACryAction`, `@IACryPrincipal`, and optionally `@IACryResource`:

```typescript
import { IACryFirewall } from 'nestjs-iacry';

// Equivalent to @IACryAction() + @IACryPrincipal()
@IACryFirewall()

// With all options
@IACryFirewall({
  action: 'book:update',
  resource: 'book:{params.id}',
  principal: 'user:{user.id}',
})
```

### FirewallOptions

```typescript
interface FirewallOptions {
  action?: Action;       // default: auto-derived from controller/method
  resource?: Resource;   // default: omitted (uses '*' in guard)
  principal?: Principal; // default: req.user
}
```

## IACryFirewallGuard

A NestJS `CanActivate` guard that reads the metadata set by the decorators above and calls `IACryService.isGranted()`.

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import { IACryFirewall, IACryFirewallGuard } from 'nestjs-iacry';

@Controller('books')
class BookController {
  @IACryFirewall({ resource: 'book:{params.id}' })
  @UseGuards(AuthGuard, IACryFirewallGuard)
  @Post(':id')
  async update() {}
}
```

The guard:
1. Extracts `action`, `resource`, and `principal` from metadata
2. Throws `DecoratorError` if `action` or `principal` is missing
3. Calls `IACryService.isGranted(action, principal, resource)`
4. Returns `true` (allow) or `false` (deny)

**Important:** Place `IACryFirewallGuard` after your authentication guard so that `req.user` is populated.

Next: [Service API](service-api.md)
