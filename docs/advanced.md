---
title: Advanced
---

# Advanced

## Multiple Storage

Internally, `MultipleStorage` aggregates results from all configured storage backends. When you provide both `storage` and `policies` options, policies from both the database and the in-memory global store are combined.

Reads fan out across all storages and merge results. Writes only target non-readonly storages (GlobalStorage is readonly).

## Strict Mode

By default, pattern matching is case-insensitive. Enable strict mode for case-sensitive matching:

```typescript
IACryModule.forRoot({
  strict: true,
  policies: [
    { Effect: Effect.ALLOW, Action: 'Book:Update', Principal: 'User:1' },
  ],
});
```

With `strict: true`, `'book:update'` and `'Book:Update'` are treated as different identifiers.

## Firewall Rules

The `isGranted` method accepts a `rule` parameter that changes how Allow/Deny policies interact:

```typescript
import { IS_ALLOWED, IS_ALLOWED_ANY, IS_ALLOWED_IMPLICIT } from 'nestjs-iacry';

// Default: require Allow AND no Deny
await service.isGranted('book:update', user, book, IS_ALLOWED);

// Permissive: any Allow is enough, ignores Deny
await service.isGranted('book:update', user, book, IS_ALLOWED_ANY);

// Implicit: passes unless explicitly Denied
await service.isGranted('book:update', user, book, IS_ALLOWED_IMPLICIT);
```

## Using Entity Objects

Any object decorated with `@IACryEntity()` can be passed directly as a principal or resource:

```typescript
@IACryEntity()
class User { id: string; }

@IACryEntity()
class Book { id: string; }

const user = new User();
user.id = '1';

const book = new Book();
book.id = '42';

// These are equivalent:
await service.isGranted('book:update', user, book);
await service.isGranted('book:update', 'user:1', 'book:42');
await service.isGranted('book:update', { entity: 'user', id: '1' }, { entity: 'book', id: '42' });
```

## Custom PolicyStorage Interface

The `PolicyStorage` interface requires these methods:

```typescript
interface PolicyStorage {
  readonly readonly: boolean;

  fetch(principal: PrincipalObject): Promise<Array<string | PolicyInterface>>;
  save(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number>;
  add(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number>;
  purge(principal: PrincipalObject): Promise<number>;
  fetchBySid(sid: string, principal: PrincipalObject): Promise<Array<string | PolicyInterface>>;
  saveBySid(sid: string, principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number>;
}
```

Set `readonly: true` if your storage should only be used for reads (like GlobalStorage). This prevents `MultipleStorage` from routing writes to it.

## Exported Types and Constants

```typescript
// Module
IACryModule, IACryModuleOptions, IACryModuleAsyncOptions, IACryModuleOptionsFactory

// Service
IACryService

// Constants
SEQUELIZE_STORAGE, TYPEORM_STORAGE, IOREDIS_CACHE
IS_ALLOWED, IS_ALLOWED_ANY, IS_ALLOWED_IMPLICIT
REQUEST_USER

// Decorators
IACryEntity, IACryAction, IACryResource, IACryPrincipal, IACryFirewall, IACryFirewallGuard

// Interfaces
PolicyInterface, PolicyStorage, Effect, Cache, MatcherResult
Action, ActionObject, Resource, ResourceObject, Principal, PrincipalObject
DynamicIdentifier, DynamicIdentifierItem, DynamicIdentifierVector

// Models
PoliciesStorageSequelizeModel, PoliciesStorageTypeOrmEntity

// Internals
Policy, PolicyVector, Matcher, Firewall

// Errors
IACryError, IACryDecoratorError, MissingPolicyProps, WrongPolicyPropFormat
```
