import 'reflect-metadata';
import { MultipleStorage } from './multiple.storage';
import { PolicyStorage } from '../interfaces/policy-storage';
import { Effect, PolicyInterface } from '../interfaces/policy';

function createMockStorage(
  readonly: boolean,
  overrides: Partial<PolicyStorage> = {},
): PolicyStorage {
  return {
    readonly,
    fetch: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(0),
    add: jest.fn().mockResolvedValue(0),
    purge: jest.fn().mockResolvedValue(0),
    fetchBySid: jest.fn().mockResolvedValue([]),
    saveBySid: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

describe('MultipleStorage', () => {
  const principal = { entity: 'user', id: 1 };

  it('readonly should be false', () => {
    const storage = new MultipleStorage();
    expect(storage.readonly).toBe(false);
  });

  it('fetch aggregates results from all storages', async () => {
    const policies1: Array<string | PolicyInterface> = [
      { Effect: Effect.ALLOW, Action: 'book:read' },
    ];
    const policies2: Array<string | PolicyInterface> = ['admin:*'];

    const readonlyStorage = createMockStorage(true, {
      fetch: jest.fn().mockResolvedValue(policies1),
    });
    const writableStorage = createMockStorage(false, {
      fetch: jest.fn().mockResolvedValue(policies2),
    });

    const storage = new MultipleStorage([readonlyStorage, writableStorage]);
    const result = await storage.fetch(principal);

    expect(result).toEqual([...policies1, ...policies2]);
    expect(readonlyStorage.fetch).toHaveBeenCalledWith(principal);
    expect(writableStorage.fetch).toHaveBeenCalledWith(principal);
  });

  it('save only delegates to non-readonly storages', async () => {
    const readonlyStorage = createMockStorage(true);
    const writableStorage = createMockStorage(false, {
      save: jest.fn().mockResolvedValue(2),
    });

    const storage = new MultipleStorage([readonlyStorage, writableStorage]);
    const policies: Array<string | PolicyInterface> = [
      'policy:one',
      'policy:two',
    ];

    const count = await storage.save(principal, policies);

    expect(count).toBe(2);
    expect(readonlyStorage.save).not.toHaveBeenCalled();
    expect(writableStorage.save).toHaveBeenCalledWith(principal, policies);
  });

  it('add only delegates to non-readonly storages', async () => {
    const readonlyStorage = createMockStorage(true);
    const writableStorage = createMockStorage(false, {
      add: jest.fn().mockResolvedValue(3),
    });

    const storage = new MultipleStorage([readonlyStorage, writableStorage]);
    const policies: Array<string | PolicyInterface> = ['a', 'b', 'c'];

    const count = await storage.add(principal, policies);

    expect(count).toBe(3);
    expect(readonlyStorage.add).not.toHaveBeenCalled();
    expect(writableStorage.add).toHaveBeenCalledWith(principal, policies);
  });

  it('purge only delegates to non-readonly storages', async () => {
    const readonlyStorage = createMockStorage(true);
    const writableStorage = createMockStorage(false, {
      purge: jest.fn().mockResolvedValue(5),
    });

    const storage = new MultipleStorage([readonlyStorage, writableStorage]);
    const count = await storage.purge(principal);

    expect(count).toBe(5);
    expect(readonlyStorage.purge).not.toHaveBeenCalled();
    expect(writableStorage.purge).toHaveBeenCalledWith(principal);
  });

  it('purge returns maximum count across storages', async () => {
    const writable1 = createMockStorage(false, {
      purge: jest.fn().mockResolvedValue(3),
    });
    const writable2 = createMockStorage(false, {
      purge: jest.fn().mockResolvedValue(7),
    });

    const storage = new MultipleStorage([writable1, writable2]);
    const count = await storage.purge(principal);

    expect(count).toBe(7);
  });

  it('fetchBySid aggregates from all storages', async () => {
    const policies1: Array<string | PolicyInterface> = [
      { Effect: Effect.DENY, Action: 'book:delete' },
    ];
    const policies2: Array<string | PolicyInterface> = ['user:write'];

    const readonlyStorage = createMockStorage(true, {
      fetchBySid: jest.fn().mockResolvedValue(policies1),
    });
    const writableStorage = createMockStorage(false, {
      fetchBySid: jest.fn().mockResolvedValue(policies2),
    });

    const storage = new MultipleStorage([readonlyStorage, writableStorage]);
    const result = await storage.fetchBySid('test-sid', principal);

    expect(result).toEqual([...policies1, ...policies2]);
    expect(readonlyStorage.fetchBySid).toHaveBeenCalledWith(
      'test-sid',
      principal,
    );
    expect(writableStorage.fetchBySid).toHaveBeenCalledWith(
      'test-sid',
      principal,
    );
  });

  it('saveBySid only delegates to non-readonly storages', async () => {
    const readonlyStorage = createMockStorage(true);
    const writableStorage = createMockStorage(false, {
      saveBySid: jest.fn().mockResolvedValue(2),
    });

    const storage = new MultipleStorage([readonlyStorage, writableStorage]);
    const policies: Array<string | PolicyInterface> = ['p1', 'p2'];

    const count = await storage.saveBySid('test-sid', principal, policies);

    expect(count).toBe(2);
    expect(readonlyStorage.saveBySid).not.toHaveBeenCalled();
    expect(writableStorage.saveBySid).toHaveBeenCalledWith(
      'test-sid',
      principal,
      policies,
    );
  });
});
