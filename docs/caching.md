---
title: Caching
---

# Caching

nestjs-iacry supports optional caching to reduce database reads for frequently checked policies.

## ioredis

```bash
npm install --save ioredis
```

```typescript
import { IACryModule, SEQUELIZE_STORAGE, IOREDIS_CACHE } from 'nestjs-iacry';
import Redis from 'ioredis';

IACryModule.forRoot({
  storage: SEQUELIZE_STORAGE,
  storageRepository: PolicyStorageModel,
  cache: IOREDIS_CACHE,
  cacheClient: new Redis('redis://localhost:6379'),
  cacheOptions: {
    expire: 600,                  // 10 minutes (default: 3600 = 1 hour)
    prefix: 'MY_APP_POLICIES/',   // key prefix (default: 'IACRY_PCACHE/')
  },
});
```

## Cache Behavior

- **Read-through**: On `fetch` / `fetchBySid`, the cache is checked first. On miss, storage is queried and the result is cached.
- **Write-through**: On `save`, `add`, `purge`, and `saveBySid`, the cache is invalidated before the write is delegated to storage.
- **Key format**: `{prefix}{entity}/{id}` or `{prefix}{entity}/{id}/{sid}` for sid-scoped lookups.

## CachedStorageOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `expire` | `number` | `3600` | Cache TTL in seconds |
| `prefix` | `string` | `'IACRY_PCACHE/'` | Key prefix for all cache entries |

## Custom Cache Adapter

Implement the `Cache` interface:

```typescript
import { Cache } from 'nestjs-iacry';

export class MyCache implements Cache {
  async set(key: string, value: string, expire?: number): Promise<boolean> {
    // Store value, optionally with TTL in seconds
    return true;
  }

  async has(key: string): Promise<boolean> {
    // Check if key exists
  }

  async get(key: string): Promise<string> {
    // Retrieve value
  }

  async remove(key: string): Promise<boolean> {
    // Delete key
    return true;
  }
}
```

Then pass it directly:

```typescript
IACryModule.forRoot({
  storage: SEQUELIZE_STORAGE,
  storageRepository: PolicyStorageModel,
  cache: new MyCache(),
});
```

Next: [Advanced](advanced.md)
