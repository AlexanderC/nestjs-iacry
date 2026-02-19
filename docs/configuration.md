---
title: Configuration
---

# Configuration

## Module Options

The `IACryModule` is a global NestJS dynamic module. Register it once in your root module.

### `forRoot(options)`

For static configuration:

```typescript
import { IACryModule, Effect, SEQUELIZE_STORAGE } from 'nestjs-iacry';

IACryModule.forRoot({
  storage: SEQUELIZE_STORAGE,
  storageRepository: PolicyStorageModel,
  strict: false,
  policies: [
    { Effect: Effect.ALLOW, Action: '*', Principal: 'admin' },
  ],
});
```

### `forRootAsync(options)`

For configuration that depends on other providers (e.g. config service, database connection):

```typescript
import { IACryModule, TYPEORM_STORAGE, IOREDIS_CACHE } from 'nestjs-iacry';

IACryModule.forRootAsync({
  imports: [ConfigModule, TypeOrmModule],
  inject: [ConfigService, DataSource],
  useFactory: async (config: ConfigService, dataSource: DataSource) => ({
    storage: TYPEORM_STORAGE,
    storageRepository: dataSource.getRepository(PolicyStorageEntity),
    cache: IOREDIS_CACHE,
    cacheClient: new Redis(config.get('REDIS_URL')),
    cacheOptions: { expire: 600 },
    policies: config.get('STATIC_POLICIES'),
  }),
});
```

You can also use `useClass` or `useExisting`:

```typescript
IACryModule.forRootAsync({
  useClass: IACryConfigService, // must implement IACryModuleOptionsFactory
});
```

## Options Reference

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `storage` | `string \| PolicyStorage` | No | Storage backend: `'sequelize'`, `'typeorm'`, or a custom `PolicyStorage` instance |
| `storageRepository` | `any` | If `storage` is a string | The Sequelize model class or TypeORM Repository instance |
| `cache` | `string \| Cache` | No | Cache backend: `'ioredis'` or a custom `Cache` instance |
| `cacheClient` | `any` | If `cache: 'ioredis'` | The ioredis client instance |
| `cacheOptions` | `CachedStorageOptions` | No | `{ expire?: number, prefix?: string }`. Default: 1 hour TTL, `IACRY_PCACHE/` prefix |
| `strict` | `boolean` | No | Case-sensitive matching. Default: `false` |
| `policies` | `Array<string \| PolicyInterface>` | No | Hardcoded global policies (always included regardless of principal) |

## Storage Stack

The module builds a layered storage stack:

```
CachedStorage (optional)
  └── MultipleStorage
        ├── SequelizeStorage or TypeOrmStorage (optional, from `storage` option)
        └── GlobalStorage (optional, from `policies` option)
```

- **GlobalStorage** holds hardcoded policies that apply to all principals
- **SequelizeStorage / TypeOrmStorage** provides persistent per-principal policies
- **MultipleStorage** aggregates results from all sub-storages
- **CachedStorage** wraps the stack with read-through caching

Next: [Storage Adapters](storage-adapters.md)
