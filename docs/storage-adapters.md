---
title: Storage Adapters
---

# Storage Adapters

nestjs-iacry supports multiple storage backends for persisting policies. You can use Sequelize, TypeORM, or implement a custom adapter.

## Sequelize

### Setup

1. Install dependencies:

```bash
npm install --save sequelize sequelize-typescript
```

2. Create a model extending the base storage model:

```typescript
// models/policies-storage.model.ts
import { PoliciesStorageSequelizeModel } from 'nestjs-iacry';

export default class PoliciesStorage extends PoliciesStorageSequelizeModel<PoliciesStorage> {}
```

3. Register the model with your Sequelize connection and configure the module:

```typescript
import { IACryModule, SEQUELIZE_STORAGE } from 'nestjs-iacry';
import PoliciesStorage from './models/policies-storage.model';

IACryModule.forRoot({
  storage: SEQUELIZE_STORAGE,
  storageRepository: PoliciesStorage,
});
```

### Schema

The Sequelize model creates a table with:

| Column | Type | Description |
|--------|------|-------------|
| `pk` | INTEGER | Auto-increment primary key |
| `sid` | VARCHAR | Nullable, indexed. Maps to `PolicyInterface.Sid` |
| `entity` | VARCHAR | Nullable, indexed. Principal entity type (lowercased) |
| `id` | VARCHAR | Nullable, indexed. Principal ID |
| `policy` | BLOB | JSON-encoded policy (up to 64 KB) |
| `createdAt` | DATETIME | Auto-managed |
| `updatedAt` | DATETIME | Auto-managed |

## TypeORM

### Setup

1. Install dependencies:

```bash
npm install --save typeorm
```

2. Create an entity extending the base storage entity:

```typescript
// entities/policies-storage.entity.ts
import { Entity } from 'typeorm';
import { PoliciesStorageTypeOrmEntity } from 'nestjs-iacry';

@Entity('my_policies_storage') // customize table name
export class PoliciesStorage extends PoliciesStorageTypeOrmEntity {}
```

Or use the base entity directly (table name defaults to `policies_storage`):

```typescript
import { PoliciesStorageTypeOrmEntity } from 'nestjs-iacry';
// Register PoliciesStorageTypeOrmEntity in your TypeORM connection entities
```

3. Configure the module with a TypeORM Repository:

```typescript
import { IACryModule, TYPEORM_STORAGE } from 'nestjs-iacry';
import { DataSource } from 'typeorm';
import { PoliciesStorage } from './entities/policies-storage.entity';

IACryModule.forRootAsync({
  inject: [DataSource],
  useFactory: (dataSource: DataSource) => ({
    storage: TYPEORM_STORAGE,
    storageRepository: dataSource.getRepository(PoliciesStorage),
  }),
});
```

### Schema

The TypeORM entity creates a table with:

| Column | Type | Description |
|--------|------|-------------|
| `pk` | INTEGER | Auto-generated primary key |
| `sid` | VARCHAR | Nullable, indexed. Maps to `PolicyInterface.Sid` |
| `entity` | VARCHAR | Nullable, indexed. Principal entity type (lowercased) |
| `id` | VARCHAR | Nullable, indexed. Principal ID |
| `policy` | TEXT | JSON-encoded policy |
| `createdAt` | DATETIME | Auto-managed |
| `updatedAt` | DATETIME | Auto-managed |

## Custom Storage Adapter

Implement the `PolicyStorage` interface to create your own storage backend:

```typescript
import { PolicyStorage, PolicyInterface, PrincipalObject } from 'nestjs-iacry';

export class MyCustomStorage implements PolicyStorage {
  readonly readonly: boolean = false;

  async fetch(principal: PrincipalObject): Promise<Array<string | PolicyInterface>> {
    // Load all policies for the given principal
  }

  async save(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number> {
    // Replace all policies for the principal
  }

  async add(principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number> {
    // Append policies to the principal
  }

  async purge(principal: PrincipalObject): Promise<number> {
    // Delete all policies for the principal
  }

  async fetchBySid(sid: string, principal: PrincipalObject): Promise<Array<string | PolicyInterface>> {
    // Load policies filtered by Sid
  }

  async saveBySid(sid: string, principal: PrincipalObject, rawPolicies: Array<string | PolicyInterface>): Promise<number> {
    // Replace policies matching the Sid
  }
}
```

Then pass it directly:

```typescript
IACryModule.forRoot({
  storage: new MyCustomStorage(),
});
```

## GlobalStorage (In-Memory)

When you provide the `policies` option, a read-only `GlobalStorage` is automatically created. These policies are returned for every principal lookup, regardless of which principal is queried. This is useful for baseline policies like "admins can do everything."

```typescript
IACryModule.forRoot({
  policies: [
    { Effect: Effect.ALLOW, Action: '*', Principal: 'admin:*' },
  ],
});
```

Next: [Decorators](decorators.md)
