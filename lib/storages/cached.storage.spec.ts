import 'reflect-metadata';
import { CachedStorage } from './cached.storage';
import { PolicyStorage } from '../interfaces/policy-storage';
import { Cache } from './cache/cache.interface';
import { CacheError } from './cache/cache.error';
import { Effect, PolicyInterface } from '../interfaces/policy';

function createMockCache(overrides: Partial<Cache> = {}): Cache {
  return {
    set: jest.fn().mockResolvedValue(true),
    has: jest.fn().mockResolvedValue(false),
    get: jest.fn().mockResolvedValue(''),
    remove: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function createMockStorage(
  overrides: Partial<PolicyStorage> = {},
): PolicyStorage {
  return {
    readonly: false,
    fetch: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(0),
    add: jest.fn().mockResolvedValue(0),
    purge: jest.fn().mockResolvedValue(0),
    fetchBySid: jest.fn().mockResolvedValue([]),
    saveBySid: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

describe('CachedStorage', () => {
  const principal = { entity: 'user', id: 1 };

  it('uses default options when none provided', () => {
    const cache = createMockCache();
    const innerStorage = createMockStorage();
    const storage = new CachedStorage(innerStorage, cache);

    expect(storage.options).toEqual({ expire: 3600, prefix: 'IACRY_PCACHE/' });
  });

  it('merges provided options with defaults', () => {
    const cache = createMockCache();
    const innerStorage = createMockStorage();
    const storage = new CachedStorage(innerStorage, cache, { expire: 7200 });

    expect(storage.options).toEqual({ expire: 7200, prefix: 'IACRY_PCACHE/' });
  });

  it('fetch returns cached data on cache hit', async () => {
    const policies: Array<string | PolicyInterface> = [
      { Effect: Effect.ALLOW, Action: 'book:read' },
    ];

    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockResolvedValue(JSON.stringify(policies)),
    });
    const innerStorage = createMockStorage();
    const storage = new CachedStorage(innerStorage, cache);

    const result = await storage.fetch(principal);

    expect(result).toEqual(policies);
    expect(cache.has).toHaveBeenCalledWith('IACRY_PCACHE/user/1');
    expect(cache.get).toHaveBeenCalledWith('IACRY_PCACHE/user/1');
    expect(innerStorage.fetch).not.toHaveBeenCalled();
  });

  it('fetch fetches from storage and populates cache on miss', async () => {
    const policies: Array<string | PolicyInterface> = ['admin:*'];

    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(false),
      set: jest.fn().mockResolvedValue(true),
    });
    const innerStorage = createMockStorage({
      fetch: jest.fn().mockResolvedValue(policies),
    });
    const storage = new CachedStorage(innerStorage, cache);

    const result = await storage.fetch(principal);

    expect(result).toEqual(policies);
    expect(innerStorage.fetch).toHaveBeenCalledWith(principal);
    expect(cache.set).toHaveBeenCalledWith(
      'IACRY_PCACHE/user/1',
      JSON.stringify(policies),
      3600,
    );
  });

  it('fetch throws CacheError when cache.set fails', async () => {
    const policies: Array<string | PolicyInterface> = ['some:policy'];

    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(false),
      set: jest.fn().mockResolvedValue(false),
    });
    const innerStorage = createMockStorage({
      fetch: jest.fn().mockResolvedValue(policies),
    });
    const storage = new CachedStorage(innerStorage, cache);

    await expect(storage.fetch(principal)).rejects.toThrow(CacheError);
    await expect(storage.fetch(principal)).rejects.toThrow(
      'Unable to store policy cache for key: IACRY_PCACHE/user/1',
    );
  });

  it('save purges cache then delegates to storage', async () => {
    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(true),
      remove: jest.fn().mockResolvedValue(true),
    });
    const innerStorage = createMockStorage({
      save: jest.fn().mockResolvedValue(2),
    });
    const storage = new CachedStorage(innerStorage, cache);

    const policies: Array<string | PolicyInterface> = ['p1', 'p2'];
    const count = await storage.save(principal, policies);

    expect(count).toBe(2);
    expect(cache.has).toHaveBeenCalledWith('IACRY_PCACHE/user/1');
    expect(cache.remove).toHaveBeenCalledWith('IACRY_PCACHE/user/1');
    expect(innerStorage.save).toHaveBeenCalledWith(principal, policies);
  });

  it('add purges cache then delegates to storage', async () => {
    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(true),
      remove: jest.fn().mockResolvedValue(true),
    });
    const innerStorage = createMockStorage({
      add: jest.fn().mockResolvedValue(3),
    });
    const storage = new CachedStorage(innerStorage, cache);

    const policies: Array<string | PolicyInterface> = ['a', 'b', 'c'];
    const count = await storage.add(principal, policies);

    expect(count).toBe(3);
    expect(cache.remove).toHaveBeenCalledWith('IACRY_PCACHE/user/1');
    expect(innerStorage.add).toHaveBeenCalledWith(principal, policies);
  });

  it('purge purges cache then delegates to storage', async () => {
    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(true),
      remove: jest.fn().mockResolvedValue(true),
    });
    const innerStorage = createMockStorage({
      purge: jest.fn().mockResolvedValue(5),
    });
    const storage = new CachedStorage(innerStorage, cache);

    const count = await storage.purge(principal);

    expect(count).toBe(5);
    expect(cache.remove).toHaveBeenCalledWith('IACRY_PCACHE/user/1');
    expect(innerStorage.purge).toHaveBeenCalledWith(principal);
  });

  it('fetchBySid returns cached data on cache hit', async () => {
    const policies: Array<string | PolicyInterface> = [
      { Effect: Effect.DENY, Action: 'book:delete' },
    ];

    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockResolvedValue(JSON.stringify(policies)),
    });
    const innerStorage = createMockStorage();
    const storage = new CachedStorage(innerStorage, cache);

    const result = await storage.fetchBySid('my-sid', principal);

    expect(result).toEqual(policies);
    expect(cache.has).toHaveBeenCalledWith('IACRY_PCACHE/user/1/my-sid');
    expect(cache.get).toHaveBeenCalledWith('IACRY_PCACHE/user/1/my-sid');
    expect(innerStorage.fetchBySid).not.toHaveBeenCalled();
  });

  it('fetchBySid fetches from storage on miss', async () => {
    const policies: Array<string | PolicyInterface> = ['sid:policy'];

    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(false),
      set: jest.fn().mockResolvedValue(true),
    });
    const innerStorage = createMockStorage({
      fetchBySid: jest.fn().mockResolvedValue(policies),
    });
    const storage = new CachedStorage(innerStorage, cache);

    const result = await storage.fetchBySid('my-sid', principal);

    expect(result).toEqual(policies);
    expect(innerStorage.fetchBySid).toHaveBeenCalledWith('my-sid', principal);
    expect(cache.set).toHaveBeenCalledWith(
      'IACRY_PCACHE/user/1/my-sid',
      JSON.stringify(policies),
      3600,
    );
  });

  it('saveBySid purges both principal and sid caches', async () => {
    const hasCallCount = { count: 0 };
    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(true),
      remove: jest.fn().mockResolvedValue(true),
    });
    const innerStorage = createMockStorage({
      saveBySid: jest.fn().mockResolvedValue(1),
    });
    const storage = new CachedStorage(innerStorage, cache);

    const policies: Array<string | PolicyInterface> = ['new:policy'];
    const count = await storage.saveBySid('my-sid', principal, policies);

    expect(count).toBe(1);
    expect(cache.remove).toHaveBeenCalledWith('IACRY_PCACHE/user/1');
    expect(cache.remove).toHaveBeenCalledWith('IACRY_PCACHE/user/1/my-sid');
    expect(innerStorage.saveBySid).toHaveBeenCalledWith(
      'my-sid',
      principal,
      policies,
    );
  });

  it('key generation: generates correct key format', async () => {
    const cache = createMockCache({
      has: jest.fn().mockResolvedValue(false),
      set: jest.fn().mockResolvedValue(true),
    });
    const innerStorage = createMockStorage({
      fetch: jest.fn().mockResolvedValue([]),
      fetchBySid: jest.fn().mockResolvedValue([]),
    });
    const storage = new CachedStorage(innerStorage, cache);

    // Without sid
    await storage.fetch(principal);
    expect(cache.has).toHaveBeenCalledWith('IACRY_PCACHE/user/1');

    // With sid
    await storage.fetchBySid('test-sid', principal);
    expect(cache.has).toHaveBeenCalledWith('IACRY_PCACHE/user/1/test-sid');
  });
});
